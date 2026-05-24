import {
  PhoneCall,
  Users,
  RotateCcw,
  CalendarCheck,
} from "lucide-react";

import PageShell from "@/components/crm/PageShell";
import SectionCard from "@/components/crm/SectionCard";
import DataTable from "@/components/crm/DataTable";
import StatCard from "@/components/crm/StatCard";
import { callLogs } from "@/data/crmData";

export default function CallsPage() {
  const callStats = [
    {
      id: 1,
      label: "Calls Completed",
      value: "18",
      note: "+8% today",
      icon: PhoneCall,
    },
    {
      id: 2,
      label: "Interested",
      value: "7",
      note: "+12% today",
      icon: Users,
    },
    {
      id: 3,
      label: "Callbacks",
      value: "3",
      note: "-5% today",
      icon: RotateCcw,
    },
    {
      id: 4,
      label: "Booked",
      value: "2",
      note: "+25% today",
      icon: CalendarCheck,
    },
  ];

  const columns = [
    { key: "prospect", label: "Prospect" },
    { key: "company", label: "Company" },
    { key: "duration", label: "Duration" },
    { key: "result", label: "Result" },
    { key: "rep", label: "Rep" },
    { key: "time", label: "Time" },
  ];

  return (
    <PageShell title="Calls" subtitle="Track all incoming and outgoing calls.">
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {callStats.map((stat) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            note={stat.note}
            icon={stat.icon}
          />
        ))}
      </div>

      <SectionCard title="Call Logs" subtitle="Recent call history">
        <DataTable columns={columns} data={callLogs} showActions />
      </SectionCard>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <SectionCard title="Conversion Rate">
          <div className="text-center">
            <p className="mb-2 text-4xl font-bold text-green-300">39%</p>
            <p className="text-xs text-slate-500">
              7 out of 18 calls converted
            </p>
            <div className="mt-4 h-2 w-full rounded-full border border-cyan-500/10 bg-slate-800/30">
              <div className="h-2 w-[39%] rounded-full bg-green-500" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Avg Call Duration">
          <div className="text-center">
            <p className="mb-2 text-4xl font-bold text-cyan-300">9:45</p>
            <p className="text-xs text-slate-500">Average in minutes</p>
            <p className="mt-3 text-xs text-slate-400">
              Total: 2 hours 56 minutes
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Team Performance">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Top Caller</span>
              <span className="font-semibold text-cyan-300">
                Hamza (6 calls)
              </span>
            </div>
            <div className="h-px bg-slate-700/50" />
            <div className="flex justify-between">
              <span className="text-slate-400">Highest Rate</span>
              <span className="font-semibold text-green-300">50%</span>
            </div>
            <div className="h-px bg-slate-700/50" />
            <div className="flex justify-between">
              <span className="text-slate-400">Most Booked</span>
              <span className="font-semibold text-blue-300">2 meetings</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}