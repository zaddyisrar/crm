'use client';

import PageShell from '@/components/crm/PageShell';
import SectionCard from '@/components/crm/SectionCard';
import { analyticsData } from '@/data/crmData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const stats = [
    { label: 'Total Leads', value: '168', change: '+12%', color: 'text-blue-300' },
    { label: 'Conversion Rate', value: '28%', change: '+5%', color: 'text-green-300' },
    { label: 'Calls Completed', value: '127', change: '+8%', color: 'text-cyan-300' },
    { label: 'Meetings Booked', value: '32', change: '+15%', color: 'text-purple-300' }
  ];

  const breakdown = [
    { label: 'Leads Today', value: 24, percentage: 14, color: 'bg-blue-500' },
    { label: 'Calls Today', value: 18, percentage: 14, color: 'bg-cyan-500' },
    { label: 'Meetings Today', value: 5, percentage: 16, color: 'bg-purple-500' },
    { label: 'Conversion This Week', value: '28%', percentage: 28, color: 'bg-green-500' }
  ];

  return (
    <PageShell title="Analytics" subtitle="Key metrics and insights">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, idx) => (
          <SectionCard key={idx}>
            <div className="text-center">
              <p className="text-slate-400 text-xs mb-2 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</p>
              <p className="text-xs text-green-400">{stat.change} this week</p>
            </div>
          </SectionCard>
        ))}
      </div>

      {/* Line Chart */}
      <SectionCard title="Weekly Trend" subtitle="Leads, calls, and meetings over the week" className="mb-6">
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.1)" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="calls"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: '#06b6d4', r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="meetings"
                stroke="#a855f7"
                strokeWidth={2}
                dot={{ fill: '#a855f7', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-6 mt-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-slate-400">Leads</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
            <span className="text-xs text-slate-400">Calls</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-xs text-slate-400">Meetings</span>
          </div>
        </div>
      </SectionCard>

      {/* Breakdown */}
      <SectionCard title="Performance Breakdown" subtitle="Quick metrics summary">
        <div className="space-y-4">
          {breakdown.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">{item.label}</span>
                <span className="text-sm font-bold text-cyan-300">{item.value}</span>
              </div>
              <div className="w-full bg-slate-800/30 rounded-full h-2 border border-cyan-500/10 overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}
