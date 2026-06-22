"use client";

import { useEffect, useMemo, useState } from "react";
import ManagerShell from "@/components/manager/ManagerShell";
import { sheetsPost } from "@/lib/sheetsApi";
import {
  CalendarCheck,
  FileBarChart,
  Banknote,
  Trophy,
  TrendingUp,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";

const SHIFT_START_HOUR = 19;
const LATE_AFTER_MINUTE = 10;

function makeDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayKey() {
  return makeDateKey(new Date());
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

function getTimeParts(value) {
  if (!value) return null;

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return {
      hour: date.getHours(),
      minute: date.getMinutes(),
    };
  }

  const raw = String(value).trim();
  const match = raw.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);

  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const ampm = match[3]?.toUpperCase();

  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  return { hour, minute };
}

function isLate(loginTime) {
  const parts = getTimeParts(loginTime);
  if (!parts) return false;

  if (parts.hour > SHIFT_START_HOUR) return true;

  if (parts.hour === SHIFT_START_HOUR && parts.minute > LATE_AFTER_MINUTE) {
    return true;
  }

  return false;
}

function isWeekend(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  const day = date.getDay();
  return day === 0 || day === 6;
}

function getWorkingDaysInMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();

  let count = 0;

  for (let day = 1; day <= lastDay; day++) {
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    if (!isWeekend(dateKey)) count++;
  }

  return count;
}

function getWorkingDaysElapsed(monthKey, todayKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const todayDay = Number(todayKey.split("-")[2]);
  const lastDay = new Date(year, month, 0).getDate();
  const endDay = Math.min(todayDay, lastDay);

  let count = 0;

  for (let day = 1; day <= endDay; day++) {
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    if (!isWeekend(dateKey)) count++;
  }

  return count;
}

function formatPKR(value) {
  return `PKR ${Math.round(Number(value || 0)).toLocaleString()}`;
}

export default function ManagerReportsPage() {
  const [agentRows, setAgentRows] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [leadRows, setLeadRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReports(showLoader = false) {
    try {
      if (showLoader) setLoading(true);

      setError("");

      const [agentsResponse, attendanceResponse, leadsResponse] =
        await Promise.all([
          sheetsPost({ action: "getAgents" }),
          sheetsPost({ action: "getAttendance" }),
          sheetsPost({ action: "getLeads" }),
        ]);

      setAgentRows(agentsResponse?.data || []);
      setAttendanceRows(attendanceResponse?.data || []);
      setLeadRows(leadsResponse?.data || []);
    } catch (err) {
      console.error("Manager reports sheet read failed:", err);
      setError(err?.message || "Failed to load reports from Google Sheets");
      setAgentRows([]);
      setAttendanceRows([]);
      setLeadRows([]);
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

  const today = getTodayKey();
  const monthKey = getCurrentMonthKey();

  const workingDaysInMonth = useMemo(
    () => getWorkingDaysInMonth(monthKey),
    [monthKey]
  );

  const workingDaysElapsed = useMemo(
    () => getWorkingDaysElapsed(monthKey, today),
    [monthKey, today]
  );

  const agentReports = useMemo(() => {
    const agents = agentRows.filter((user) => {
      const role = String(user.Role || "").toLowerCase();
      const status = String(user.Status || "Active").toLowerCase();
      return role === "agent" && status !== "inactive";
    });

    const monthAttendance = attendanceRows.filter((row) =>
      normalizeDate(row.Date).startsWith(monthKey)
    );

    const monthLeads = leadRows.filter((lead) =>
      normalizeDate(lead.Date).startsWith(monthKey)
    );

    return agents.map((agent) => {
      const agentId = String(agent.AgentID || "").toUpperCase();
      const monthlySalary = Number(agent.Salary || 0);
      const oneDaySalary =
        workingDaysInMonth > 0 ? monthlySalary / workingDaysInMonth : 0;

      const agentAttendanceRows = monthAttendance.filter(
        (row) => String(row.AgentID || "").toUpperCase() === agentId
      );

      const attendedDateMap = new Map();

      agentAttendanceRows.forEach((row) => {
        const dateKey = normalizeDate(row.Date);
        if (!dateKey || isWeekend(dateKey)) return;

        if (!attendedDateMap.has(dateKey)) {
          attendedDateMap.set(dateKey, row);
        }
      });

      const attendanceDays = [...attendedDateMap.values()];

      const lateDays = attendanceDays.filter((row) =>
        isLate(row.LoginTime)
      ).length;

      const totalAttendance = attendanceDays.length;
      const absentDays = Math.max(0, workingDaysElapsed - totalAttendance);

      const agentLeads = monthLeads.filter(
        (lead) => String(lead.AgentID || "").toUpperCase() === agentId
      );

      const approved = agentLeads.filter(
        (lead) =>
          String(lead.ApprovalStatus || "Pending").toLowerCase() === "approved"
      ).length;

      const absentCut = absentDays * oneDaySalary;
      const lateCut = lateDays * (oneDaySalary / 3);
      const totalCut = absentCut + lateCut;
      const payableSalary = Math.max(0, monthlySalary - totalCut);

      return {
        name: agent.AgentName || "Agent",
        id: agent.AgentID || "-",
        attendance: totalAttendance,
        lateDays,
        absentDays,
        leads: agentLeads.length,
        approved,
        monthlySalary,
        payableSalary,
        oneDaySalary,
        totalCut,
      };
    });
  }, [
    agentRows,
    attendanceRows,
    leadRows,
    monthKey,
    workingDaysElapsed,
    workingDaysInMonth,
  ]);

  const totalAttendanceThisMonth = agentReports.reduce(
    (sum, agent) => sum + agent.attendance,
    0
  );

  const leadsThisMonth = agentReports.reduce(
    (sum, agent) => sum + agent.leads,
    0
  );

  const approvedLeadsThisMonth = agentReports.reduce(
    (sum, agent) => sum + agent.approved,
    0
  );

  const salaryDue = agentReports.reduce(
    (sum, agent) => sum + agent.payableSalary,
    0
  );

  const topAgents = useMemo(() => {
    return [...agentReports]
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 3)
      .map((agent, index) => ({
        rank: `#${index + 1}`,
        name: agent.name,
        metric: `${agent.leads} Leads`,
      }));
  }, [agentReports]);

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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReportCard
          title="Attendance This Month"
          value={loading ? "..." : totalAttendanceThisMonth}
          subtitle="Present + late days"
          icon={CalendarCheck}
          tone="emerald"
        />

        <ReportCard
          title="Leads This Month"
          value={loading ? "..." : leadsThisMonth}
          subtitle="Monthly submitted leads"
          icon={FileBarChart}
          tone="cyan"
        />

        <ReportCard
          title="Approved Leads This Month"
          value={loading ? "..." : approvedLeadsThisMonth}
          subtitle="Monthly approved leads"
          icon={TrendingUp}
          tone="yellow"
        />

        <ReportCard
          title="Salary Preview"
          value={loading ? "..." : formatPKR(salaryDue)}
          subtitle="After cuts"
          icon={Banknote}
          tone="purple"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_0.65fr]">
        <section className="rounded-[1.5rem] border border-cyan-300/15 bg-white/[0.03] p-4 backdrop-blur-xl">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-300">
                Agent Reports
              </p>

              <h2 className="mt-1 text-xl font-black text-white">
                Monthly Agent Summary
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Late cuts 1/3 day. Absent cuts 1 full day.
              </p>
            </div>

            <div className="w-fit rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-bold text-cyan-300">
              {monthKey} · {workingDaysInMonth} Working Days
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-white/[0.04] text-[11px] uppercase tracking-[0.2em] text-cyan-300">
                <tr>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Attendance</th>
                  <th className="px-4 py-3">Leads</th>
                  <th className="px-4 py-3">Salary</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-7 text-center text-slate-500"
                    >
                      Loading reports from Google Sheets...
                    </td>
                  </tr>
                ) : agentReports.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-7 text-center text-slate-500"
                    >
                      No agent reports found.
                    </td>
                  </tr>
                ) : (
                  agentReports.map((agent) => (
                    <tr
                      key={agent.id}
                      className="border-t border-white/10 text-slate-300"
                    >
                      <td className="px-4 py-3">
                        <p className="font-bold text-white">{agent.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {agent.id}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge tone="emerald">Total {agent.attendance}</Badge>
                          <Badge tone="yellow">Late {agent.lateDays}</Badge>
                          <Badge tone="red">Absent {agent.absentDays}</Badge>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-bold text-white">
                          {agent.leads} Leads
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {agent.approved} approved
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-black text-white">
                          {formatPKR(agent.payableSalary)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Base {formatPKR(agent.monthlySalary)} · Cut{" "}
                          {formatPKR(agent.totalCut)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-600">
                          1 day = {formatPKR(agent.oneDaySalary)}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-5">
          <div className="rounded-[1.5rem] border border-cyan-300/15 bg-white/[0.03] p-4 backdrop-blur-xl">
            <div className="mb-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-300">
                Top Agents
              </p>

              <h2 className="mt-1 text-lg font-black text-white">
                Monthly Ranking
              </h2>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-500">
                  Loading rankings...
                </div>
              ) : topAgents.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-500">
                  No rankings available.
                </div>
              ) : (
                topAgents.map((agent) => (
                  <div
                    key={agent.rank}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-xs font-black text-cyan-300">
                        {agent.rank}
                      </div>

                      <div>
                        <p className="text-sm font-bold text-white">
                          {agent.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {agent.metric}
                        </p>
                      </div>
                    </div>

                    <Trophy size={16} className="text-yellow-300" />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-yellow-300/15 bg-yellow-300/[0.04] p-4 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-1 text-yellow-300" size={18} />

              <div>
                <h3 className="text-sm font-black text-white">Salary Rule</h3>

                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Saturday and Sunday are ignored. Future working days are not
                  counted as absent.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ManagerShell>
  );
}

function ReportCard({ title, value, subtitle, icon: Icon, tone }) {
  const tones = {
    emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-300",
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-300",
    yellow: "border-yellow-300/20 bg-yellow-300/10 text-yellow-300",
    purple: "border-purple-300/20 bg-purple-300/10 text-purple-300",
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

function Badge({ children, tone }) {
  const tones = {
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    yellow: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
    red: "border-red-400/20 bg-red-400/10 text-red-300",
  };

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}