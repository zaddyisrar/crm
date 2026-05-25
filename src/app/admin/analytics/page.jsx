"use client";

import {
  BarChart3,
  PhoneCall,
  CalendarCheck,
  Target,
  TrendingUp,
  Users,
  Flame,
  Clock3,
  Activity,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

import AdminShell from "@/components/admin/AdminShell";

const weeklyPerformance = [
  { day: "Mon", calls: 142, leads: 38, meetings: 7 },
  { day: "Tue", calls: 168, leads: 44, meetings: 9 },
  { day: "Wed", calls: 131, leads: 35, meetings: 6 },
  { day: "Thu", calls: 184, leads: 52, meetings: 11 },
  { day: "Fri", calls: 176, leads: 49, meetings: 10 },
  { day: "Sat", calls: 203, leads: 61, meetings: 14 },
];

const campaignData = [
  { campaign: "Cleaning", conversion: 34 },
  { campaign: "Roofing", conversion: 26 },
  { campaign: "Solar", conversion: 21 },
  { campaign: "Real Estate", conversion: 18 },
  { campaign: "SaaS", conversion: 29 },
];

const topAgents = [
  {
    name: "Hamza",
    id: "LR-HAMZA",
    calls: 127,
    interested: 38,
    meetings: 12,
    rate: "28%",
  },
  {
    name: "Sameen",
    id: "LR-SAMEEN",
    calls: 118,
    interested: 34,
    meetings: 10,
    rate: "25%",
  },
  {
    name: "Ammar",
    id: "LR-AMMAR",
    calls: 104,
    interested: 29,
    meetings: 8,
    rate: "22%",
  },
];

const campaignSummary = [
  {
    name: "Commercial Cleaning",
    leads: 120,
    calls: 84,
    interested: 31,
    meetings: 11,
    conversion: "34%",
  },
  {
    name: "Roofing",
    leads: 84,
    calls: 59,
    interested: 18,
    meetings: 7,
    conversion: "26%",
  },
  {
    name: "Solar",
    leads: 64,
    calls: 41,
    interested: 12,
    meetings: 5,
    conversion: "21%",
  },
];

const insights = [
  "Commercial Cleaning is currently the strongest campaign.",
  "Roofing needs more follow-up activity this week.",
  "Hamza has the highest personal conversion rate.",
  "Saturday produced the highest call volume.",
];

export default function AnalyticsPage() {
  return (
    <AdminShell
      title="Analytics"
      subtitle="Performance reports, campaign insights, and team productivity."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStat
          label="Total Calls"
          value="1,004"
          note="+14% this week"
          icon={PhoneCall}
          tone="text-cyan-300"
        />
        <AdminStat
          label="Interested Leads"
          value="279"
          note="Across campaigns"
          icon={Flame}
          tone="text-yellow-300"
        />
        <AdminStat
          label="Meetings Booked"
          value="57"
          note="+18% this week"
          icon={CalendarCheck}
          tone="text-green-300"
        />
        <AdminStat
          label="Avg Conversion"
          value="27%"
          note="Lead to interest"
          icon={TrendingUp}
          tone="text-purple-300"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
              Weekly Report
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              CRM Activity Trend
            </h3>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyPerformance}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(34, 211, 238, 0.08)"
                />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(3, 6, 11, 0.96)",
                    border: "1px solid rgba(34, 211, 238, 0.25)",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="calls"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={{ fill: "#22d3ee", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#facc15"
                  strokeWidth={2}
                  dot={{ fill: "#facc15", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="meetings"
                  stroke="#4ade80"
                  strokeWidth={2}
                  dot={{ fill: "#4ade80", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 flex flex-wrap gap-5">
            <Legend color="bg-cyan-300" label="Calls" />
            <Legend color="bg-yellow-300" label="Interested Leads" />
            <Legend color="bg-green-300" label="Meetings" />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
          <div className="mb-5 flex items-center gap-2">
            <BarChart3 size={18} className="text-cyan-300" />
            <h3 className="text-lg font-semibold text-white">
              Campaign Conversion
            </h3>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(34, 211, 238, 0.08)"
                />
                <XAxis dataKey="campaign" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(3, 6, 11, 0.96)",
                    border: "1px solid rgba(34, 211, 238, 0.25)",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                  }}
                />
                <Bar dataKey="conversion" fill="#22d3ee" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
          <div className="mb-5 flex items-center gap-2">
            <Users size={18} className="text-cyan-300" />
            <h3 className="text-lg font-semibold text-white">
              Top Agents
            </h3>
          </div>

          <div className="space-y-3">
            {topAgents.map((agent, index) => (
              <div
                key={agent.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">
                      #{index + 1} {agent.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{agent.id}</p>
                  </div>

                  <span className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-300">
                    {agent.rate}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <MiniMetric label="Calls" value={agent.calls} />
                  <MiniMetric label="Interested" value={agent.interested} />
                  <MiniMetric label="Meetings" value={agent.meetings} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
          <div className="mb-5 flex items-center gap-2">
            <Target size={18} className="text-cyan-300" />
            <h3 className="text-lg font-semibold text-white">
              Campaign Summary
            </h3>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-white/[0.03] text-slate-400">
                <tr>
                  <th className="px-4 py-4 font-medium">Campaign</th>
                  <th className="px-4 py-4 font-medium">Leads</th>
                  <th className="px-4 py-4 font-medium">Calls</th>
                  <th className="px-4 py-4 font-medium">Interested</th>
                  <th className="px-4 py-4 font-medium">Meetings</th>
                  <th className="px-4 py-4 font-medium">Rate</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {campaignSummary.map((campaign) => (
                  <tr key={campaign.name} className="text-slate-300">
                    <td className="px-4 py-4 text-white">{campaign.name}</td>
                    <td className="px-4 py-4">{campaign.leads}</td>
                    <td className="px-4 py-4">{campaign.calls}</td>
                    <td className="px-4 py-4 text-yellow-300">
                      {campaign.interested}
                    </td>
                    <td className="px-4 py-4 text-green-300">
                      {campaign.meetings}
                    </td>
                    <td className="px-4 py-4 text-cyan-300">
                      {campaign.conversion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Activity size={18} className="text-cyan-300" />
          <h3 className="text-lg font-semibold text-white">
            Admin Insights
          </h3>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {insights.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
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

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="font-semibold text-cyan-300">{value}</p>
      <p className="mt-1 text-slate-500">{label}</p>
    </div>
  );
}