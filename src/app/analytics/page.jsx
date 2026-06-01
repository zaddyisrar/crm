"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  PhoneCall,
  CalendarCheck,
  Target,
  TrendingUp,
  Users,
  Flame,
  Activity,
  Wallet,
  Search,
  CalendarDays,
  BadgeDollarSign,
  UserCheck,
  UserX,
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

const MONTHLY_SALARY = 50000;

const agentSalaryData = [
  { name: "Sameer", id: "LR-SAMEER", presentDays: 20 },
  { name: "Asim", id: "LR-ASIM", presentDays: 18 },
  { name: "Labeeb", id: "LR-LABEEB", presentDays: 19 },
  { name: "Eba", id: "LR-EBA", presentDays: 17 },
  { name: "Pascal", id: "LR-PASCAL", presentDays: 21 },
  { name: "Ammar", id: "LR-AMMAR", presentDays: 16 },
  { name: "Muzamil", id: "LR-MUZAMIL", presentDays: 20 },
  { name: "Mustafa", id: "LR-MUSTAFA", presentDays: 18 },
  { name: "Israr", id: "LR-ISRAR", presentDays: 21 },
];

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
  { name: "Sameer", id: "LR-SAMEER", calls: 127, interested: 38, meetings: 12, rate: "28%" },
  { name: "Israr", id: "LR-ISRAR", calls: 118, interested: 34, meetings: 10, rate: "25%" },
  { name: "Ammar", id: "LR-AMMAR", calls: 104, interested: 29, meetings: 8, rate: "22%" },
];

const campaignSummary = [
  { name: "Commercial Cleaning", leads: 120, calls: 84, interested: 31, meetings: 11, conversion: "34%" },
  { name: "Roofing", leads: 84, calls: 59, interested: 18, meetings: 7, conversion: "26%" },
  { name: "Solar", leads: 64, calls: 41, interested: 12, meetings: 5, conversion: "21%" },
];

const insights = [
  "Salary analytics is currently based on demo attendance data.",
  "Base salary is fixed at 50,000 PKR for every agent.",
  "Saturday and Sunday are counted as off days.",
  "Next step is connecting this page with Google Sheets attendance data.",
];

function getWorkingDaysInMonth(year, month) {
  let total = 0;

  for (
    let day = new Date(year, month, 1);
    day.getMonth() === month;
    day.setDate(day.getDate() + 1)
  ) {
    const weekDay = day.getDay();

    if (weekDay !== 0 && weekDay !== 6) {
      total++;
    }
  }

  return total;
}

function formatPKR(value) {
  return `${Math.round(value).toLocaleString()} PKR`;
}

export default function AnalyticsPage() {
  const today = new Date();

  const [searchAgent, setSearchAgent] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  );

  const salaryRows = useMemo(() => {
    const [yearValue, monthValue] = selectedMonth.split("-").map(Number);
    const workingDays = getWorkingDaysInMonth(yearValue, monthValue - 1);
    const dailySalary = MONTHLY_SALARY / workingDays;

    return agentSalaryData
      .filter((agent) => {
        const search = searchAgent.toLowerCase();

        return (
          agent.name.toLowerCase().includes(search) ||
          agent.id.toLowerCase().includes(search)
        );
      })
      .map((agent) => {
        const presentDays = Math.min(agent.presentDays, workingDays);
        const absentDays = Math.max(workingDays - presentDays, 0);
        const earnedSalary = dailySalary * presentDays;

        return {
          ...agent,
          workingDays,
          presentDays,
          absentDays,
          dailySalary,
          earnedSalary,
        };
      });
  }, [searchAgent, selectedMonth]);

  const selectedSummary = salaryRows[0];

  return (
    <AdminShell
      title="Analytics"
      subtitle="Performance reports, salary analytics, campaign insights, and team productivity."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStat label="Total Calls" value="1,004" note="Demo data" icon={PhoneCall} tone="text-cyan-300" />
        <AdminStat label="Interested Leads" value="279" note="Demo data" icon={Flame} tone="text-yellow-300" />
        <AdminStat label="Meetings Booked" value="57" note="Demo data" icon={CalendarCheck} tone="text-green-300" />
        <AdminStat label="Avg Conversion" value="27%" note="Demo data" icon={TrendingUp} tone="text-purple-300" />
      </div>

      <section className="mt-5 rounded-2xl border border-cyan-300/15 bg-[#071018]/80 p-5 backdrop-blur-xl">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
              Salary Analytics
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              Agent Monthly Salary Calculation
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Base salary is fixed at 50,000 PKR. Saturday and Sunday are counted as off days.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={searchAgent}
                onChange={(e) => setSearchAgent(e.target.value)}
                placeholder="Search agent name or ID..."
                className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/35"
              />
            </div>

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-300/35"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SalaryMiniCard label="Monthly Salary" value={formatPKR(MONTHLY_SALARY)} icon={Wallet} tone="text-cyan-300" />
          <SalaryMiniCard label="Working Days" value={selectedSummary?.workingDays || 0} icon={CalendarDays} tone="text-purple-300" />
          <SalaryMiniCard label="Present Days" value={selectedSummary?.presentDays || 0} icon={UserCheck} tone="text-green-300" />
          <SalaryMiniCard label="Absent Days" value={selectedSummary?.absentDays || 0} icon={UserX} tone="text-red-300" />
          <SalaryMiniCard label="Estimated Salary" value={formatPKR(selectedSummary?.earnedSalary || 0)} icon={BadgeDollarSign} tone="text-yellow-300" />
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-white/[0.03] text-slate-400">
              <tr>
                <th className="px-4 py-4 font-medium">Agent</th>
                <th className="px-4 py-4 font-medium">Login ID</th>
                <th className="px-4 py-4 font-medium">Working Days</th>
                <th className="px-4 py-4 font-medium">Present</th>
                <th className="px-4 py-4 font-medium">Absent</th>
                <th className="px-4 py-4 font-medium">Daily Salary</th>
                <th className="px-4 py-4 font-medium">Estimated Salary</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {salaryRows.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                    No agent found.
                  </td>
                </tr>
              ) : (
                salaryRows.map((agent) => (
                  <tr key={agent.id} className="text-slate-300">
                    <td className="px-4 py-4 text-white">{agent.name}</td>
                    <td className="px-4 py-4 text-cyan-300">{agent.id}</td>
                    <td className="px-4 py-4">{agent.workingDays}</td>
                    <td className="px-4 py-4 text-green-300">{agent.presentDays}</td>
                    <td className="px-4 py-4 text-red-300">{agent.absentDays}</td>
                    <td className="px-4 py-4">{formatPKR(agent.dailySalary)}</td>
                    <td className="px-4 py-4 font-semibold text-yellow-300">
                      {formatPKR(agent.earnedSalary)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.08)" />
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
                <Line type="monotone" dataKey="calls" stroke="#22d3ee" strokeWidth={2} dot={{ fill: "#22d3ee", r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="leads" stroke="#facc15" strokeWidth={2} dot={{ fill: "#facc15", r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="meetings" stroke="#4ade80" strokeWidth={2} dot={{ fill: "#4ade80", r: 4 }} activeDot={{ r: 6 }} />
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.08)" />
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
            <h3 className="text-lg font-semibold text-white">Top Agents</h3>
          </div>

          <div className="space-y-3">
            {topAgents.map((agent, index) => (
              <div key={agent.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
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

          <div className="overflow-x-auto rounded-2xl border border-white/10">
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
                    <td className="px-4 py-4 text-yellow-300">{campaign.interested}</td>
                    <td className="px-4 py-4 text-green-300">{campaign.meetings}</td>
                    <td className="px-4 py-4 text-cyan-300">{campaign.conversion}</td>
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
          <h3 className="text-lg font-semibold text-white">Admin Insights</h3>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {insights.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
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

function SalaryMiniCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className={`rounded-xl bg-white/5 p-2 ${tone}`}>
          <Icon size={17} />
        </div>
      </div>

      <p className="text-xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
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