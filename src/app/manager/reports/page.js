"use client";

import { useEffect, useMemo, useState } from "react";
import ManagerShell from "@/components/manager/ManagerShell";
import { sheetsPost } from "@/lib/sheetsApi";
import {
  Banknote,
  CalendarCheck,
  FileBarChart,
  RefreshCcw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

function makeDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentMonthKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function normalizeDate(value) {
  if (!value) return "";
  const raw = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return makeDateKey(date);
  }

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
  return `PKR ${Math.round(Number(value || 0)).toLocaleString()}`;
}

export default function ManagerReportsPage() {
  const [agentRows, setAgentRows] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [leadRows, setLeadRows] = useState([]);
  const [commissionRows, setCommissionRows] = useState([]);
  const [holidayRows, setHolidayRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReports(showLoader = false) {
    try {
      if (showLoader) setLoading(true);
      setError("");

      const [
        agentsResponse,
        attendanceResponse,
        leadsResponse,
        commissionsResponse,
        holidaysResponse,
      ] = await Promise.all([
        sheetsPost({ action: "getAgents" }),
        sheetsPost({ action: "getAttendance" }),
        sheetsPost({ action: "getLeads" }),
        sheetsPost({ action: "getCommissions" }),
        sheetsPost({ action: "getHolidays" }),
      ]);

      setAgentRows(agentsResponse?.data || []);
      setAttendanceRows(attendanceResponse?.data || []);
      setLeadRows(leadsResponse?.data || []);
      setCommissionRows(commissionsResponse?.data || []);
      setHolidayRows(holidaysResponse?.data || []);
    } catch (err) {
      console.error("Manager reports sheet read failed:", err);
      setError(err?.message || "Failed to load reports from Google Sheets");
      setAgentRows([]);
      setAttendanceRows([]);
      setLeadRows([]);
      setCommissionRows([]);
      setHolidayRows([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    loadReports(true);

    const interval = setInterval(() => {
      loadReports(false);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const monthKey = getCurrentMonthKey();

  const workingDays = useMemo(() => {
    return getWorkingDaysInMonth(monthKey, holidayRows);
  }, [monthKey, holidayRows]);

  const payrollRows = useMemo(() => {
    const agents = agentRows.filter((user) => {
      const role = String(user.Role || "").toLowerCase();
      const status = String(user.Status || "Active").toLowerCase();
      return role === "agent" && status !== "inactive";
    });

    const monthAttendance = attendanceRows.filter((row) =>
      normalizeDate(row.Date).startsWith(monthKey)
    );

    const monthCommissions = commissionRows.filter((row) =>
      normalizeDate(row.Date).startsWith(monthKey)
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
  }, [agentRows, attendanceRows, commissionRows, monthKey, workingDays]);

  const totals = useMemo(() => {
    return payrollRows.reduce(
      (acc, row) => {
        acc.totalBase += Number(row.baseSalary || 0);
        acc.totalCommission += Number(row.commission || 0);
        acc.totalDeduction += Number(row.deduction || 0);
        acc.finalPayroll += Number(row.finalSalary || 0);
        acc.activeDays += Number(row.activeDays || 0);
        acc.totalDays += Number(row.totalDays || 0);
        return acc;
      },
      {
        totalBase: 0,
        totalCommission: 0,
        totalDeduction: 0,
        finalPayroll: 0,
        activeDays: 0,
        totalDays: 0,
      }
    );
  }, [payrollRows]);

  const attendanceRate =
    totals.totalDays > 0 ? Math.round((totals.activeDays / totals.totalDays) * 100) : 0;

  return (
    <ManagerShell>
      {error && (
        <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <button
          onClick={() => loadReports(true)}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-200 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <ReportCard
          title="Final Payroll"
          value={loading ? "..." : formatPKR(totals.finalPayroll)}
          subtitle="Salary - cuts + commission"
          icon={Banknote}
          tone="cyan"
        />

        <ReportCard
          title="Total Commission"
          value={loading ? "..." : formatPKR(totals.totalCommission)}
          subtitle="Approved lead commission"
          icon={TrendingUp}
          tone="emerald"
        />

        <ReportCard
          title="Total Deductions"
          value={loading ? "..." : formatPKR(totals.totalDeduction)}
          subtitle="Late + half day + absent"
          icon={TrendingDown}
          tone="red"
        />

        <ReportCard
          title="Attendance Rate"
          value={loading ? "..." : `${attendanceRate}%`}
          subtitle="Active days / total days"
          icon={CalendarCheck}
          tone="yellow"
        />

        <ReportCard
          title="Working Days"
          value={loading ? "..." : workingDays.length}
          subtitle={`${monthKey} minus weekends/holidays`}
          icon={FileBarChart}
          tone="purple"
        />
      </div>

      <section className="mt-5 rounded-[1.5rem] border border-cyan-300/15 bg-white/[0.03] p-4 backdrop-blur-xl">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-300">
              Payroll Reports
            </p>

            <h2 className="mt-1 text-xl font-black text-white">
              Monthly Salary Engine
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Uses EntryTime, holidays, commission, late, half day and absent deductions.
            </p>
          </div>

          <div className="w-fit rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-bold text-cyan-300">
            {monthKey} · {workingDays.length} Working Days
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[1350px] text-left text-sm">
            <thead className="bg-white/[0.04] text-[11px] uppercase tracking-[0.2em] text-cyan-300">
              <tr>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Total Days</th>
                <th className="px-4 py-3">Active Days</th>
                <th className="px-4 py-3">Late</th>
                <th className="px-4 py-3">On Time</th>
                <th className="px-4 py-3">Half Days</th>
                <th className="px-4 py-3">Absent</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3">Deduction</th>
                <th className="px-4 py-3">Final Salary</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-4 py-7 text-center text-slate-500">
                    Loading salary reports...
                  </td>
                </tr>
              ) : payrollRows.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-7 text-center text-slate-500">
                    No payroll reports found.
                  </td>
                </tr>
              ) : (
                payrollRows.map((agent) => (
                  <tr key={agent.agentId} className="border-t border-white/10 text-slate-300">
                    <td className="px-4 py-3">
                      <p className="font-bold text-white">{agent.agentName}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {agent.agentId} · Entry {agent.entryTime}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-600">
                        Base {formatPKR(agent.baseSalary)} · 1 day {formatPKR(agent.dailySalary)}
                      </p>
                    </td>

                    <td className="px-4 py-3 font-bold text-white">{agent.totalDays}</td>
                    <td className="px-4 py-3 text-emerald-300">{agent.activeDays}</td>
                    <td className="px-4 py-3 text-yellow-300">{agent.late}</td>
                    <td className="px-4 py-3 text-emerald-300">{agent.onTime}</td>
                    <td className="px-4 py-3 text-orange-300">{agent.halfDays}</td>
                    <td className="px-4 py-3 text-red-300">{agent.absent}</td>
                    <td className="px-4 py-3 text-cyan-300">{formatPKR(agent.commission)}</td>
                    <td className="px-4 py-3 text-red-300">{formatPKR(agent.deduction)}</td>
                    <td className="px-4 py-3">
                      <p className="font-black text-white">{formatPKR(agent.finalSalary)}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </ManagerShell>
  );
}

function ReportCard({ title, value, subtitle, icon: Icon, tone }) {
  const tones = {
    emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-300",
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-300",
    yellow: "border-yellow-300/20 bg-yellow-300/10 text-yellow-300",
    purple: "border-purple-300/20 bg-purple-300/10 text-purple-300",
    red: "border-red-300/20 bg-red-300/10 text-red-300",
  };

  return (
    <div className="rounded-[1.4rem] border border-cyan-300/15 bg-white/[0.03] p-4 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
          {title}
        </p>

        <div className={`rounded-xl border p-2 ${tones[tone]}`}>
          <Icon size={17} />
        </div>
      </div>

      <h3 className="text-2xl font-black leading-none text-white">{value}</h3>
      <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}