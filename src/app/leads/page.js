"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  X,
  Users,
  UserCheck,
  Flame,
  Clock3,
  Filter,
  MoreHorizontal,
  PhoneCall,
  Mail,
  Building2,
} from "lucide-react";

import PageShell from "@/components/crm/PageShell";
import StatCard from "@/components/crm/StatCard";
import { leads as defaultLeads } from "@/data/crmData";

const statuses = ["All", "New", "Contacted", "Interested", "Qualified", "Booked", "Follow Up"];

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("my");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leads, setLeads] = useState(defaultLeads);

  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    campaign: "Commercial Cleaning",
    status: "New",
    assignedTo: "Muhammad",
  });

  const myLeads = useMemo(
    () =>
      leads.filter(
        (lead) =>
          lead.assignedTo === "Muhammad" ||
          lead.assignedTo === "Muhammad Israr"
      ),
    [leads]
  );

  const currentLeads = activeSection === "my" ? myLeads : leads;

  const filteredLeads = currentLeads.filter((lead) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      lead.name?.toLowerCase().includes(search) ||
      lead.company?.toLowerCase().includes(search) ||
      lead.email?.toLowerCase().includes(search) ||
      lead.phone?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: currentLeads.length,
    new: currentLeads.filter((lead) => lead.status === "New").length,
    interested: currentLeads.filter((lead) => lead.status === "Interested").length,
    followUps: currentLeads.filter((lead) => lead.status === "Follow Up").length,
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const newLead = {
      id: Date.now(),
      ...form,
      campaign: form.campaign || "Commercial Cleaning",
      lastContact: "Not contacted",
    };

    setLeads((prev) => [newLead, ...prev]);
    setForm({
      name: "",
      company: "",
      phone: "",
      email: "",
      campaign: "Commercial Cleaning",
      status: "New",
      assignedTo: "Muhammad",
    });
    setIsModalOpen(false);
    setActiveSection("my");
  }

  return (
    <PageShell
      title="Leads"
      subtitle="Manage assigned prospects, lead status, and campaign pipeline."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Leads"
          value={stats.total}
          note={activeSection === "my" ? "Assigned to you" : "All CRM leads"}
          icon={Users}
          accent="cyan"
        />
        <StatCard
          label="New Leads"
          value={stats.new}
          note="Ready for first touch"
          icon={Building2}
          accent="purple"
        />
        <StatCard
          label="Interested"
          value={stats.interested}
          note="Hot opportunities"
          icon={Flame}
          accent="yellow"
        />
        <StatCard
          label="Follow-ups"
          value={stats.followUps}
          note="Need action"
          icon={Clock3}
          accent="green"
        />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveSection("my")}
              className={`rounded-xl border px-4 py-2.5 text-sm transition ${
                activeSection === "my"
                  ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                  : "border-white/10 bg-black/20 text-slate-400 hover:text-white"
              }`}
            >
              My Leads ({myLeads.length})
            </button>

            <button
              onClick={() => setActiveSection("all")}
              className={`rounded-xl border px-4 py-2.5 text-sm transition ${
                activeSection === "all"
                  ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                  : "border-white/10 bg-black/20 text-slate-400 hover:text-white"
              }`}
            >
              All Leads ({leads.length})
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15"
          >
            <Plus size={17} />
            Add Lead
          </button>
        </div>

        <div className="mb-5 grid gap-3 xl:grid-cols-[1fr_240px]">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, company, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/35"
            />
          </div>

          <div className="relative">
            <Filter
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={17}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-slate-200 outline-none focus:border-cyan-300/35"
            >
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-white/[0.03] text-slate-400">
              <tr>
                <th className="px-4 py-4 font-medium">Lead</th>
                <th className="px-4 py-4 font-medium">Contact</th>
                <th className="px-4 py-4 font-medium">Campaign</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium">Assigned To</th>
                <th className="px-4 py-4 font-medium">Last Contact</th>
                <th className="px-4 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id || lead.email}
                  className="text-slate-300 transition hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{lead.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{lead.company}</p>
                  </td>

                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-xs text-slate-300">
                        <PhoneCall size={13} className="text-cyan-300" />
                        {lead.phone}
                      </p>
                      <p className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail size={13} />
                        {lead.email}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {lead.campaign || "Commercial Cleaning"}
                  </td>

                  <td className="px-4 py-4">
                    <StatusPill status={lead.status} />
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-300/10 text-xs text-cyan-300">
                        {(lead.assignedTo || "M").slice(0, 1)}
                      </span>
                      {lead.assignedTo}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-slate-400">
                    {lead.lastContact || "Today"}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <a
                        href="/calls"
                        className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs text-cyan-200 hover:bg-cyan-300/15"
                      >
                        Dial
                      </a>

                      <button className="rounded-lg border border-white/10 bg-black/20 p-2 text-slate-400 hover:text-white">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredLeads.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No leads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-cyan-300/15 bg-[#071018] p-6 shadow-[0_0_80px_rgba(34,211,238,0.08)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white">
                  Add New Lead
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Add prospect details and assign ownership.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-white/10 p-2 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <Field
                label="Lead Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Carter"
                required
              />

              <Field
                label="Company"
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="CleanPro Solutions"
                required
              />

              <Field
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 555 000 1234"
                required
              />

              <Field
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@company.com"
                required
              />

              <SelectField
                label="Campaign"
                name="campaign"
                value={form.campaign}
                onChange={handleChange}
                options={[
                  "Commercial Cleaning",
                  "Roofing",
                  "Solar",
                  "Real Estate",
                  "SaaS",
                ]}
              />

              <SelectField
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                options={[
                  "New",
                  "Contacted",
                  "Interested",
                  "Qualified",
                  "Booked",
                  "Follow Up",
                ]}
              />

              <SelectField
                label="Assigned To"
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleChange}
                options={["Muhammad", "Hamza", "Ammar", "Sameen", "Asim"]}
                className="md:col-span-2"
              />

              <div className="mt-2 flex justify-end gap-3 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-slate-300 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 text-sm font-medium text-cyan-100 hover:bg-cyan-300/15"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-300">{label}</label>
      <input
        {...props}
        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/35"
      />
    </div>
  );
}

function SelectField({ label, options, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm text-slate-300">{label}</label>
      <select
        {...props}
        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/35"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function StatusPill({ status }) {
  const styles = {
    New: "border-cyan-300/20 bg-cyan-300/10 text-cyan-200",
    Contacted: "border-blue-300/20 bg-blue-300/10 text-blue-200",
    Interested: "border-yellow-300/20 bg-yellow-300/10 text-yellow-200",
    Qualified: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
    Booked: "border-green-300/20 bg-green-300/10 text-green-200",
    "Follow Up": "border-purple-300/20 bg-purple-300/10 text-purple-200",
  };

  return (
    <span
      className={`rounded-lg border px-3 py-1 text-xs ${
        styles[status] || "border-white/10 bg-white/5 text-slate-300"
      }`}
    >
      {status}
    </span>
  );
}