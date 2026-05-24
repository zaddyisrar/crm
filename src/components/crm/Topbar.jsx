import { CalendarDays } from "lucide-react";

export default function Topbar({ title = "Dashboard", subtitle = "Welcome back." }) {
  return (
    <header className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {title}
        </h2>
        <p className="mt-2 text-base text-slate-400">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-3 text-sm text-slate-300 shadow-[0_0_35px_rgba(34,211,238,0.04)] backdrop-blur-xl">
        <CalendarDays size={18} className="text-cyan-200" />
        May 24, 2025
      </div>
    </header>
  );
}