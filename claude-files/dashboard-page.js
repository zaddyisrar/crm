import PageShell from '@/components/crm/PageShell';
import StatCard from '@/components/crm/StatCard';
import SectionCard from '@/components/crm/SectionCard';
import DataTable from '@/components/crm/DataTable';
import StatusBadge from '@/components/crm/StatusBadge';
import { dashboardStats, teamStatus, leaderboard, recentLeads } from '@/data/crmData';
import { TrendingUp, Award } from 'lucide-react';

export default function Dashboard() {
  const leaderboardColumns = [
    { key: 'rank', label: 'Rank' },
    { key: 'name', label: 'Agent' },
    { key: 'leads', label: 'Leads' },
    { key: 'calls', label: 'Calls' },
    { key: 'meetings', label: 'Meetings', render: (val) => val },
    { key: 'conversionRate', label: 'Conversion', render: (val) => `${val}%` }
  ];

  const recentLeadsColumns = [
    { key: 'name', label: 'Name' },
    { key: 'company', label: 'Company' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' },
    { key: 'assignedTo', label: 'Assigned To' }
  ];

  return (
    <PageShell title="Dashboard" subtitle="Welcome back, Muhammad 👋">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Live Team Status */}
        <SectionCard title="Live Team Status" subtitle="Current agent activity" className="lg:col-span-1">
          <div className="space-y-3">
            {teamStatus.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-cyan-500/20 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {member.avatar}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${member.statusColor}`}></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-300">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.status}</p>
                  </div>
                </div>
                <StatusBadge status={member.status} />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Today's Leaderboard */}
        <SectionCard title="Today's Leaderboard" subtitle="Top performing agents" className="lg:col-span-2">
          <div className="space-y-2">
            {leaderboard.map((agent, idx) => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/20 border border-slate-700/30 hover:border-cyan-500/20 transition-all duration-200"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                    {agent.rank}
                  </div>
                  <span className="text-sm font-medium text-slate-300 min-w-20">{agent.name}</span>
                </div>
                <div className="flex items-center gap-6 text-xs">
                  <div className="text-center">
                    <p className="text-slate-500">Leads</p>
                    <p className="text-cyan-300 font-bold">{agent.leads}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500">Calls</p>
                    <p className="text-cyan-300 font-bold">{agent.calls}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500">Rate</p>
                    <p className="text-green-300 font-bold">{agent.conversionRate}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Recent Leads Table */}
      <SectionCard title="Recent Leads" subtitle="Latest 5 leads added to system">
        <DataTable columns={recentLeadsColumns} data={recentLeads} showActions={true} />
      </SectionCard>
    </PageShell>
  );
}
