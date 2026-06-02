"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  Building2,
  Clock3,
  Mail,
  PhoneCall,
  MapPin,
  FileText,
  CheckCircle2,
  RefreshCcw,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";
import { sheetsPost } from "@/lib/sheetsApi";

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function normalizeDate(value) {
  if (!value) return "";

  const stringValue = String(value);

  if (stringValue.includes("T")) {
    return stringValue.split("T")[0];
  }

  return stringValue;
}

function StatusBadge({ status }) {
  const styles = {
    Pending: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
    Approved: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    Rejected: "border-red-400/20 bg-red-400/10 text-red-300",
  };

  return (
    <span
      className={`inline-flex rounded-lg border px-3 py-1 text-xs font-medium ${
        styles[status] || styles.Pending
      }`}
    >
      {status || "Pending"}
    </span>
  );
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadLeads() {
    try {
      setLoading(true);
      setError("");

      const response = await sheetsPost({ action: "getLeads" });
      setLeads(response.data || []);
    } catch (err) {
      console.error("Admin leads sheet read failed:", err);
      setError(err.message || "Failed to load leads from Google Sheets");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  const today = getTodayKey();

  const filteredLeads = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return leads.filter((lead) => {
      return (
        String(lead.AgentID || "").toLowerCase().includes(search) ||
        String(lead.AgentName || "").toLowerCase().includes(search) ||
        String(lead.LeadName || "").toLowerCase().includes(search) ||
        String(lead.Company || "").toLowerCase().includes(search) ||
        String(lead.Phone || "").toLowerCase().includes(search) ||
        String(lead.Email || "").toLowerCase().includes(search) ||
        String(lead.Address || "").toLowerCase().includes(search) ||
        String(lead.Note || "").toLowerCase().includes(search) ||
        String(lead.ApprovalStatus || "").toLowerCase().includes(search) ||
        String(lead.ApprovedBy || "").toLowerCase().includes(search) ||
        String(lead.ApprovedAt || "").toLowerCase().includes(search)
      );
    });
  }, [leads, searchTerm]);

  const todayLeads = leads.filter((lead) => normalizeDate(lead.Date) === today);

  const approvedLeads = leads.filter(
    (lead) => String(lead.ApprovalStatus || "") === "Approved"
  ).length;

  const pendingLeads = leads.filter(
    (lead) => String(lead.ApprovalStatus || "") === "Pending"
  ).length;

  const stats = [
    {
      title: "Total Leads",
      value: loading ? "..." : leads.length,
      note: "All saved leads",
      icon: Users,
      color: "text-cyan-300",
    },
    {
      title: "Today Leads",
      value: loading ? "..." : todayLeads.length,
      note: "Added today",
      icon: Clock3,
      color: "text-green-300",
    },
    {
      title: "Approved Leads",
      value: loading ? "..." : approvedLeads,
      note: "Manager approved",
      icon: CheckCircle2,
      color: "text-emerald-300",
    },
    {
      title: "Pending Leads",
      value: loading ? "..." : pendingLeads,
      note: "Needs review",
      icon: Building2,
      color: "text-yellow-300",
    },
  ];

  return (
    <AdminShell>
      <div className="mb-5 rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03] px-8 py-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-300">
              ADMIN LEADS CENTER
            </p>

            <h1 className="mt-3 text-4xl font-black text-white">Leads</h1>
          </div>

          <button
            onClick={loadLeads}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold text-cyan-200 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
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

      <div className="grid gap-4 lg:grid-cols-4">
        {stats.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03] p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={`rounded-xl bg-white/[0.04] p-3 ${card.color}`}>
                  <Icon size={18} />
                </div>

                <p className="text-xs text-slate-500">{card.note}</p>
              </div>

              <h2 className="text-2xl font-black text-white">{card.value}</h2>
              <p className="mt-1 text-sm text-slate-400">{card.title}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03] p-5">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">All Leads</h2>
            <p className="mt-1 text-sm text-slate-500">
              Read-only view of all submitted agent leads from Google Sheets.
            </p>
          </div>

          <div className="relative w-full xl:w-[360px]">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />

            <input
              type="text"
              placeholder="Search leads, agent, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-300/35"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[1600px] text-left text-sm">
            <thead className="bg-white/[0.03] text-slate-400">
              <tr>
                <th className="px-4 py-4 font-medium">Agent ID</th>
                <th className="px-4 py-4 font-medium">Agent Name</th>
                <th className="px-4 py-4 font-medium">Lead</th>
                <th className="px-4 py-4 font-medium">Contact</th>
                <th className="px-4 py-4 font-medium">Address</th>
                <th className="px-4 py-4 font-medium">Note</th>
                <th className="px-4 py-4 font-medium">Date</th>
                <th className="px-4 py-4 font-medium">Time</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium">Approved By</th>
                <th className="px-4 py-4 font-medium">Approved At</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td
                    colSpan="11"
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    Loading leads from Google Sheets...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td
                    colSpan="11"
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No leads found.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, index) => (
                  <tr
                    key={`${lead.AgentID || "agent"}-${lead.Phone || "phone"}-${
                      lead.Date || "date"
                    }-${lead.Time || "time"}-${index}`}
                    className="text-slate-300 transition hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-4 text-cyan-300">
                      {lead.AgentID || "-"}
                    </td>

                    <td className="px-4 py-4 font-medium text-white">
                      {lead.AgentName || "-"}
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium text-white">
                        {lead.LeadName || "-"}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <Building2 size={13} />
                        {lead.Company || "-"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 text-xs text-slate-300">
                          <PhoneCall size={13} className="text-cyan-300" />
                          {lead.Phone || "-"}
                        </p>

                        <p className="flex items-center gap-2 text-xs text-slate-500">
                          <Mail size={13} />
                          {lead.Email || "-"}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <p className="flex items-center gap-2 text-xs text-slate-400">
                        <MapPin size={13} className="text-cyan-300" />
                        {lead.Address || "-"}
                      </p>
                    </td>

                    <td className="max-w-[220px] px-4 py-4">
                      <p className="flex items-center gap-2 truncate text-xs text-slate-400">
                        <FileText size={13} className="text-cyan-300" />
                        {lead.Note || "-"}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-slate-400">
                      {normalizeDate(lead.Date) || "-"}
                    </td>

                    <td className="px-4 py-4 text-slate-400">
                      {lead.Time || "-"}
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={lead.ApprovalStatus || "Pending"} />
                    </td>

                    <td className="px-4 py-4">
                      {lead.ApprovedBy && lead.ApprovedBy !== "-" ? (
                        <span className="font-medium text-emerald-300">
                          {lead.ApprovedBy}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-slate-400">
                      {lead.ApprovedAt || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}