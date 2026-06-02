"use client";

import { useEffect, useMemo, useState } from "react";
import ManagerShell from "@/components/manager/ManagerShell";
import StatCard from "@/components/crm/StatCard";
import { sheetsPost } from "@/lib/sheetsApi";
import {
  Users,
  ClipboardCheck,
  FileBarChart,
  Activity,
  RefreshCcw,
} from "lucide-react";

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

      const agentsResponse = await sheetsPost({ action: "getAgents" });
      const leadsResponse = await sheetsPost({ action: "getLeads" });
      const attendanceResponse = await sheetsPost({
        action: "getAttendance",
      });

      setAgentRows(agentsResponse.data || []);
      setLeadRows(leadsResponse.data || []);
      setAttendanceRows(attendanceResponse.data || []);
    } catch (err) {
      console.error("Manager dashboard sheet read failed:", err);
      setError(err.message || "Failed to load manager dashboard data");
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
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const agents = useMemo(() => {
    return agentRows.filter(
      (user) => String(user.Role || "").toLowerCase() === "agent"
    );
  }, [agentRows]);

  const pendingLeads = useMemo(() => {
    return leadRows.filter(
      (lead) => String(lead.ApprovalStatus || "").toLowerCase() === "pending"
    );
  }, [leadRows]);

  const approvedLeads = useMemo(() => {
    return leadRows.filter(
      (lead) => String(lead.ApprovalStatus || "").toLowerCase() === "approved"
    );
  }, [leadRows]);

  const recentLeadActivity = useMemo(() => {
    return [...leadRows]
      .slice()
      .reverse()
      .slice(0, 8)
      .map((lead) => ({
        agent: lead.AgentName || lead.AgentID || "-",
        lead: lead.LeadName || "-",
        company: lead.Company || "-",
        status: lead.ApprovalStatus || "Pending",
        time: lead.Time || "-",
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
          title="Total Agents"
          value={loading ? "..." : agents.length}
          subtitle="Registered active agents"
          icon={Users}
        />

        <StatCard
          title="Pending Approvals"
          value={loading ? "..." : pendingLeads.length}
          subtitle="Leads waiting for review"
          icon={ClipboardCheck}
        />

        <StatCard
          title="Reports"
          value={loading ? "..." : attendanceRows.length}
          subtitle="Attendance rows tracked"
          icon={FileBarChart}
        />
      </div>

      <div className="mt-6 rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6 backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between">
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

        <div className="overflow-hidden rounded-2xl border border-white/10">
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
                  <td
                    colSpan="5"
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    Loading live lead activity...
                  </td>
                </tr>
              ) : recentLeadActivity.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    No lead submissions found.
                  </td>
                </tr>
              ) : (
                recentLeadActivity.map((lead, index) => (
                  <tr
                    key={`${lead.agent}-${lead.lead}-${lead.time}-${index}`}
                    className="border-t border-white/10 text-slate-300"
                  >
                    <td className="px-5 py-4 font-bold text-white">
                      {lead.agent}
                    </td>

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