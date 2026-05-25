"use client";

import { CalendarDays } from "lucide-react";

export default function Topbar({ title, subtitle }) {
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white xl:text-5xl">
          {title}
        </h1>

        {subtitle ? (
          <p className="mt-3 text-lg text-slate-400">{subtitle}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-cyan-300/10 bg-[#071018]/80 px-5 py-4 text-slate-300">
        <CalendarDays size={18} className="text-cyan-300" />
        <span>{today}</span>
      </div>
    </header>
  );
}