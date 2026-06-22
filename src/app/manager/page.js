"use client";

import { useEffect, useMemo, useState } from "react";
import ManagerShell from "@/components/manager/ManagerShell";
import StatCard from "@/components/crm/StatCard";
import { sheetsPost } from "@/lib/sheetsApi";
import {
  Users,
  ClipboardCheck,
  Activity,
  RefreshCcw,
  LogOut,
  Bath,
  Video,
} from "lucide-react";

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

function statusBadgeClass(status) {
  const cleanStatus = String(status || "Pending").toLowerCase();

  if (cleanStatus === "approved") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  }

  if (cleanStatus === "rejected") {
    return "border-red-400/20 bg-red-400/10 text-red-300";
  }

  return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300";
}

export default function ManagerDashboardPage() {
  const [agentRows, setAgentRows] = useState([]);
  const [leadRows, setLeadRows] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadManagerData(showLoader = false) {
    try {
      if (showLoader) setLoading(true);

      setError("");

      const [agentsResponse, leadsResponse, attendanceResponse] =
        await Promise.all([
          sheetsPost({ action: "getAgents" }),
          sheetsPost({ action: "getLeads" }),
          sheetsPost({ action: "getAttendance" }),
        ]);

      setAgentRows(agentsResponse?.data || []);
      setLeadRows(leadsResponse?.data || []);
      setAttendanceRows(attendanceResponse?.data || []);
    } catch (err) {
      console.error("Manager dashboard sheet read failed:", err);
      setError(err?.message || "Failed to load manager dashboard data");
      setAgentRows([]);
      setLeadRows([]);
      setAttendanceRows([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    loadManagerData(true);

    const interval = setInterval(() => {
      loadManagerData(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const todayKey = getTodayKey();
  const monthKey = todayKey.slice(0, 7);

  const agents = useMemo(() => {
    return agentRows.filter((user) => {
      const role = String(user.Role || "").toLowerCase();
      const status = String(user.Status || "Active").toLowerCase();

      return role === "agent" && status !== "inactive";
    });
  }, [agentRows]);

  const todayAttendanceRows = useMemo(() => {
    return attendanceRows.filter((row) => normalizeDate(row.Date) === todayKey);
  }, [attendanceRows, todayKey]);

  const activeAgentsToday = useMemo(() => {
    const activeIds = new Set();

    todayAttendanceRows.forEach((row) => {
      const status = String(row.Status || "").toLowerCase();
      const agentId = String(row.AgentID || "").toUpperCase();

      if (!agentId) return;

      if (status && status !== "checked out" && status !== "auto logged out") {
        activeIds.add(agentId);
      }
    });

    return activeIds.size;
  }, [todayAttendanceRows]);

  const monthlyLeads = useMemo(() => {
    return leadRows.filter((lead) => normalizeDate(lead.Date).slice(0, 7) === monthKey);
  }, [leadRows, monthKey]);

  const pendingLeads = useMemo(() => {
    return leadRows.filter((lead) => {
      const status = String(lead.ApprovalStatus || "Pending").toLowerCase();
      return status === "pending";
    });
  }, [leadRows]);

  const washroomAgents = useMemo(() => {
    const ids = new Set();

    todayAttendanceRows.forEach((row) => {
      if (String(row.Status || "").toLowerCase() === "washroom") {
        ids.add(String(row.AgentID || "").toUpperCase());
      }
    });

    return ids.size;
  }, [todayAttendanceRows]);

  const meetingAgents = useMemo(() => {
    const ids = new Set();

    todayAttendanceRows.forEach((row) => {
      if (String(row.Status || "").toLowerCase() === "meeting") {
        ids.add(String(row.AgentID || "").toUpperCase());
      }
    });

    return ids.size;
  }, [todayAttendanceRows]);

  const autoLogoutAgents = useMemo(() => {
    const ids = new Set();

    todayAttendanceRows.forEach((row) => {
      if (String(row.Status || "").toLowerCase() === "auto logged out") {
        ids.add(String(row.AgentID || "").toUpperCase());
      }
    });

    return ids.size;
  }, [todayAttendanceRows]);

  const recentLeadActivity = useMemo(() => {
    return [...leadRows]
      .reverse()
      .slice(0, 8)
      .map((lead, index) => ({
        id: `${lead.AgentID || "agent"}-${lead.LeadName || "lead"}-${index}`,
        agent: lead.AgentName || lead.AgentID || "-",
        lead: lead.LeadName || "-",
        company: lead.Company || "-",
        status: lead.ApprovalStatus || "Pending",
        time: normalizeTime(lead.Time),
      }));
  }, [leadRows]);

  return (
    <ManagerShell>
      {error && (
        <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mb-5 flex justify-end">
        <button
          onClick={() => loadManagerData(true)}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold text-cyan-200 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          title="Active Agents Today"
          value={loading ? "..." : activeAgentsToday}
          subtitle="Agents currently working today"
          icon={Users}
        />

        <StatCard
          title="Total Leads This Month"
          value={loading ? "..." : monthlyLeads.length}
          subtitle="Monthly Google Sheets leads"
          icon={Activity}
        />

        <StatCard
          title="Pending Approvals"
          value={loading ? "..." : pendingLeads.length}
          subtitle="Leads waiting for review"
          icon={ClipboardCheck}
        />

        <StatCard
          title="Agents In Washroom"
          value={loading ? "..." : washroomAgents}
          subtitle="Current live status"
          icon={Bath}
        />

        <StatCard
          title="Agents In Meeting"
          value={loading ? "..." : meetingAgents}
          subtitle="Current live status"
          icon={Video}
        />

        <StatCard
          title="Auto Logout Agents"
          value={loading ? "..." : autoLogoutAgents}
          subtitle="Inactive agents today"
          icon={LogOut}
        />
      </div>

      <div className="mt-6 rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6 backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
              Live Leads Activity
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              Recent Agent Submissions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Live data from Google Sheets Leads tab.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-300">
            <Activity size={22} />
          </div>
        </div>

        <div className="overflow-hidden overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.22em] text-cyan-300">
              <tr>
                <th className="px-5 py-4">Agent</th>
                <th className="px-5 py-4">Lead Name</th>
                <th className="px-5 py-4">Company</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Time</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-500">
                    Loading live lead activity...
                  </td>
                </tr>
              ) : recentLeadActivity.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-500">
                    No lead submissions found.
                  </td>
                </tr>
              ) : (
                recentLeadActivity.map((lead) => (
                  <tr key={lead.id} className="border-t border-white/10 text-slate-300">
                    <td className="px-5 py-4 font-bold text-white">{lead.agent}</td>
                    <td className="px-5 py-4">{lead.lead}</td>
                    <td className="px-5 py-4">{lead.company}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${statusBadgeClass(
                          lead.status
                        )}`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{lead.time}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ManagerShell>
  );
}