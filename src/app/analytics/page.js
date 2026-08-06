"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  RefreshCcw,
  TimerOff,
  Users,
  XCircle,
} from "lucide-react";

import PageShell from "@/components/crm/PageShell";
import { sheetsPost } from "@/lib/sheetsApi";

function getTodayKey() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getReadableDate() {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeDate(value) {
  if (!value) return "";

  const raw = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
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

  if (loginMinutes === null || entryMinutes === null) return "On Time";

  if (loginMinutes > entryMinutes + 60) return "Half Day";
  if (loginMinutes > entryMinutes + 10) return "Late";

  return "On Time";
}

function formatMinutes(value) {
  const minutes = Number(value || 0);

  if (!minutes || minutes < 0) return "0m";

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (!hrs) return `${mins}m`;

  return `${hrs}h ${mins}m`;
}

function convertLead(lead, index) {
  return {
    id: `${lead.AgentID || "agent"}-${lead.Phone || "phone"}-${
      lead.Date || "date"
    }-${lead.Time || "time"}-${index}`,
    date: normalizeDate(lead.Date),
    time: normalizeTime(lead.Time),
    agentId: lead.AgentID || "",
    agentName: lead.AgentName || "",
    leadName: lead.LeadName || "",
    company: lead.Company || "",
    phone: lead.Phone || "",
    email: lead.Email || "",
    address: lead.Address || "",
    note: lead.Note || "",
    approvalStatus: lead.ApprovalStatus || "Pending",
    approvedBy: lead.ApprovedBy || "-",
    approvedAt: lead.ApprovedAt || "-",
  };
}

function convertAttendance(row, index, entryTime) {
  const date = normalizeDate(row.Date);
  const loginTime = normalizeTime(row.LoginTime);
  const dayStatus = classifyAttendance(loginTime, entryTime);

  return {
    id: `${row.AgentID || "agent"}-${date}-${index}`,
    date,
    agentId: row.AgentID || "",
    agentName: row.AgentName || "",
    loginTime,
    logoutTime: normalizeTime(row.LogoutTime),
    status: row.Status || "Active",
    dayStatus,
    inactiveMinutes: Number(row.TotalInactiveMinutes || 0),
    screenMinutes: Number(row.TotalScreenMinutes || 0),
    lastAutoLogout: normalizeTime(row.LastAutoLogout),
    lastResumeTime: normalizeTime(row.LastResumeTime),
  };
}

export default function AgentAnalyticsPage() {
  const [agentId, setAgentId] = useState("");
  const [agentName, setAgentName] = useState("Agent");
  const [entryTime, setEntryTime] = useState("07:00 PM");

  const [leads, setLeads] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentMonthKey = getTodayKey().slice(0, 7);

  async function loadAnalytics(userId = agentId) {
    if (!userId) return;

    try {
      setLoading(true);
      setError("");

      const [agentsResponse, leadsResponse, attendanceResponse] =
        await Promise.all([
          sheetsPost({ action: "getAgents" }),
          sheetsPost({ action: "getLeads" }),
          sheetsPost({ action: "getAttendance" }),
        ]);

      const agents = agentsResponse.data || [];
      const sheetLeads = leadsResponse.data || [];
      const sheetAttendance = attendanceResponse.data || [];

      const currentAgent = agents.find(
        (agent) =>
          String(agent.AgentID || "").toUpperCase() ===
          String(userId || "").toUpperCase()
      );

      const nextEntryTime = currentAgent?.EntryTime || "07:00 PM";

      setEntryTime(nextEntryTime);

      const agentLeads = sheetLeads
        .filter(
          (lead) =>
            String(lead.AgentID || "").toUpperCase() ===
            String(userId || "").toUpperCase()
        )
        .map(convertLead)
        .reverse();

      const agentAttendance = sheetAttendance
        .filter(
          (row) =>
            String(row.AgentID || "").toUpperCase() ===
            String(userId || "").toUpperCase()
        )
        .map((row, index) => convertAttendance(row, index, nextEntryTime))
        .reverse();

      setLeads(agentLeads);
      setAttendance(agentAttendance);
    } catch (err) {
      console.error("Agent analytics load failed:", err);
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const userId = localStorage.getItem("crmUserId");
    const userName = localStorage.getItem("crmUserName");

    if (!userId) return;

    setAgentId(userId);
    setAgentName(userName || "Agent");

    loadAnalytics(userId);
  }, []);

  const monthlyLeads = useMemo(() => {
    return leads.filter((lead) => lead.date.slice(0, 7) === currentMonthKey);
  }, [leads, currentMonthKey]);

  const monthlyAttendance = useMemo(() => {
    return attendance.filter((row) => row.date.slice(0, 7) === currentMonthKey);
  }, [attendance, currentMonthKey]);

  const stats = useMemo(() => {
    const approved = monthlyLeads.filter(
      (lead) => String(lead.approvalStatus).toLowerCase() === "approved"
    ).length;

    const pending = monthlyLeads.filter(
      (lead) => String(lead.approvalStatus).toLowerCase() === "pending"
    ).length;

    const rejected = monthlyLeads.filter(
      (lead) => String(lead.approvalStatus).toLowerCase() === "rejected"
    ).length;

    const onTime = monthlyAttendance.filter(
      (row) => row.dayStatus === "On Time"
    ).length;

    const late = monthlyAttendance.filter((row) => row.dayStatus === "Late")
      .length;

    const halfDay = monthlyAttendance.filter(
      (row) => row.dayStatus === "Half Day"
    ).length;

    const activeDays = monthlyAttendance.length;

    const screenMinutes = monthlyAttendance.reduce(
      (sum, row) => sum + Number(row.screenMinutes || 0),
      0
    );

    const inactiveMinutes = monthlyAttendance.reduce(
      (sum, row) => sum + Number(row.inactiveMinutes || 0),
      0
    );

    return {
      totalLeads: monthlyLeads.length,
      approved,
      pending,
      rejected,
      activeDays,
      onTime,
      late,
      halfDay,
      screenMinutes,
      inactiveMinutes,
    };
  }, [monthlyLeads, monthlyAttendance]);

  const attendanceTotal = Math.max(1, stats.onTime + stats.late + stats.halfDay);

  const approvedPercent = stats.totalLeads
    ? Math.round((stats.approved / stats.totalLeads) * 100)
    : 0;
      return (
    <PageShell
      title="Agent Analytics"
      subtitle={`Monthly overview for ${agentName}`}
    >
      <div className="origin-top-left scale-[0.85] w-[117.65%] space-y-4">
        <div className="-mt-4 flex items-start justify-between gap-4">
          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 px-4 py-2 shadow-[0_0_25px_rgba(34,211,238,0.06)]">
            <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/70">
              This Month
            </p>
            <p className="text-xs font-bold text-white">
              Entry Time: {entryTime}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#071018]/80 px-4 py-3 shadow-[0_0_35px_rgba(34,211,238,0.05)] backdrop-blur-xl">
              <CalendarDays size={16} className="text-cyan-300" />
              <span className="text-xs font-bold text-slate-300">
                {getReadableDate()}
              </span>
            </div>

            <button
              onClick={() => loadAnalytics(agentId)}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/35 hover:bg-cyan-300/10 hover:text-cyan-100 disabled:opacity-60"
            >
              <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-4">
          <AnalyticsCard
            label="Total Leads"
            value={loading ? "..." : stats.totalLeads}
            note="This month"
            icon={Users}
            color="cyan"
          />

          <AnalyticsCard
            label="Approved Leads"
            value={loading ? "..." : stats.approved}
            note="Manager approved"
            icon={CheckCircle2}
            color="green"
          />

          <AnalyticsCard
            label="Pending Leads"
            value={loading ? "..." : stats.pending}
            note="Waiting review"
            icon={Clock3}
            color="yellow"
          />

          <AnalyticsCard
            label="Rejected Leads"
            value={loading ? "..." : stats.rejected}
            note="Not accepted"
            icon={XCircle}
            color="red"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <AnalyticsCard
            label="Active Days"
            value={loading ? "..." : stats.activeDays}
            note="Attendance rows"
            icon={Activity}
            color="cyan"
          />

          <AnalyticsCard
            label="On Time"
            value={loading ? "..." : stats.onTime}
            note="Within grace"
            icon={CheckCircle2}
            color="green"
          />

          <AnalyticsCard
            label="Late"
            value={loading ? "..." : stats.late}
            note="Entry +10 min"
            icon={Clock3}
            color="yellow"
          />

          <AnalyticsCard
            label="Half Days"
            value={loading ? "..." : stats.halfDay}
            note="Entry +1 hour"
            icon={TimerOff}
            color="purple"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <AnalyticsCard
            label="Total Screen Time"
            value={loading ? "..." : formatMinutes(stats.screenMinutes)}
            note="This month"
            icon={BarChart3}
            color="purple"
            large
          />

          <AnalyticsCard
            label="Total Inactive Time"
            value={loading ? "..." : formatMinutes(stats.inactiveMinutes)}
            note="Auto logout gaps"
            icon={TimerOff}
            color="red"
            large
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-[1.5rem] border border-white/10 bg-[#071018]/80 p-4 shadow-[0_0_45px_rgba(34,211,238,0.05)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-white">
                  Leads Overview
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Approval movement this month
                </p>
              </div>

              <span className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] font-medium text-slate-400">
                This Month
              </span>
            </div>

            <div className="mb-3 flex items-center gap-4 text-[10px] text-slate-400">
              <Legend color="green" label="Approved" />
              <Legend color="yellow" label="Pending" />
              <Legend color="red" label="Rejected" />
            </div>

            <MiniLineChart
              approved={stats.approved}
              pending={stats.pending}
              rejected={stats.rejected}
            />
          </section>

          <section className="rounded-[1.5rem] border border-white/10 bg-[#071018]/80 p-4 shadow-[0_0_45px_rgba(34,211,238,0.05)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-white">
                  Attendance Overview
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Punctuality split this month
                </p>
              </div>

              <span className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] font-medium text-slate-400">
                This Month
              </span>
            </div>

            <div className="grid items-center gap-6 md:grid-cols-[180px_1fr]">
              <DonutChart
                total={attendanceTotal}
                onTime={stats.onTime}
                late={stats.late}
                halfDay={stats.halfDay}
              />

              <div className="space-y-3">
                <BreakdownRow
                  color="green"
                  label="On Time"
                  value={stats.onTime}
                  percent={Math.round((stats.onTime / attendanceTotal) * 100)}
                />
                <BreakdownRow
                  color="yellow"
                  label="Late"
                  value={stats.late}
                  percent={Math.round((stats.late / attendanceTotal) * 100)}
                />
                <BreakdownRow
                  color="purple"
                  label="Half Days"
                  value={stats.halfDay}
                  percent={Math.round((stats.halfDay / attendanceTotal) * 100)}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-[1.5rem] border border-white/10 bg-[#071018]/80 p-4 shadow-[0_0_45px_rgba(34,211,238,0.05)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-black text-white">
                This Month Leads
              </h2>
              <span className="text-xs font-bold text-cyan-300">
                {approvedPercent}% approved
              </span>
            </div>

            <DataTable type="leads" loading={loading} rows={monthlyLeads} />
          </section>

          <section className="rounded-[1.5rem] border border-white/10 bg-[#071018]/80 p-4 shadow-[0_0_45px_rgba(34,211,238,0.05)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-black text-white">
                This Month Attendance
              </h2>
              <span className="text-xs font-bold text-cyan-300">
                {stats.activeDays} active days
              </span>
            </div>

            <DataTable
              type="attendance"
              loading={loading}
              rows={monthlyAttendance}
            />
          </section>
        </div>
      </div>
    </PageShell>
  );
}

function AnalyticsCard({ label, value, note, icon: Icon, color, large }) {
  const colors = {
    cyan: "text-cyan-300 bg-cyan-300/10 border-cyan-300/15",
    green: "text-emerald-300 bg-emerald-300/10 border-emerald-300/15",
    yellow: "text-yellow-300 bg-yellow-300/10 border-yellow-300/15",
    red: "text-red-300 bg-red-300/10 border-red-300/15",
    purple: "text-purple-300 bg-purple-300/10 border-purple-300/15",
  };

  return (
    <div className="group rounded-[1.4rem] border border-white/10 bg-[#071018]/80 px-4 py-4 shadow-[0_0_35px_rgba(34,211,238,0.04)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-[#09141f]/90">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`rounded-2xl border p-2.5 ${
            colors[color] || colors.cyan
          }`}
        >
          <Icon size={large ? 18 : 16} />
        </div>

        <span className="max-w-[160px] truncate text-[10px] text-slate-500">
          {note}
        </span>
      </div>

      <p
        className={`mt-3 truncate font-black text-white ${
          large ? "text-2xl" : "text-xl"
        }`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-slate-400">{label}</p>
    </div>
  );
}

function MiniLineChart({ approved, pending, rejected }) {
  const max = Math.max(approved, pending, rejected, 1);

  const series = [
    {
      label: "Approved",
      value: approved,
      className: "from-emerald-400 to-emerald-300",
    },
    {
      label: "Pending",
      value: pending,
      className: "from-yellow-400 to-yellow-300",
    },
    {
      label: "Rejected",
      value: rejected,
      className: "from-red-400 to-red-300",
    },
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
      {series.map((item) => {
        const width = `${Math.max(8, Math.round((item.value / max) * 100))}%`;

        return (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-[10px] text-slate-400">
              <span>{item.label}</span>
              <span className="font-bold text-white">{item.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${item.className}`}
                style={{ width }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ total, onTime, late, halfDay }) {
  const safeTotal = Math.max(1, total);
  const onTimeDeg = (onTime / safeTotal) * 360;
  const lateDeg = (late / safeTotal) * 360;
  const halfDeg = (halfDay / safeTotal) * 360;

  const background = `conic-gradient(
    rgba(52, 211, 153, 0.95) 0deg ${onTimeDeg}deg,
    rgba(250, 204, 21, 0.95) ${onTimeDeg}deg ${onTimeDeg + lateDeg}deg,
    rgba(216, 180, 254, 0.95) ${onTimeDeg + lateDeg}deg ${
    onTimeDeg + lateDeg + halfDeg
  }deg,
    rgba(255,255,255,0.08) ${
      onTimeDeg + lateDeg + halfDeg
    }deg 360deg
  )`;

  return (
    <div
      className="relative mx-auto flex h-40 w-40 items-center justify-center rounded-full"
      style={{ background }}
    >
      <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border border-white/10 bg-[#071018] shadow-[inset_0_0_25px_rgba(0,0,0,0.45)]">
        <p className="text-2xl font-black text-white">{total}</p>
        <p className="text-[10px] text-slate-500">Total Days</p>
      </div>
    </div>
  );
}

function BreakdownRow({ color, label, value, percent }) {
  const colors = {
    green: "bg-emerald-300",
    yellow: "bg-yellow-300",
    purple: "bg-purple-300",
  };

  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2 text-slate-400">
        <span className={`h-2 w-2 rounded-full ${colors[color]}`} />
        {label}
      </div>
      <span className="font-bold text-white">
        {value} <span className="text-slate-500">({percent}%)</span>
      </span>
    </div>
  );
}

function Legend({ color, label }) {
  const colors = {
    green: "bg-emerald-300",
    yellow: "bg-yellow-300",
    red: "bg-red-300",
  };

  return (
    <span className="flex items-center gap-2">
      <span className={`h-2 w-4 rounded-full ${colors[color]}`} />
      {label}
    </span>
  );
}

function DataTable({ type, loading, rows }) {
  const isLeads = type === "leads";

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full min-w-[720px] text-left text-[10px]">
        <thead className="bg-white/[0.03] text-slate-400">
          <tr>
            {isLeads ? (
              <>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Lead</th>
                <th className="px-3 py-2 font-medium">Company</th>
                <th className="px-3 py-2 font-medium">Phone</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Approved By</th>
              </>
            ) : (
              <>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Login</th>
                <th className="px-3 py-2 font-medium">Logout</th>
                <th className="px-3 py-2 font-medium">Day Status</th>
                <th className="px-3 py-2 font-medium">Screen</th>
                <th className="px-3 py-2 font-medium">Inactive</th>
              </>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-white/10">
          {loading ? (
            <EmptyRow colSpan={6} text="Loading..." />
          ) : rows.length === 0 ? (
            <EmptyRow colSpan={6} text="No data found this month." />
          ) : isLeads ? (
            rows.slice(0, 5).map((lead) => (
              <tr key={lead.id} className="text-slate-300">
                <td className="px-3 py-2 text-slate-500">{lead.date}</td>
                <td className="px-3 py-2 text-white">
                  {lead.leadName || "-"}
                </td>
                <td className="px-3 py-2">{lead.company || "-"}</td>
                <td className="px-3 py-2 text-cyan-300">
                  {lead.phone || "-"}
                </td>
                <td className="px-3 py-2">
                  <LeadStatus status={lead.approvalStatus} />
                </td>
                <td className="px-3 py-2 text-slate-500">
                  {lead.approvedBy || "-"}
                </td>
              </tr>
            ))
          ) : (
            rows.slice(0, 5).map((row) => (
              <tr key={row.id} className="text-slate-300">
                <td className="px-3 py-2 text-slate-500">{row.date}</td>
                <td className="px-3 py-2 text-cyan-300">{row.loginTime}</td>
                <td className="px-3 py-2">{row.logoutTime}</td>
                <td className="px-3 py-2">
                  <AttendanceStatus status={row.dayStatus} />
                </td>
                <td className="px-3 py-2">
                  {formatMinutes(row.screenMinutes)}
                </td>
                <td className="px-3 py-2 text-red-300">
                  {formatMinutes(row.inactiveMinutes)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function EmptyRow({ colSpan, text }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-3 py-5 text-center text-[11px] text-slate-500"
      >
        {text}
      </td>
    </tr>
  );
}

function LeadStatus({ status }) {
  const cleanStatus = String(status || "Pending");

  const className =
    cleanStatus === "Approved"
      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-300"
      : cleanStatus === "Rejected"
      ? "border-red-300/20 bg-red-300/10 text-red-300"
      : "border-yellow-300/20 bg-yellow-300/10 text-yellow-300";

  return (
    <span
      className={`inline-flex rounded-xl border px-2 py-1 text-[10px] font-medium ${className}`}
    >
      {cleanStatus}
    </span>
  );
}

function AttendanceStatus({ status }) {
  const cleanStatus = String(status || "On Time");

  const className =
    cleanStatus === "On Time"
      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-300"
      : cleanStatus === "Late"
      ? "border-yellow-300/20 bg-yellow-300/10 text-yellow-300"
      : "border-red-300/20 bg-red-300/10 text-red-300";

  return (
    <span
      className={`inline-flex rounded-xl border px-2 py-1 text-[10px] font-medium ${className}`}
    >
      {cleanStatus}
    </span>
  );
}