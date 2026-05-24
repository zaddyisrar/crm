import {
  Users,
  Clock3,
  Target,
  UserCheck,
  PhoneCall,
  Coffee,
  Activity,
  UserRound,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import PageShell from "@/components/crm/PageShell";
import StatCard from "@/components/crm/StatCard";

const team = [
  {
    name: "Hamza",
    status: "Calling",
    time: "06:21:32",
    icon: PhoneCall,
    color: "text-green-400",
    dot: "bg-green-400",
    bg: "bg-green-400/10",
  },
  {
    name: "Ammar",
    status: "Break",
    time: "15:32",
    icon: Coffee,
    color: "text-yellow-300",
    dot: "bg-yellow-300",
    bg: "bg-yellow-300/10",
  },
  {
    name: "Sameen",
    status: "Active",
    time: "04:12:10",
    icon: Activity,
    color: "text-cyan-300",
    dot: "bg-cyan-300",
    bg: "bg-cyan-300/10",
  },
  {
    name: "Asim",
    status: "Washroom",
    time: "03:08",
    icon: UserRound,
    color: "text-red-400",
    dot: "bg-red-400",
    bg: "bg-red-400/10",
  },
];

const leaderboard = [
  { rank: 1, name: "Hamza", leads: 18, change: "+20%", up: true },
  { rank: 2, name: "Sameen", leads: 14, change: "+12%", up: true },
  { rank: 3, name: "Ammar", leads: 10, change: "8%", up: false },
  { rank: 4, name: "Asim", leads: 7, change: "5%", up: false },
];

const leads = [
  ["John Carter", "CleanPro Solutions", "New", "Hamza", "10:24 AM"],
  ["Sarah Mitchell", "Bright Spaces LLC", "Contacted", "Sameen", "10:21 AM"],
  ["David Anderson", "RoofGuard Pros", "Interested", "Ammar", "10:18 AM"],
  ["Jessica Taylor", "SolarMax Systems", "New", "Hamza", "10:15 AM"],
  ["Michael Brown", "Air Comfort Inc.", "Follow Up", "Sameen", "10:11 AM"],
];

export default function DashboardPage() {
  return (
    <PageShell
      title="Good Morning, Muhammad 👋"
      subtitle="Here's today's activity overview."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Leads Added Today"
          value="32"
          note="↑ 18% vs yesterday"
          icon={Users}
          accent="cyan"
        />
        <StatCard
          label="Active Work Hours"
          value="5h 42m"
          note="↑ 12% vs yesterday"
          icon={Clock3}
          accent="purple"
        />
        <StatCard
          label="Current Campaign"
          value="Commercial Cleaning"
          note="74% completed"
          icon={Target}
          accent="green"
        />
        <StatCard
          label="Attendance Status"
          value="Present"
          note="Marked at 9:03 AM"
          icon={UserCheck}
          accent="yellow"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
          <h3 className="text-lg font-semibold uppercase text-white">
            Live Team Status
          </h3>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {team.map((agent) => {
              const Icon = agent.icon;

              return (
                <div
                  key={agent.name}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center"
                >
                  <div className="mb-4 flex items-center gap-2 text-left">
                    <span className={`h-3 w-3 rounded-full ${agent.dot}`} />
                    <div>
                      <p className="font-semibold text-white">{agent.name}</p>
                      <p className={`text-sm ${agent.color}`}>
                        {agent.status}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${agent.bg} ${agent.color}`}
                  >
                    <Icon size={26} />
                  </div>

                  <p className="mt-4 text-sm text-slate-300">{agent.time}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold uppercase text-white">
              Today's Leaderboard
            </h3>
            <button className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300">
              Leads
            </button>
          </div>

          <div className="space-y-4">
            {leaderboard.map((item) => (
              <div
                key={item.rank}
                className="flex items-center justify-between border-b border-white/10 pb-3 last:border-b-0"
              >
                <div className="flex items-center gap-4">
                  <span className="text-lg text-white">{item.rank}</span>
                  <div className="h-9 w-9 rounded-full border border-cyan-300/20 bg-cyan-300/10" />
                  <p className="font-medium text-white">{item.name}</p>
                </div>

                <div className="flex items-center gap-5 text-sm">
                  <span className="text-slate-300">{item.leads} Leads</span>
                  <span
                    className={`flex items-center gap-1 ${
                      item.up ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {item.up ? <ArrowUp size={15} /> : <ArrowDown size={15} />}
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold uppercase text-white">
            Recent Leads
          </h3>
          <button className="text-sm text-cyan-300">View All →</button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-white/[0.03] text-slate-400">
              <tr>
                <th className="px-4 py-4 font-medium">Name</th>
                <th className="px-4 py-4 font-medium">Company</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium">Assigned To</th>
                <th className="px-4 py-4 font-medium">Time</th>
                <th className="px-4 py-4 font-medium"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {leads.map(([name, company, status, assigned, time]) => (
                <tr key={name} className="text-slate-300">
                  <td className="px-4 py-4 text-white">{name}</td>
                  <td className="px-4 py-4">{company}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-lg border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-4">{assigned}</td>
                  <td className="px-4 py-4">{time}</td>
                  <td className="px-4 py-4 text-right">
                    <MoreHorizontal size={18} className="text-slate-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  );
}