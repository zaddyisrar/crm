"use client";

import {
  Users,
  Target,
  Clock3,
  CalendarCheck,
  PhoneCall,
  Activity,
  UserCheck,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";

const stats = [
  {
    label: "Active Agents",
    value: "12",
    note: "Currently online",
    icon: Users,
    tone: "text-cyan-300",
  },
  {
    label: "Campaigns",
    value: "5",
    note: "3 running today",
    icon: Target,
    tone: "text-purple-300",
  },
  {
    label: "Attendance",
    value: "91%",
    note: "Today’s presence",
    icon: Clock3,
    tone: "text-green-300",
  },
  {
    label: "Meetings",
    value: "18",
    note: "Booked this week",
    icon: CalendarCheck,
    tone: "text-yellow-300",
  },
];

const liveAgents = [
  {
    name: "Hamza",
    id: "LR-HAMZA",
    campaign: "Commercial Cleaning",
    status: "Calling",
    time: "02:14:32",
    color: "text-green-300",
    dot: "bg-green-300",
  },
  {
    name: "Ammar",
    id: "LR-AMMAR",
    campaign: "Roofing",
    status: "Online",
    time: "01:40:10",
    color: "text-cyan-300",
    dot: "bg-cyan-300",
  },
  {
    name: "Sameen",
    id: "LR-SAMEEN",
    campaign: "Solar",
    status: "Follow-up",
    time: "00:52:44",
    color: "text-yellow-300",
    dot: "bg-yellow-300",
  },
];

const campaignPulse = [
  {
    campaign: "Commercial Cleaning",
    leads: 120,
    assigned: 42,
    completed: "68%",
  },
  {
    campaign: "Roofing",
    leads: 84,
    assigned: 31,
    completed: "44%",
  },
  {
    campaign: "Solar",
    leads: 64,
    assigned: 22,
    completed: "38%",
  },
];

const alerts = [
  "2 agents have not checked in yet",
  "Roofing campaign needs more lead assignment",
  "3 follow-ups pending from yesterday",
];

export default function AdminPage() {
  return (
    <AdminShell
      title="Admin Dashboard"
      subtitle="Control center for campaigns, agents, attendance, and CRM operations."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ${stat.tone}`}
                >
                  <Icon size={20} />
                </div>

                <span className="text-xs text-slate-500">{stat.note}</span>
              </div>

              <p className="text-3xl font-black text-white">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
                Live Operations
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">
                Agent Activity
              </h3>
            </div>

            <span className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">
              Live
            </span>
          </div>

          <div className="space-y-3">
            {liveAgents.map((agent) => (
              <div
                key={agent.id}
                className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_1fr_0.7fr_0.5fr]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${agent.dot}`} />
                    <p className="font-medium text-white">{agent.name}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{agent.id}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Campaign</p>
                  <p className="mt-1 text-sm text-slate-300">{agent.campaign}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <p className={`mt-1 text-sm font-medium ${agent.color}`}>
                    {agent.status}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Time</p>
                  <p className="mt-1 text-sm text-cyan-300">{agent.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck size={18} className="text-cyan-300" />
            <h3 className="text-lg font-semibold text-white">Admin Actions</h3>
          </div>

          <div className="grid gap-3">
            <AdminAction href="/admin/users" label="Create Agent / Manager" icon={Users} />
            <AdminAction href="/admin/campaigns" label="Add Campaign" icon={Target} />
            <AdminAction href="/admin/attendance" label="View Attendance" icon={UserCheck} />
            <AdminAction href="/admin/analytics" label="Open Analytics" icon={Activity} />
          </div>

          <div className="mt-5 rounded-2xl border border-yellow-300/15 bg-yellow-300/10 p-4">
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle size={17} className="text-yellow-300" />
              <p className="font-medium text-yellow-200">Needs Attention</p>
            </div>

            <div className="space-y-2">
              {alerts.map((alert) => (
                <p key={alert} className="text-sm text-slate-300">
                  • {alert}
                </p>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Campaign Pulse</h3>
            <a href="/admin/campaigns" className="text-sm text-cyan-300">
              Manage →
            </a>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-slate-400">
                <tr>
                  <th className="px-4 py-4 font-medium">Campaign</th>
                  <th className="px-4 py-4 font-medium">Leads</th>
                  <th className="px-4 py-4 font-medium">Assigned</th>
                  <th className="px-4 py-4 font-medium">Completed</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {campaignPulse.map((campaign) => (
                  <tr key={campaign.campaign} className="text-slate-300">
                    <td className="px-4 py-4 text-white">{campaign.campaign}</td>
                    <td className="px-4 py-4">{campaign.leads}</td>
                    <td className="px-4 py-4">{campaign.assigned}</td>
                    <td className="px-4 py-4 text-cyan-300">
                      {campaign.completed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
          <h3 className="mb-5 text-lg font-semibold text-white">
            Today’s Summary
          </h3>

          <div className="grid gap-3">
            <SummaryRow label="Calls Completed" value="184" icon={PhoneCall} />
            <SummaryRow label="Agents Present" value="12 / 14" icon={Users} />
            <SummaryRow label="Follow-ups Due" value="23" icon={Clock3} />
            <SummaryRow label="Meetings Booked" value="6" icon={CalendarCheck} />
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function AdminAction({ href, label, icon: Icon }) {
  return (
    <a
      href={href}
      className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-200"
    >
      <span className="flex items-center gap-2">
        <Icon size={16} />
        {label}
      </span>
      <ArrowRight size={16} />
    </a>
  );
}

function SummaryRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
      <span className="flex items-center gap-3 text-sm text-slate-300">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-300">
          <Icon size={16} />
        </span>
        {label}
      </span>

      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}