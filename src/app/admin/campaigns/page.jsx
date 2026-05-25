"use client";

import { useMemo, useState } from "react";
import {
  Target,
  Plus,
  Search,
  Users,
  Clock3,
  CheckCircle2,
  MoreHorizontal,
  X,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";

const initialCampaigns = [
  {
    id: 1,
    name: "Commercial Cleaning",
    industry: "Commercial Cleaning",
    status: "Active",
    leads: 120,
    assignedAgents: ["LR-HAMZA", "LR-SAMEEN"],
    progress: 68,
    created: "May 25",
  },
  {
    id: 2,
    name: "Roofing",
    industry: "Roofing",
    status: "Active",
    leads: 84,
    assignedAgents: ["LR-AMMAR"],
    progress: 44,
    created: "May 24",
  },
  {
    id: 3,
    name: "Solar",
    industry: "Solar",
    status: "Paused",
    leads: 64,
    assignedAgents: ["LR-ASIM"],
    progress: 38,
    created: "May 22",
  },
];

const agents = ["LR-HAMZA", "LR-AMMAR", "LR-SAMEEN", "LR-ASIM", "LR-ZADDY"];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    industry: "Commercial Cleaning",
    status: "Active",
    leads: "",
    assignedAgent: "LR-HAMZA",
  });

  const filteredCampaigns = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return campaigns.filter(
      (campaign) =>
        campaign.name.toLowerCase().includes(search) ||
        campaign.industry.toLowerCase().includes(search) ||
        campaign.status.toLowerCase().includes(search)
    );
  }, [campaigns, searchTerm]);

  const activeCampaigns = campaigns.filter((x) => x.status === "Active").length;
  const totalLeads = campaigns.reduce((sum, x) => sum + Number(x.leads || 0), 0);
  const assignedAgents = new Set(campaigns.flatMap((x) => x.assignedAgents)).size;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const newCampaign = {
      id: Date.now(),
      name: form.name,
      industry: form.industry,
      status: form.status,
      leads: Number(form.leads || 0),
      assignedAgents: [form.assignedAgent],
      progress: 0,
      created: "Today",
    };

    setCampaigns((prev) => [newCampaign, ...prev]);
    setForm({
      name: "",
      industry: "Commercial Cleaning",
      status: "Active",
      leads: "",
      assignedAgent: "LR-HAMZA",
    });
    setIsModalOpen(false);
  }

  return (
    <AdminShell
      title="Campaigns"
      subtitle="Create campaigns, assign agents, and monitor lead pipeline progress."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStat
          label="Total Campaigns"
          value={campaigns.length}
          note="All campaign workspaces"
          icon={Target}
          tone="text-cyan-300"
        />
        <AdminStat
          label="Active Campaigns"
          value={activeCampaigns}
          note="Currently running"
          icon={CheckCircle2}
          tone="text-green-300"
        />
        <AdminStat
          label="Total Leads"
          value={totalLeads}
          note="Across campaigns"
          icon={Clock3}
          tone="text-yellow-300"
        />
        <AdminStat
          label="Assigned Agents"
          value={assignedAgents}
          note="Unique agents assigned"
          icon={Users}
          tone="text-purple-300"
        />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
              Campaign Control
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              Campaign Workspaces
            </h3>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15"
          >
            <Plus size={17} />
            Add Campaign
          </button>
        </div>

        <div className="relative mb-5">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/35"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-white/[0.03] text-slate-400">
              <tr>
                <th className="px-4 py-4 font-medium">Campaign</th>
                <th className="px-4 py-4 font-medium">Industry</th>
                <th className="px-4 py-4 font-medium">Leads</th>
                <th className="px-4 py-4 font-medium">Assigned Agents</th>
                <th className="px-4 py-4 font-medium">Progress</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {filteredCampaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="text-slate-300 transition hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{campaign.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Created {campaign.created}
                    </p>
                  </td>

                  <td className="px-4 py-4">{campaign.industry}</td>
                  <td className="px-4 py-4 text-cyan-300">{campaign.leads}</td>

                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {campaign.assignedAgents.map((agent) => (
                        <span
                          key={agent}
                          className="rounded-lg border border-cyan-300/15 bg-cyan-300/10 px-2.5 py-1 text-xs text-cyan-200"
                        >
                          {agent}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-cyan-400"
                          style={{ width: `${campaign.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">
                        {campaign.progress}%
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <StatusPill status={campaign.status} />
                  </td>

                  <td className="px-4 py-4 text-right">
                    <button className="rounded-lg border border-white/10 bg-black/20 p-2 text-slate-400 hover:text-white">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredCampaigns.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No campaigns found.
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
                  Add Campaign
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Create a new workspace and assign the first agent.
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
                label="Campaign Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Commercial Cleaning"
                required
              />

              <SelectField
                label="Industry"
                name="industry"
                value={form.industry}
                onChange={handleChange}
                options={[
                  "Commercial Cleaning",
                  "Roofing",
                  "Solar",
                  "Real Estate",
                  "SaaS",
                  "Recruiting",
                  "Other",
                ]}
              />

              <Field
                label="Initial Leads"
                name="leads"
                type="number"
                value={form.leads}
                onChange={handleChange}
                placeholder="100"
              />

              <SelectField
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                options={["Active", "Paused", "Completed"]}
              />

              <SelectField
                label="Assign Agent"
                name="assignedAgent"
                value={form.assignedAgent}
                onChange={handleChange}
                options={agents}
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
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function AdminStat({ label, value, note, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className={`rounded-xl bg-white/5 p-3 ${tone}`}>
          <Icon size={20} />
        </div>
        <span className="text-xs text-slate-500">{note}</span>
      </div>

      <p className="text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  );
}

function Field({ label, className = "", ...props }) {
  return (
    <div className={className}>
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
    Active: "border-emerald-300/20 bg-emerald-300/10 text-emerald-300",
    Paused: "border-yellow-300/20 bg-yellow-300/10 text-yellow-300",
    Completed: "border-cyan-300/20 bg-cyan-300/10 text-cyan-300",
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