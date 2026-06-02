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
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";
import { sheetsGet } from "@/lib/sheetsApi";

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

function getLeadKey(lead, index) {
  return `${lead.AgentID || "agent"}-${lead.Phone || "phone"}-${index}`;
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
      {status}
    </span>
  );
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [leadStatuses, setLeadStatuses] = useState({});
  const [approvedBy, setApprovedBy] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeads() {
      try {
        const response = await sheetsGet("getLeads");
        const sheetLeads = response.data || [];

        setLeads(sheetLeads);

        const initialStatuses = {};
        const initialApprovedBy = {};

        sheetLeads.forEach((lead, index) => {
          const key = getLeadKey(lead, index);

          initialStatuses[key] = lead.ApprovalStatus || "Pending";
          initialApprovedBy[key] = lead.ApprovedBy || "-";
        });

        setLeadStatuses(initialStatuses);
        setApprovedBy(initialApprovedBy);
      } catch (error) {
        console.error("Admin leads sheet read failed:", error);
        setLeads([]);
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
  }, []);

  function updateLeadStatus(leadKey, status) {
    setLeadStatuses((prev) => ({
      ...prev,
      [leadKey]: status,
    }));

    setApprovedBy((prev) => ({
      ...prev,
      [leadKey]: status === "Approved" ? "Manager" : "-",
    }));
  }

  const today = getTodayKey();

  const filteredLeads = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return leads.filter((lead, index) => {
      const leadKey = getLeadKey(lead, index);
      const status = leadStatuses[leadKey] || "Pending";
      const approvedPerson = approvedBy[leadKey] || "-";

      return (
        String(lead.AgentID || "").toLowerCase().includes(search) ||
        String(lead.Name || "").toLowerCase().includes(search) ||
        String(lead.Company || "").toLowerCase().includes(search) ||
        String(lead.Phone || "").toLowerCase().includes(search) ||
        String(lead.Email || "").toLowerCase().includes(search) ||
        String(lead.Address || "").toLowerCase().includes(search) ||
        String(lead.Note || "").toLowerCase().includes(search) ||
        String(status || "").toLowerCase().includes(search) ||
        String(approvedPerson || "").toLowerCase().includes(search)
      );
    });
  }, [leads, searchTerm, leadStatuses, approvedBy]);

  const todayLeads = leads.filter((lead) => normalizeDate(lead.Date) === today);

  const approvedLeads = Object.values(leadStatuses).filter(
    (status) => status === "Approved"
  ).length;

  const pendingLeads = Object.values(leadStatuses).filter(
    (status) => status === "Pending"
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
        <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-300">
          ADMIN LEADS CENTER
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">Leads</h1>
      </div>

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
              Review all submitted agent leads.
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
          <table className="w-full min-w-[1480px] text-left text-sm">
            <thead className="bg-white/[0.03] text-slate-400">
              <tr>
                <th className="px-4 py-4 font-medium">Agent ID</th>
                <th className="px-4 py-4 font-medium">Lead</th>
                <th className="px-4 py-4 font-medium">Contact</th>
                <th className="px-4 py-4 font-medium">Address</th>
                <th className="px-4 py-4 font-medium">Note</th>
                <th className="px-4 py-4 font-medium">Date</th>
                <th className="px-4 py-4 font-medium">Time</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium">Approved By</th>
                <th className="px-4 py-4 font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td
                    colSpan="10"
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    Loading leads from Google Sheets...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No leads found.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, index) => {
                  const leadKey = getLeadKey(lead, index);
                  const status = leadStatuses[leadKey] || "Pending";
                  const approvedPerson = approvedBy[leadKey] || "-";

                  return (
                    <tr
                      key={leadKey}
                      className="text-slate-300 transition hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-4 text-cyan-300">
                        {lead.AgentID || "-"}
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium text-white">
                          {lead.Name || "-"}
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
                        <StatusBadge status={status} />
                      </td>

                      <td className="px-4 py-4">
                        {approvedPerson !== "-" ? (
                          <span className="font-medium text-emerald-300">
                            {approvedPerson}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              updateLeadStatus(leadKey, "Approved")
                            }
                            className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-400/15"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              updateLeadStatus(leadKey, "Rejected")
                            }
                            className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-400/15"
                          >
                            Reject
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
    </AdminShell>
  );
}