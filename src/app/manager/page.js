"use client";

import ManagerShell from "@/components/manager/ManagerShell";
import StatCard from "@/components/crm/StatCard";
import { users } from "@/data/agents";
import {
  Users,
  ClipboardCheck,
  FileBarChart,
  Activity,
} from "lucide-react";

const liveLeadActivity = [
  {
    agent: "Israr",
    lead: "DLKSUHFIL",
    company: "Nova Building Maintenance",
    status: "Pending",
    time: "07:48 PM",
  },
  {
    agent: "Sameer",
    lead: "John Carter",
    company: "Deepi Clean",
    status: "Pending",
    time: "07:41 PM",
  },
  {
    agent: "Asim",
    lead: "Michael Brown",
    company: "Capital Facilities",
    status: "Approved",
    time: "07:33 PM",
  },
];

export default function ManagerDashboardPage() {
  const agents = users.filter((user) => user.role === "agent");

  return (
    <ManagerShell>
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          title="Total Agents"
          value={agents.length}
          subtitle="Registered active agents"
          icon={Users}
        />

        <StatCard
          title="Pending Approvals"
          value="0"
          subtitle="Leads waiting for review"
          icon={ClipboardCheck}
        />

        <StatCard
          title="Reports"
          value="0"
          subtitle="Attendance & agent reports"
          icon={FileBarChart}
        />
      </div>

      <div className="mt-6 rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6 backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
              Live Leads Activity
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              Recent Agent Submissions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Frontend preview of submitted leads. Real data will connect later.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-300">
            <Activity size={22} />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.22em] text-cyan-300">
              <tr>
                <th className="px-5 py-4">Agent</th>
                <th className="px-5 py-4">Lead Name</th>
                <th className="px-5 py-4">Company</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Time</th>
              </tr>
            </thead>

            <tbody>
              {liveLeadActivity.map((lead, index) => (
                <tr
                  key={index}
                  className="border-t border-white/10 text-slate-300"
                >
                  <td className="px-5 py-4 font-bold text-white">
                    {lead.agent}
                  </td>

                  <td className="px-5 py-4">{lead.lead}</td>

                  <td className="px-5 py-4">{lead.company}</td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${
                        lead.status === "Approved"
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                          : "border-yellow-400/20 bg-yellow-400/10 text-yellow-300"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {lead.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ManagerShell>
  );
}