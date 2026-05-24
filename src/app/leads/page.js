"use client";

import { useMemo, useState } from "react";
import { Search, Plus, X } from "lucide-react";

import PageShell from "@/components/crm/PageShell";
import SectionCard from "@/components/crm/SectionCard";
import DataTable from "@/components/crm/DataTable";
import ActionButton from "@/components/crm/ActionButton";
import { leads as defaultLeads } from "@/data/crmData";

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("my");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leads, setLeads] = useState(defaultLeads);

  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
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

  const filteredLeads = currentLeads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: "name", label: "Name" },
    { key: "company", label: "Company" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" },
    { key: "assignedTo", label: "Assigned To" },
  ];

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const newLead = {
      id: Date.now(),
      ...form,
    };

    setLeads((prev) => [newLead, ...prev]);
    setForm({
      name: "",
      company: "",
      phone: "",
      email: "",
      status: "New",
      assignedTo: "Muhammad",
    });
    setIsModalOpen(false);
    setActiveSection("my");
  }

  return (
    <PageShell title="Leads" subtitle="Manage and track all your leads.">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveSection("my")}
            className={`rounded-2xl border px-5 py-3 text-sm transition ${
              activeSection === "my"
                ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
            }`}
          >
            My Leads ({myLeads.length})
          </button>

          <button
            onClick={() => setActiveSection("all")}
            className={`rounded-2xl border px-5 py-3 text-sm transition ${
              activeSection === "all"
                ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
            }`}
          >
            All Leads ({leads.length})
          </button>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative min-w-full md:min-w-[360px]">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#071018]/80 py-3 pl-11 pr-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/35"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15"
          >
            <Plus size={18} />
            Add Lead
          </button>
        </div>
      </div>

      <SectionCard
        title={
          activeSection === "my"
            ? `My Leads (${filteredLeads.length})`
            : `All Leads (${filteredLeads.length})`
        }
        subtitle={
          activeSection === "my"
            ? "Leads assigned to Muhammad."
            : "Complete team lead pipeline."
        }
      >
        <DataTable columns={columns} data={filteredLeads} showActions />
      </SectionCard>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-cyan-300/15 bg-[#071018] p-6 shadow-[0_0_80px_rgba(34,211,238,0.08)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white">
                  Add New Lead
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Fill prospect details and assign ownership.
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

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/35"
                >
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Interested</option>
                  <option>Qualified</option>
                  <option>Booked</option>
                  <option>Follow Up</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Assigned To
                </label>
                <select
                  name="assignedTo"
                  value={form.assignedTo}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/35"
                >
                  <option>Muhammad</option>
                  <option>Hamza</option>
                  <option>Ammar</option>
                  <option>Sameen</option>
                  <option>Asim</option>
                </select>
              </div>

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