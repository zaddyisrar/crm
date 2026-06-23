"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Search,
  CalendarDays,
  BadgeDollarSign,
  UserCheck,
  RefreshCcw,
  TrendingDown,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";
import { sheetsPost } from "@/lib/sheetsApi";

function getCurrentMonthKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
}

function makeDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeDate(value) {
  if (!value) return "";
  const raw = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return makeDateKey(date);

  return raw;
}

function normalizeTime(value) {
  if (!value) return "-";
  const raw = String(value).trim();

  if (!raw || raw === "-") return "-";

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return raw;
}

function parseTimeToMinutes(value) {
  const raw = normalizeTime(value);
  if (!raw || raw === "-") return null;

  const match = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const ampm = match[3].toUpperCase();

  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  return hour * 60 + minute;
}

function classifyAttendance(loginTime, entryTime = "07:00 PM") {
  const loginMinutes = parseTimeToMinutes(loginTime);
  const entryMinutes = parseTimeToMinutes(entryTime);

  if (loginMinutes === null || entryMinutes === null) return "onTime";

  if (loginMinutes > entryMinutes + 60) return "halfDay";
  if (loginMinutes > entryMinutes + 10) return "late";

  return "onTime";
}

function isWeekend(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  const day = date.getDay();
  return day === 0 || day === 6;
}

function getWorkingDaysInMonth(monthKey, holidays = []) {
  const [year, month] = monthKey.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  const holidaySet = new Set(holidays.map((holiday) => normalizeDate(holiday.Date)));

  const days = [];

  for (let day = 1; day <= lastDay; day++) {
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    if (isWeekend(dateKey)) continue;
    if (holidaySet.has(dateKey)) continue;

    days.push(dateKey);
  }

  return days;
}

function formatPKR(value) {
  return `${Math.round(Number(value || 0)).toLocaleString()} PKR`;
}

export default function AnalyticsPage() {
  const [searchAgent, setSearchAgent] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());

  const [agentRows, setAgentRows] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [commissionRows, setCommissionRows] = useState([]);
  const [holidayRows, setHolidayRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics(showLoader = false) {
    try {
      if (showLoader) setLoading(true);
      setError("");

      const [agentsResponse, attendanceResponse, commissionsResponse, holidaysResponse] =
        await Promise.all([
          sheetsPost({ action: "getAgents" }),
          sheetsPost({ action: "getAttendance" }),
          sheetsPost({ action: "getCommissions" }),
          sheetsPost({ action: "getHolidays" }),
        ]);

      setAgentRows(agentsResponse?.data || []);
      setAttendanceRows(attendanceResponse?.data || []);
      setCommissionRows(commissionsResponse?.data || []);
      setHolidayRows(holidaysResponse?.data || []);
    } catch (err) {
      console.error("Admin analytics sheet read failed:", err);
      setError(err?.message || "Failed to load analytics from Google Sheets");
      setAgentRows([]);
      setAttendanceRows([]);
      setCommissionRows([]);
      setHolidayRows([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics(true);

    const interval = setInterval(() => {
      loadAnalytics(false);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const workingDays = useMemo(() => {
    return getWorkingDaysInMonth(selectedMonth, holidayRows);
  }, [selectedMonth, holidayRows]);

  const payrollRows = useMemo(() => {
    const search = searchAgent.toLowerCase().trim();

    const agents = agentRows
      .filter((user) => {
        const role = String(user.Role || "").toLowerCase();
        const status = String(user.Status || "Active").toLowerCase();
        return role === "agent" && status !== "inactive";
      })
      .filter((agent) => {
        if (!search) return true;

        return (
          String(agent.AgentName || "").toLowerCase().includes(search) ||
          String(agent.AgentID || "").toLowerCase().includes(search)
        );
      });

    const monthAttendance = attendanceRows.filter((row) =>
      normalizeDate(row.Date).startsWith(selectedMonth)
    );

    const monthCommissions = commissionRows.filter((row) =>
      normalizeDate(row.Date).startsWith(selectedMonth)
    );

    return agents.map((agent) => {
      const agentId = String(agent.AgentID || "").toUpperCase();
      const salary = Number(agent.Salary || 0);
      const entryTime = agent.EntryTime || "07:00 PM";
      const totalDays = workingDays.length;
      const dailySalary = totalDays > 0 ? salary / totalDays : 0;

      const agentAttendance = monthAttendance.filter(
        (row) => String(row.AgentID || "").toUpperCase() === agentId
      );

      const attendanceByDate = {};

      agentAttendance.forEach((row) => {
        const date = normalizeDate(row.Date);
        if (!date) return;
        if (!workingDays.includes(date)) return;
        if (!attendanceByDate[date]) attendanceByDate[date] = row;
      });

      let activeDays = 0;
      let late = 0;
      let onTime = 0;
      let halfDays = 0;
      let absent = 0;

      workingDays.forEach((date) => {
        const row = attendanceByDate[date];

        if (!row) {
          absent++;
          return;
        }

        activeDays++;

        const status = classifyAttendance(row.LoginTime, entryTime);

        if (status === "halfDay") halfDays++;
        else if (status === "late") late++;
        else onTime++;
      });

      const commission = monthCommissions
        .filter((row) => String(row.AgentID || "").toUpperCase() === agentId)
        .reduce((sum, row) => sum + Number(row.Commission || 0), 0);

      const lateDeduction = late * (dailySalary / 3);
      const halfDayDeduction = halfDays * (dailySalary / 2);
      const absentDeduction = absent * dailySalary;
      const deduction = lateDeduction + halfDayDeduction + absentDeduction;
      const finalSalary = salary - deduction + commission;

      return {
        agentId: agent.AgentID || "-",
        agentName: agent.AgentName || "Agent",
        baseSalary: salary,
        entryTime,
        totalDays,
        activeDays,
        late,
        onTime,
        halfDays,
        absent,
        commission,
        deduction,
        finalSalary,
        dailySalary,
      };
    });
  }, [
    agentRows,
    attendanceRows,
    commissionRows,
    searchAgent,
    selectedMonth,
    workingDays,
  ]);

  const summary = useMemo(() => {
    return payrollRows.reduce(
      (acc, row) => {
        acc.totalBase += Number(row.baseSalary || 0);
        acc.totalCommission += Number(row.commission || 0);
        acc.totalDeductions += Number(row.deduction || 0);
        acc.netPayroll += Number(row.finalSalary || 0);
        acc.totalActiveDays += Number(row.activeDays || 0);
        acc.totalDays += Number(row.totalDays || 0);
        return acc;
      },
      {
        totalBase: 0,
        totalCommission: 0,
        totalDeductions: 0,
        netPayroll: 0,
        totalActiveDays: 0,
        totalDays: 0,
      }
    );
  }, [payrollRows]);

  const attendanceRate =
    summary.totalDays > 0
      ? Math.round((summary.totalActiveDays / summary.totalDays) * 100)
      : 0;

  return (
    <AdminShell
      title="Payroll Center"
      subtitle="Final salary engine with attendance, late, half day, holidays, and commission."
    >
      <section className="rounded-2xl border border-cyan-300/15 bg-[#071018]/80 p-5 backdrop-blur-xl">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
              Admin Payroll
            </p>

            <h3 className="mt-1 text-lg font-semibold text-white">
              Monthly Salary Calculation
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Weekends and admin holidays are excluded. EntryTime controls late and half day.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={searchAgent}
                onChange={(e) => setSearchAgent(e.target.value)}
                placeholder="Search agent name or ID..."
                className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/35"
              />
            </div>

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-300/35"
            />

            <button
              onClick={() => loadAnalytics(true)}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-sm font-bold text-cyan-200 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SalaryMiniCard
            label="Total Payroll"
            value={loading ? "..." : formatPKR(summary.totalBase)}
            icon={Wallet}
            tone="text-cyan-300"
          />

          <SalaryMiniCard
            label="Total Commission"
            value={loading ? "..." : formatPKR(summary.totalCommission)}
            icon={BadgeDollarSign}
            tone="text-emerald-300"
          />

          <SalaryMiniCard
            label="Total Deductions"
            value={loading ? "..." : formatPKR(summary.totalDeductions)}
            icon={TrendingDown}
            tone="text-red-300"
          />

          <SalaryMiniCard
            label="Net Payroll"
            value={loading ? "..." : formatPKR(summary.netPayroll)}
            icon={BadgeDollarSign}
            tone="text-yellow-300"
          />

          <SalaryMiniCard
            label="Attendance Rate"
            value={loading ? "..." : `${attendanceRate}%`}
            icon={UserCheck}
            tone="text-purple-300"
          />
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[1350px] text-left text-sm">
            <thead className="bg-white/[0.03] text-slate-400">
              <tr>
                <th className="px-4 py-4 font-medium">Agent</th>
                <th className="px-4 py-4 font-medium">Total Days</th>
                <th className="px-4 py-4 font-medium">Active Days</th>
                <th className="px-4 py-4 font-medium">Late</th>
                <th className="px-4 py-4 font-medium">On Time</th>
                <th className="px-4 py-4 font-medium">Half Days</th>
                <th className="px-4 py-4 font-medium">Absent</th>
                <th className="px-4 py-4 font-medium">Commission</th>
                <th className="px-4 py-4 font-medium">Deduction</th>
                <th className="px-4 py-4 font-medium">Final Salary</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-slate-500">
                    Loading payroll center...
                  </td>
                </tr>
              ) : payrollRows.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-slate-500">
                    No payroll data found.
                  </td>
                </tr>
              ) : (
                payrollRows.map((agent) => (
                  <tr key={agent.agentId} className="text-slate-300">
                    <td className="px-4 py-4">
                      <p className="font-bold text-white">{agent.agentName}</p>
                      <p className="text-xs text-cyan-300">{agent.agentId}</p>
                      <p className="text-xs text-slate-500">
                        Entry {agent.entryTime} · Base {formatPKR(agent.baseSalary)}
                      </p>
                      <p className="text-xs text-slate-600">
                        1 day = {formatPKR(agent.dailySalary)}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-white">{agent.totalDays}</td>
                    <td className="px-4 py-4 text-green-300">{agent.activeDays}</td>
                    <td className="px-4 py-4 text-yellow-300">{agent.late}</td>
                    <td className="px-4 py-4 text-emerald-300">{agent.onTime}</td>
                    <td className="px-4 py-4 text-orange-300">{agent.halfDays}</td>
                    <td className="px-4 py-4 text-red-300">{agent.absent}</td>
                    <td className="px-4 py-4 text-cyan-300">
                      {formatPKR(agent.commission)}
                    </td>
                    <td className="px-4 py-4 text-red-300">
                      {formatPKR(agent.deduction)}
                    </td>
                    <td className="px-4 py-4 font-black text-white">
                      {formatPKR(agent.finalSalary)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-2xl border border-yellow-300/15 bg-yellow-300/[0.04] px-4 py-3 text-xs leading-relaxed text-slate-400">
          Salary rule: Late = daily salary / 3. Half day = daily salary / 2. Absent = full daily salary. Final salary = base salary - deductions + commission.
        </div>
      </section>
    </AdminShell>
  );
}

function SalaryMiniCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className={`rounded-xl bg-white/5 p-2 ${tone}`}>
          <Icon size={17} />
        </div>
      </div>

      <p className="text-xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}