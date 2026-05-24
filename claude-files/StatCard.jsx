import { TrendingUp, TrendingDown } from 'lucide-react';

const iconMap = {
  Users: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m4 0a4 4 0 110 5.292M3 20.354V19a6 6 0 0112 0v1.354" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Zap: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
};

export default function StatCard({ title, value, change, icon }) {
  const Icon = iconMap[icon] || iconMap.Zap;
  const isPositive = change && change.startsWith('+');

  return (
    <div className="bg-gradient-to-br from-slate-900/60 to-slate-900/20 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-md hover:border-cyan-500/40 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className="text-cyan-400/60 group-hover:text-cyan-400 transition-colors duration-300">
          <Icon />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isPositive ? (
          <TrendingUp size={16} className="text-green-400" />
        ) : (
          <TrendingDown size={16} className="text-red-400" />
        )}
        <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
          {change}
        </span>
        <span className="text-xs text-slate-500">from last day</span>
      </div>
    </div>
  );
}
