"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
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

    const late = monthlyAttendance.filter(
      (row) => row.dayStatus === "Late"
    ).length;

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

  return (
    <PageShell title="Agent Analytics" subtitle={`Monthly overview for ${agentName}`}>
      <div className="origin-top-left scale-[0.85] w-[117.65%]">
        <div className="-mt-4 mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 px-4 py-2">
            <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/70">
              This Month
            </p>
            <p className="text-xs font-semibold text-white">
              Entry Time: {entryTime}
            </p>
          </div>

          <button
            onClick={() => loadAnalytics(agentId)}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-medium text-slate-300 hover:border-cyan-300/25 hover:text-cyan-100 disabled:opacity-60"
          >
            <RefreshCcw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-2.5 md:grid-cols-4">
          <AnalyticsCard
            label="Total Leads"
            value={loading ? "..." : stats.totalLeads}
            note="This month"
            icon={Users}
            tone="text-cyan-300"
          />

          <AnalyticsCard
            label="Approved Leads"
            value={loading ? "..." : stats.approved}
            note="Manager approved"
            icon={CheckCircle2}
            tone="text-emerald-300"
          />

          <AnalyticsCard
            label="Pending Leads"
            value={loading ? "..." : stats.pending}
            note="Waiting review"
            icon={Clock3}
            tone="text-yellow-300"
          />

          <AnalyticsCard
            label="Rejected Leads"
            value={loading ? "..." : stats.rejected}
            note="Not accepted"
            icon={XCircle}
            tone="text-red-300"
          />
        </div>

        <div className="mt-2.5 grid gap-2.5 md:grid-cols-4">
          <AnalyticsCard
            label="Active Days"
            value={loading ? "..." : stats.activeDays}
            note="Attendance rows"
            icon={Activity}
            tone="text-cyan-300"
          />

          <AnalyticsCard
            label="On Time"
            value={loading ? "..." : stats.onTime}
            note="Within grace"
            icon={CheckCircle2}
            tone="text-emerald-300"
          />

          <AnalyticsCard
            label="Late"
            value={loading ? "..." : stats.late}
            note="Entry +10 min"
            icon={Clock3}
            tone="text-yellow-300"
          />

          <AnalyticsCard
            label="Half Days"
            value={loading ? "..." : stats.halfDay}
            note="Entry +1 hour"
            icon={TimerOff}
            tone="text-red-300"
          />
        </div>

        <div className="mt-2.5 grid gap-2.5 md:grid-cols-2">
          <AnalyticsCard
            label="Total Screen Time"
            value={loading ? "..." : formatMinutes(stats.screenMinutes)}
            note="Saved checkout time"
            icon={BarChart3}
            tone="text-purple-300"
          />

          <AnalyticsCard
            label="Total Inactive Time"
            value={loading ? "..." : formatMinutes(stats.inactiveMinutes)}
            note="Auto logout gaps"
            icon={TimerOff}
            tone="text-red-300"
          />
        </div>

        <div className="mt-3 grid gap-3 xl:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-[#071018]/80 px-3 py-3 backdrop-blur-xl">
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/70">
                Leads Status
              </p>
              <h2 className="text-sm font-semibold text-white">
                This Month Leads
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full min-w-[720px] text-left text-[10px]">
                <thead className="bg-white/[0.03] text-slate-400">
                  <tr>
                    <th className="px-2 py-2 font-medium">Date</th>
                    <th className="px-2 py-2 font-medium">Lead</th>
                    <th className="px-2 py-2 font-medium">Company</th>
                    <th className="px-2 py-2 font-medium">Phone</th>
                    <th className="px-2 py-2 font-medium">Status</th>
                    <th className="px-2 py-2 font-medium">Approved By</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <EmptyRow colSpan="6" text="Loading leads..." />
                  ) : monthlyLeads.length === 0 ? (
                    <EmptyRow colSpan="6" text="No leads found this month." />
                  ) : (
                    monthlyLeads.map((lead) => (
                      <tr key={lead.id} className="text-slate-300">
                        <td className="px-2 py-2 text-slate-500">
                          {lead.date}
                        </td>
                        <td className="px-2 py-2 text-white">
                          {lead.leadName || "-"}
                        </td>
                        <td className="px-2 py-2">{lead.company || "-"}</td>
                        <td className="px-2 py-2 text-cyan-300">
                          {lead.phone || "-"}
                        </td>
                        <td className="px-2 py-2">
                          <LeadStatus status={lead.approvalStatus} />
                        </td>
                        <td className="px-2 py-2 text-slate-500">
                          {lead.approvedBy || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#071018]/80 px-3 py-3 backdrop-blur-xl">
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/70">
                Attendance Status
              </p>
              <h2 className="text-sm font-semibold text-white">
                This Month Attendance
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full min-w-[720px] text-left text-[10px]">
                <thead className="bg-white/[0.03] text-slate-400">
                  <tr>
                    <th className="px-2 py-2 font-medium">Date</th>
                    <th className="px-2 py-2 font-medium">Login</th>
                    <th className="px-2 py-2 font-medium">Logout</th>
                    <th className="px-2 py-2 font-medium">Day Status</th>
                    <th className="px-2 py-2 font-medium">Screen</th>
                    <th className="px-2 py-2 font-medium">Inactive</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <EmptyRow colSpan="6" text="Loading attendance..." />
                  ) : monthlyAttendance.length === 0 ? (
                    <EmptyRow
                      colSpan="6"
                      text="No attendance found this month."
                    />
                  ) : (
                    monthlyAttendance.map((row) => (
                      <tr key={row.id} className="text-slate-300">
                        <td className="px-2 py-2 text-slate-500">
                          {row.date}
                        </td>
                        <td className="px-2 py-2 text-cyan-300">
                          {row.loginTime}
                        </td>
                        <td className="px-2 py-2">{row.logoutTime}</td>
                        <td className="px-2 py-2">
                          <AttendanceStatus status={row.dayStatus} />
                        </td>
                        <td className="px-2 py-2">
                          {formatMinutes(row.screenMinutes)}
                        </td>
                        <td className="px-2 py-2 text-red-300">
                          {formatMinutes(row.inactiveMinutes)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}

function AnalyticsCard({ label, value, note, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#071018]/80 px-4 py-3 backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-between">
        <div className={`rounded-xl bg-white/5 p-2 ${tone}`}>
          <Icon size={15} />
        </div>

        <span className="max-w-[160px] truncate text-[10px] text-slate-500">
          {note}
        </span>
      </div>

      <p className="truncate text-base font-black text-white">{value}</p>
      <p className="text-[11px] text-slate-400">{label}</p>
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