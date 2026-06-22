"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  CheckCircle2,
  RefreshCcw,
  Save,
  Search,
} from "lucide-react";

import ManagerShell from "@/components/manager/ManagerShell";
import { sheetsPost } from "@/lib/sheetsApi";

function normalizeDate(value) {
  if (!value) return "-";

  const raw = String(value).trim();
  if (!raw || raw === "-") return "-";

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

function formatPKR(value) {
  const amount = Number(value || 0);
  return `PKR ${amount.toLocaleString()}`;
}

function makeLeadKey(lead) {
  return `${lead.AgentID || ""}-${lead.Phone || ""}-${normalizeDate(
    lead.Date
  )}`;
}

export default function ManagerCommissionPage() {
  const [approvedLeads, setApprovedLeads] = useState([]);
  const [commissionInputs, setCommissionInputs] = useState({});
  const [savingKey, setSavingKey] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadCommissionData(showLoader = false) {
    try {
      if (showLoader) setLoading(true);

      setError("");
      setSuccess("");

      const response = await sheetsPost({
        action: "getApprovedLeadsForCommission",
      });

      if (response?.success === false) {
        throw new Error(response.message || "Failed to load approved leads");
      }

      const rows = response?.data || [];
      setApprovedLeads(rows);

      const nextInputs = {};

      rows.forEach((lead) => {
        nextInputs[makeLeadKey(lead)] = String(lead.Commission || "");
      });

      setCommissionInputs(nextInputs);
    } catch (err) {
      console.error("Commission page load failed:", err);
      setError(err?.message || "Failed to load commission data");
      setApprovedLeads([]);
      setCommissionInputs({});
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    loadCommissionData(true);

    const interval = setInterval(() => {
      loadCommissionData(false);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  function updateCommissionInput(key, value) {
    setCommissionInputs((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function saveCommission(lead) {
    const key = makeLeadKey(lead);
    const amount = Number(commissionInputs[key] || 0);

    try {
      setSavingKey(key);
      setError("");
      setSuccess("");

      const response = await sheetsPost({
        action: "updateCommission",

        date: normalizeDate(lead.Date),
        agentId: lead.AgentID,
        agentName: lead.AgentName,
        leadName: lead.LeadName,
        company: lead.Company,
        phone: lead.Phone,
        approvedAt: lead.ApprovedAt,
        commission: amount,
        addedBy: "Manager",
      });

      if (response?.success === false) {
        throw new Error(response.message || "Failed to save commission");
      }

      setSuccess("Commission saved successfully.");
      await loadCommissionData(false);
    } catch (err) {
      console.error("Commission save failed:", err);
      setError(err?.message || "Failed to save commission");
    } finally {
      setSavingKey("");
    }
  }

  const filteredLeads = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return approvedLeads;

    return approvedLeads.filter((lead) => {
      return (
        String(lead.AgentID || "").toLowerCase().includes(search) ||
        String(lead.AgentName || "").toLowerCase().includes(search) ||
        String(lead.LeadName || "").toLowerCase().includes(search) ||
        String(lead.Company || "").toLowerCase().includes(search) ||
        String(lead.Phone || "").toLowerCase().includes(search)
      );
    });
  }, [approvedLeads, searchTerm]);

  const totalCommission = useMemo(() => {
    return approvedLeads.reduce(
      (sum, lead) => sum + Number(lead.Commission || 0),
      0
    );
  }, [approvedLeads]);

  const leadsWithCommission = useMemo(() => {
    return approvedLeads.filter((lead) => Number(lead.Commission || 0) > 0)
      .length;
  }, [approvedLeads]);

  return (
    <ManagerShell>
      <div className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6 backdrop-blur-xl">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
              Manager Panel
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              Lead Commissions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add commission to approved leads. This will be included in salary
              reports.
            </p>
          </div>

          <button
            onClick={() => loadCommissionData(true)}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-sm font-bold text-cyan-200 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <MiniCard
            title="Approved Leads"
            value={loading ? "..." : approvedLeads.length}
            icon={CheckCircle2}
            tone="text-emerald-300"
          />

          <MiniCard
            title="Leads With Commission"
            value={loading ? "..." : leadsWithCommission}
            icon={BadgeDollarSign}
            tone="text-yellow-300"
          />

          <MiniCard
            title="Total Commission"
            value={loading ? "..." : formatPKR(totalCommission)}
            icon={BadgeDollarSign}
            tone="text-cyan-300"
          />
        </div>

        <div className="mb-5 flex justify-end">
          <div className="relative w-full xl:w-[380px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search agent, lead, company, phone..."
              className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/35"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-[1.5rem] border border-white/10">
          <table className="w-full min-w-[1250px] text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.2em] text-cyan-300">
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Agent</th>
                <th className="px-5 py-4">Lead</th>
                <th className="px-5 py-4">Company</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">Approved At</th>
                <th className="px-5 py-4">Commission</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    Loading approved leads...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    No approved leads found.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, index) => {
                  const key = makeLeadKey(lead);
                  const isSaving = savingKey === key;

                  return (
                    <tr
                      key={`${key}-${index}`}
                      className="border-t border-white/10 text-slate-300"
                    >
                      <td className="px-5 py-4 text-slate-400">
                        {normalizeDate(lead.Date)}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-bold text-white">
                          {lead.AgentName || "-"}
                        </p>
                        <p className="text-xs text-cyan-300">
                          {lead.AgentID || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-medium text-white">
                        {lead.LeadName || "-"}
                      </td>

                      <td className="px-5 py-4">{lead.Company || "-"}</td>

                      <td className="px-5 py-4 text-cyan-300">
                        {lead.Phone || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {normalizeTime(lead.ApprovedAt)}
                      </td>

                      <td className="px-5 py-4">
                        <input
                          type="number"
                          value={commissionInputs[key] || ""}
                          onChange={(e) =>
                            updateCommissionInput(key, e.target.value)
                          }
                          placeholder="0"
                          className="w-36 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/35"
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() => saveCommission(lead)}
                            disabled={isSaving}
                            className="flex items-center justify-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-bold text-emerald-200 transition hover:bg-emerald-300/15 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Save size={14} />
                            {isSaving ? "Saving..." : "Save"}
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

function MiniCard({ title, value, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className={`mb-3 w-fit rounded-xl bg-white/5 p-2 ${tone}`}>
        <Icon size={17} />
      </div>

      <p className="text-xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{title}</p>
    </div>
  );
}