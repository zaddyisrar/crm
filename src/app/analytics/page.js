"use client";

import {
  PhoneCall,
  CalendarCheck,
  Target,
  TrendingUp,
  Clock3,
  Trophy,
  Flame,
  Activity,
} from "lucide-react";

import PageShell from "@/components/crm/PageShell";
import SectionCard from "@/components/crm/SectionCard";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const weeklyData = [
  { day: "Mon", calls: 14, interested: 4, meetings: 1 },
  { day: "Tue", calls: 18, interested: 5, meetings: 2 },
  { day: "Wed", calls: 11, interested: 3, meetings: 1 },
  { day: "Thu", calls: 24, interested: 8, meetings: 3 },
  { day: "Fri", calls: 19, interested: 6, meetings: 2 },
  { day: "Sat", calls: 28, interested: 9, meetings: 3 },
];

const stats = [
  {
    label: "Calls Completed",
    value: "127",
    note: "+8 this week",
    icon: PhoneCall,
    color: "text-cyan-300",
  },
  {
    label: "Interested Leads",
    value: "38",
    note: "Hot prospects",
    icon: Target,
    color: "text-yellow-300",
  },
  {
    label: "Meetings Booked",
    value: "12",
    note: "+3 this week",
    icon: CalendarCheck,
    color: "text-green-300",
  },
  {
    label: "Conversion Rate",
    value: "28%",
    note: "Personal performance",
    icon: TrendingUp,
    color: "text-purple-300",
  },
];

const achievements = [
  {
    title: "Best Call Day",
    value: "28 Calls",
    note: "Saturday",
    icon: Trophy,
  },
  {
    title: "Avg Daily Calls",
    value: "19",
    note: "This week",
    icon: PhoneCall,
  },
  {
    title: "Avg Call Time",
    value: "09:45",
    note: "Per connected call",
    icon: Clock3,
  },
];

const breakdown = [
  {
    label: "Call Target",
    value: "127 / 150",
    percentage: 84,
  },
  {
    label: "Interested Target",
    value: "38 / 45",
    percentage: 84,
  },
  {
    label: "Meeting Target",
    value: "12 / 15",
    percentage: 80,
  },
  {
    label: "Weekly Consistency",
    value: "6 / 6 Days",
    percentage: 100,
  },
];

export default function AnalyticsPage() {
  return (
    <PageShell
      title="Analytics"
      subtitle="Track your personal performance and weekly progress."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <SectionCard key={stat.label}>
              <div className="text-center">
                <div className="mb-3 flex justify-center">
                  <div className={`rounded-2xl bg-white/5 p-3 ${stat.color}`}>
                    <Icon size={22} />
                  </div>
                </div>

                <p className="text-xs uppercase tracking-widest text-slate-500">
                  {stat.label}
                </p>

                <p className={`mt-3 text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>

                <p className="mt-2 text-xs text-slate-400">{stat.note}</p>
              </div>
            </SectionCard>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Weekly Performance"
          subtitle="Calls, interested leads, and meetings booked"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(34, 211, 238, 0.08)"
                />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(3, 6, 11, 0.95)",
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
                  dataKey="interested"
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

          <div className="mt-6 flex flex-wrap gap-5">
            <Legend color="bg-cyan-300" label="Calls" />
            <Legend color="bg-yellow-300" label="Interested" />
            <Legend color="bg-green-300" label="Meetings" />
          </div>
        </SectionCard>

        <SectionCard title="Performance Targets" subtitle="Weekly goal progress">
          <div className="space-y-5">
            {breakdown.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-cyan-300">
                    {item.value}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full border border-cyan-500/10 bg-slate-800/40">
                  <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {item.percentage}% completed
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <SectionCard title="Achievements" subtitle="Your best performance stats">
          <div className="space-y-4">
            {achievements.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-300">
                      <Icon size={18} />
                    </div>

                    <div>
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.note}</p>
                    </div>
                  </div>

                  <span className="text-sm font-semibold text-cyan-300">
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Agent Insight" subtitle="Simple performance summary">
          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-black/20 text-cyan-300">
                <Flame size={22} />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white">
                  Strong week so far
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Your calls and interested leads are trending upward. Keep the
                  focus on follow-ups and push more interested prospects toward
                  meetings.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <MiniInsight
              icon={Activity}
              label="Consistency"
              value="High"
              tone="text-green-300"
            />
            <MiniInsight
              icon={PhoneCall}
              label="Call Volume"
              value="Good"
              tone="text-cyan-300"
            />
            <MiniInsight
              icon={CalendarCheck}
              label="Booking Push"
              value="Needs Focus"
              tone="text-yellow-300"
            />
          </div>
        </SectionCard>
      </div>
    </PageShell>
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

function MiniInsight({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center">
      <div className={`mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 ${tone}`}>
        <Icon size={17} />
      </div>

      <p className="text-xs uppercase tracking-widest text-slate-500">
        {label}
      </p>

      <p className={`mt-2 text-sm font-semibold ${tone}`}>{value}</p>
    </div>
  );
}