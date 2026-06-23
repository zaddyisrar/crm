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
} from "lucide-react";

function getTodayKey() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getYesterdayKey() {
  const date = new Date();

  date.setDate(date.getDate() - 1);

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

function normalizeStatus(value, logoutTime) {
  if (logoutTime && logoutTime !== "-") return "Checked Out";

  const status = String(value || "Active").trim();
  if (!status || status === "-") return "Active";

  return status;
}

function statusBadgeClass(status) {
  const cleanStatus = String(status || "Active").toLowerCase();

  if (cleanStatus === "active") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  }

  if (cleanStatus === "break") {
    return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300";
  }

  if (cleanStatus === "washroom") {
    return "border-purple-400/20 bg-purple-400/10 text-purple-300";
  }

  if (cleanStatus === "in meeting" || cleanStatus === "meeting") {
    return "border-blue-400/20 bg-blue-400/10 text-blue-300";
  }

  if (cleanStatus === "checked out") {
    return "border-orange-400/20 bg-orange-400/10 text-orange-300";
  }

  if (cleanStatus === "auto logged out") {
    return "border-red-400/20 bg-red-400/10 text-red-300";
  }

  return "border-slate-400/20 bg-slate-400/10 text-slate-300";
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
  const yesterdayKey = getYesterdayKey();
  const monthKey = todayKey.slice(0, 7);

  const todayAttendanceRows = useMemo(() => {
    return attendanceRows.filter((row) => {
      const rowDate = normalizeDate(row.Date);
      const status = String(row.Status || "").toLowerCase();
      const logoutTime = normalizeTime(row.LogoutTime);

      const isOpenShift = logoutTime === "-" && status !== "checked out";

      return (
        rowDate === todayKey ||
        (rowDate === yesterdayKey && isOpenShift)
      );
    });
  }, [attendanceRows, todayKey, yesterdayKey]);

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
    return leadRows.filter(
      (lead) => normalizeDate(lead.Date).slice(0, 7) === monthKey
    );
  }, [leadRows, monthKey]);

  const pendingLeads = useMemo(() => {
    return leadRows.filter((lead) => {
      const status = String(lead.ApprovalStatus || "Pending").toLowerCase();
      return status === "pending";
    });
  }, [leadRows]);

  const autoLogoutAgents = useMemo(() => {
    const ids = new Set();

    todayAttendanceRows.forEach((row) => {
      const status = String(row.Status || "").toLowerCase();
      const agentId = String(row.AgentID || "").toUpperCase();

      if (!agentId) return;

      if (status === "auto logged out") {
        ids.add(agentId);
      }
    });

    return ids.size;
  }, [todayAttendanceRows]);

  const liveAgentActivity = useMemo(() => {
    return todayAttendanceRows
      .map((row, index) => {
        const logoutAt = normalizeTime(row.LogoutTime);
        const status = normalizeStatus(row.Status, logoutAt);

        return {
          rowKey: `${row.AgentID || "agent"}-${row.Date || "date"}-${
            row.LoginTime || "login"
          }-${index}`,
          agent: row.AgentName || "Agent",
          agentId: row.AgentID || "-",
          status,
          loginAt: normalizeTime(row.LoginTime),
          logoutAt,
          updatedAt: normalizeTime(row.UpdatedAt),
          shiftDate: normalizeDate(row.Date),
        };
      })
      .reverse();
  }, [todayAttendanceRows]);

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

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active Agents Today"
          value={loading ? "..." : activeAgentsToday}
          subtitle="Active, break, washroom, meeting"
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
          title="Auto Logout Agents"
          value={loading ? "..." : autoLogoutAgents}
          subtitle="Inactive agents in open shift"
          icon={LogOut}
        />
      </div>

      <div className="mt-6 rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6 backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
              Live Agent Activity
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              Current Shift Floor Status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Night-shift agents remain visible after midnight until checkout.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-300">
            <Activity size={22} />
          </div>
        </div>

        <div className="overflow-hidden overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.22em] text-cyan-300">
              <tr>
                <th className="px-5 py-4">Agent</th>
                <th className="px-5 py-4">Login ID</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Login At</th>
                <th className="px-5 py-4">Logout At</th>
                <th className="px-5 py-4">Shift Date</th>
                <th className="px-5 py-4">Updated</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    Loading live agent activity...
                  </td>
                </tr>
              ) : liveAgentActivity.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    No open shift activity found.
                  </td>
                </tr>
              ) : (
                liveAgentActivity.map((agent) => (
                  <tr
                    key={agent.rowKey}
                    className="border-t border-white/10 text-slate-300"
                  >
                    <td className="px-5 py-4 font-bold text-white">
                      {agent.agent}
                    </td>

                    <td className="px-5 py-4 text-cyan-300">
                      {agent.agentId}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${statusBadgeClass(
                          agent.status
                        )}`}
                      >
                        {agent.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">{agent.loginAt}</td>

                    <td className="px-5 py-4">{agent.logoutAt}</td>

                    <td className="px-5 py-4 text-blue-300">
                      {agent.shiftDate || "-"}
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {agent.updatedAt}
                    </td>
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