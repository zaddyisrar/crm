import PageShell from '@/components/crm/PageShell';
import SectionCard from '@/components/crm/SectionCard';
import DataTable from '@/components/crm/DataTable';
import StatCard from '@/components/crm/StatCard';
import { callLogs } from '@/data/crmData';

export default function CallsPage() {
  const callStats = [
    {
      id: 1,
      title: 'Calls Completed',
      value: '18',
      change: '+8%',
      icon: 'Phone'
    },
    {
      id: 2,
      title: 'Interested',
      value: '7',
      change: '+12%',
      icon: 'Users'
    },
    {
      id: 3,
      title: 'Callbacks',
      value: '3',
      change: '-5%',
      icon: 'Phone'
    },
    {
      id: 4,
      title: 'Booked',
      value: '2',
      change: '+25%',
      icon: 'Calendar'
    }
  ];

  const columns = [
    { key: 'prospect', label: 'Prospect' },
    { key: 'company', label: 'Company' },
    { key: 'duration', label: 'Duration' },
    { key: 'result', label: 'Result' },
    { key: 'rep', label: 'Rep' },
    { key: 'time', label: 'Time' }
  ];

  return (
    <PageShell title="Calls" subtitle="Track all incoming and outgoing calls">
      {/* Call Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {callStats.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Call Logs Table */}
      <SectionCard title="Call Logs" subtitle="Recent call history">
        <DataTable columns={columns} data={callLogs} showActions={true} />
      </SectionCard>

      {/* Call Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <SectionCard title="Conversion Rate">
          <div className="text-center">
            <p className="text-4xl font-bold text-green-300 mb-2">39%</p>
            <p className="text-xs text-slate-500">7 out of 18 calls converted</p>
            <div className="mt-4 w-full bg-slate-800/30 rounded-full h-2 border border-cyan-500/10">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: '39%' }}
              ></div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Avg Call Duration">
          <div className="text-center">
            <p className="text-4xl font-bold text-cyan-300 mb-2">9:45</p>
            <p className="text-xs text-slate-500">Average in minutes</p>
            <p className="text-xs text-slate-400 mt-3">Total: 2 hours 56 minutes</p>
          </div>
        </SectionCard>

        <SectionCard title="Team Performance">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Top Caller</span>
              <span className="font-semibold text-cyan-300">Hamza (6 calls)</span>
            </div>
            <div className="h-px bg-slate-700/50"></div>
            <div className="flex justify-between">
              <span className="text-slate-400">Highest Rate</span>
              <span className="font-semibold text-green-300">50%</span>
            </div>
            <div className="h-px bg-slate-700/50"></div>
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
