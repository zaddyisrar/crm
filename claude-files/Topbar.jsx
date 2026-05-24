import { Bell, Settings, User } from 'lucide-react';

export default function Topbar({ title, subtitle }) {
  return (
    <div className="bg-gradient-to-r from-slate-900/80 to-slate-900/40 border-b border-cyan-500/20 backdrop-blur-md">
      <div className="h-16 px-6 flex items-center justify-between">
        <div>
          {title && <h2 className="text-lg font-bold text-white">{title}</h2>}
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors duration-200">
            <Bell size={20} className="text-slate-300 hover:text-cyan-300" />
          </button>
          
          <div className="h-8 w-px bg-cyan-500/20"></div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-300">Muhammad Israr</p>
              <p className="text-xs text-slate-500">Agent</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
              MI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
