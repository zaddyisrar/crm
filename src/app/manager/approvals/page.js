"use client";

import { useEffect, useMemo, useState } from "react";
import ManagerShell from "@/components/manager/ManagerShell";
import { sheetsPost } from "@/lib/sheetsApi";
import { CheckCircle2, RefreshCcw, XCircle } from "lucide-react";

export default function ManagerApprovalsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  async function loadLeads() {
    try {
      setLoading(true);
      setError("");

      const res = await sheetsPost({ action: "getLeads" });
      setLeads(res.data || []);
    } catch (err) {
      console.error("Failed to load leads:", err);
      setError(err.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  const pendingLeads = useMemo(() => {
    return leads.filter(
      (lead) =>
        String(lead.ApprovalStatus || "").toLowerCase() === "pending"
    );
  }, [leads]);

  async function handleApproval(lead, nextAction) {
    const key = `${nextAction}-${lead.AgentID}-${lead.Phone}-${lead.Date}-${lead.Time}`;

    try {
      setActionLoading(key);
      setError("");

      const managerName =
        localStorage.getItem("crmUserName") ||
        localStorage.getItem("crmUserId") ||
        "Manager";

      await sheetsPost({
        action: nextAction,
        agentId: lead.AgentID,
        phone: lead.Phone,
        date: lead.Date,
        time: lead.Time,
        approvedBy: managerName,
      });

      await loadLeads();
    } catch (err) {
      console.error("Lead approval failed:", err);
      setError(err.message || "Lead approval failed");
    } finally {
      setActionLoading("");
    }
  }

  return (
    <ManagerShell>
      <div className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
              Lead Approvals
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              Pending Agent Leads
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review agent-submitted leads and approve or reject them.
            </p>
          </div>

          <button
            onClick={loadLeads}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-white/10">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.2em] text-cyan-300">
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Agent</th>
                <th className="px-5 py-4">Lead Name</th>
                <th className="px-5 py-4">Company</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Loading pending leads...
                  </td>
                </tr>
              ) : pendingLeads.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No pending leads found.
                  </td>
                </tr>
              ) : (
                pendingLeads.map((lead, index) => {
                  const approveKey = `approveLead-${lead.AgentID}-${lead.Phone}-${lead.Date}-${lead.Time}`;
                  const rejectKey = `rejectLead-${lead.AgentID}-${lead.Phone}-${lead.Date}-${lead.Time}`;

                  return (
                    <tr
                      key={`${lead.AgentID}-${lead.Phone}-${lead.Date}-${lead.Time}-${index}`}
                      className="border-t border-white/10 text-slate-300"
                    >
                      <td className="px-5 py-4 text-slate-400">
                        {lead.Date || "-"}
                      </td>

                      <td className="px-5 py-4 font-bold text-white">
                        {lead.AgentName || lead.AgentID || "-"}
                      </td>

                      <td className="px-5 py-4">{lead.LeadName || "-"}</td>
                      <td className="px-5 py-4">{lead.Company || "-"}</td>
                      <td className="px-5 py-4 text-cyan-300">
                        {lead.Phone || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-300">
                          {lead.ApprovalStatus || "Pending"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApproval(lead, "approveLead")}
                            disabled={!!actionLoading}
                            className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <CheckCircle2 size={15} />
                            {actionLoading === approveKey
                              ? "Approving..."
                              : "Approve"}
                          </button>

                          <button
                            onClick={() => handleApproval(lead, "rejectLead")}
                            disabled={!!actionLoading}
                            className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <XCircle size={15} />
                            {actionLoading === rejectKey
                              ? "Rejecting..."
                              : "Reject"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ManagerShell>
  );
}