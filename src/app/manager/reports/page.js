"use client";

import ManagerShell from "@/components/manager/ManagerShell";
import {
  CalendarCheck,
  Users,
  FileBarChart,
  Banknote,
  Trophy,
  Clock3,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const agentReports = [
  {
    name: "Israr",
    id: "LR-ISRAR",
    status: "Present",
    checkIn: "07:26 PM",
    hours: "8h 20m",
    leads: 12,
    approved: 8,
    salary: "PKR 50,000",
  },
  {
    name: "Sameer",
    id: "LR-SAMEER",
    status: "Present",
    checkIn: "07:18 PM",
    hours: "8h 28m",
    leads: 15,
    approved: 10,
    salary: "PKR 50,000",
  },
  {
    name: "Asim",
    id: "LR-ASIM",
    status: "Present",
    checkIn: "07:35 PM",
    hours: "8h 11m",
    leads: 9,
    approved: 6,
    salary: "PKR 50,000",
  },
  {
    name: "Labeeb",
    id: "LR-LABEEB",
    status: "Absent",
    checkIn: "-",
    hours: "0h 0m",
    leads: 0,
    approved: 0,
    salary: "PKR 50,000",
  },
];

const topAgents = [
  {
    rank: "#1",
    name: "Sameer",
    metric: "15 Leads",
  },
  {
    rank: "#2",
    name: "Israr",
    metric: "12 Leads",
  },
  {
    rank: "#3",
    name: "Asim",
    metric: "9 Leads",
  },
];

export default function ManagerReportsPage() {
  const presentToday = agentReports.filter(
    (agent) => agent.status === "Present"
  ).length;

  const totalLeads = agentReports.reduce((sum, agent) => sum + agent.leads, 0);

  const approvedLeads = agentReports.reduce(
    (sum, agent) => sum + agent.approved,
    0
  );

  const salaryDue = agentReports.length * 50000;

  return (
    <ManagerShell>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <ReportCard
          title="Present Today"
          value={presentToday}
          subtitle="Agents currently marked present"
          icon={CalendarCheck}
          tone="emerald"
        />

        <ReportCard
          title="Total Leads"
          value={totalLeads}
          subtitle="Submitted by agents"
          icon={FileBarChart}
          tone="cyan"
        />

        <ReportCard
          title="Approved Leads"
          value={approvedLeads}
          subtitle="Manager approved"
          icon={TrendingUp}
          tone="yellow"
        />

        <ReportCard
          title="Salary Preview"
          value={`PKR ${salaryDue.toLocaleString()}`}
          subtitle="Monthly salary estimate"
          icon={Banknote}
          tone="purple"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.7fr]">
        <section className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6 backdrop-blur-xl">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
                Agent Performance Report
              </p>

              <h2 className="mt-2 text-2xl font-black text-white">
                Today&apos;s Agent Summary
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Frontend preview. Real attendance, approvals, and salary data
                will connect later.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-300">
              V3.7 Frontend
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.22em] text-cyan-300">
                <tr>
                  <th className="px-5 py-4">Agent</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Check In</th>
                  <th className="px-5 py-4">Hours</th>
                  <th className="px-5 py-4">Leads</th>
                  <th className="px-5 py-4">Approved</th>
                  <th className="px-5 py-4">Salary</th>
                </tr>
              </thead>

              <tbody>
                {agentReports.map((agent) => (
                  <tr
                    key={agent.id}
                    className="border-t border-white/10 text-slate-300"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-white">{agent.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{agent.id}</p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${
                          agent.status === "Present"
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                            : "border-red-400/20 bg-red-400/10 text-red-300"
                        }`}
                      >
                        {agent.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">{agent.checkIn}</td>
                    <td className="px-5 py-4 text-cyan-300">{agent.hours}</td>
                    <td className="px-5 py-4">{agent.leads}</td>
                    <td className="px-5 py-4">{agent.approved}</td>
                    <td className="px-5 py-4">{agent.salary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6 backdrop-blur-xl">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
                Top Agents
              </p>

              <h2 className="mt-2 text-xl font-black text-white">
                Today&apos;s Ranking
              </h2>
            </div>

            <div className="space-y-3">
              {topAgents.map((agent) => (
                <div
                  key={agent.rank}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-sm font-black text-cyan-300">
                      {agent.rank}
                    </div>

                    <div>
                      <p className="font-bold text-white">{agent.name}</p>
                      <p className="text-xs text-slate-500">{agent.metric}</p>
                    </div>
                  </div>

                  <Trophy size={18} className="text-yellow-300" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-yellow-300/15 bg-yellow-300/[0.04] p-6 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-1 text-yellow-300" size={20} />

              <div>
                <h3 className="font-black text-white">
                  Reports are frontend-only
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  This page is designed for the final UI structure. Later it
                  will pull real data from attendance, leads, approvals, and
                  salary records.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ManagerShell>
  );
}

function ReportCard({ title, value, subtitle, icon: Icon, tone }) {
  const tones = {
    emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-300",
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-300",
    yellow: "border-yellow-300/20 bg-yellow-300/10 text-yellow-300",
    purple: "border-purple-300/20 bg-purple-300/10 text-purple-300",
  };

  return (
    <div className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
          {title}
        </p>

        <div className={`rounded-2xl border p-3 ${tones[tone]}`}>
          <Icon size={22} />
        </div>
      </div>

      <h3 className="text-3xl font-black text-white">{value}</h3>

      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}