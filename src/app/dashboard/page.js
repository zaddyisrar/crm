import {
  Users,
  PhoneCall,
  CalendarCheck,
  Clock3,
} from "lucide-react";

import PageShell from "@/components/crm/PageShell";
import StatCard from "@/components/crm/StatCard";
import { leaderboard, recentLeads, teamStatus } from "@/data/crmData";

export default function DashboardPage() {
  return (
    <PageShell
      title="Good Morning, Muhammad 👋"
      subtitle="Here is your live agent overview for today."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Leads Today"
          value="48"
          note="+12 from yesterday"
          icon={Users}
        />

        <StatCard
          label="Calls Completed"
          value="126"
          note="Team activity"
          icon={PhoneCall}
        />

        <StatCard
          label="Meetings Booked"
          value="9"
          note="Today’s confirmed calls"
          icon={CalendarCheck}
        />

        <StatCard
          label="Current Status"
          value="Active"
          note="Checked in at 09:14 AM"
          icon={Clock3}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-cyan-400/10 bg-white/[0.035] p-6 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">
                Live Team Status
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Real-time agent activity.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {teamStatus.map((agent) => (
              <div
                key={agent.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{agent.name}</h4>
                    <p className="mt-1 text-sm text-slate-400">
                      {agent.status}
                    </p>
                  </div>

                  <span
                    className={`h-3 w-3 rounded-full ${agent.color} shadow-[0_0_18px_currentColor]`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-cyan-400/10 bg-white/[0.035] p-6 backdrop-blur-xl">
          <h3 className="text-xl font-semibold text-white">
            Today’s Leaderboard
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Top performers by leads handled.
          </p>

          <div className="mt-5 space-y-3">
            {leaderboard.map((person) => (
              <div
                key={person.rank}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-sm text-cyan-200">
                    #{person.rank}
                  </span>
                  <span className="font-medium text-white">{person.name}</span>
                </div>

                <span className="text-sm text-slate-300">
                  {person.leads} leads
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-3xl border border-cyan-400/10 bg-white/[0.035] p-6 backdrop-blur-xl">
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-white">Recent Leads</h3>
          <p className="mt-1 text-sm text-slate-400">
            Latest prospects assigned to the team.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-cyan-300/10 text-cyan-100">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Assigned</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {recentLeads.map((lead) => (
                <tr key={lead.id} className="bg-black/20 text-slate-300">
                  <td className="px-4 py-4 text-white">{lead.name}</td>
                  <td className="px-4 py-4">{lead.company}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">{lead.assigned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  );
}