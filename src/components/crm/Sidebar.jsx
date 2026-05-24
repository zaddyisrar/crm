"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock3,
  Phone,
  CalendarDays,
  BarChart3,
  Settings,
  Coffee,
  Toilet,
  LogOut,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Attendance", href: "/attendance", icon: Clock3 },
  { name: "Calls", href: "/calls", icon: Phone },
  { name: "Meetings", href: "/meetings", icon: CalendarDays },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 border-r border-cyan-400/10 bg-[#03060b]/95 px-4 py-5 backdrop-blur-xl lg:block">
      <div className="mb-8 rounded-3xl border border-cyan-400/15 bg-cyan-400/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">
          CRM by
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">LeadsRift</h1>
        <p className="mt-2 text-sm text-slate-400">Agent Panel V1</p>
      </div>

      <nav className="space-y-2 overflow-y-auto pb-52">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                active
                  ? "border border-cyan-300/25 bg-cyan-300/10 text-cyan-200 shadow-[0_0_35px_rgba(34,211,238,0.08)]"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-5 left-4 right-4 space-y-3 bg-[#03060b]/95 pt-3">
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-sm font-medium text-yellow-200 transition hover:bg-yellow-400/15">
          <Coffee size={17} />
          Start Break
        </button>

        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-200 transition hover:bg-red-400/15">
          <Toilet size={17} />
          Washroom
        </button>

        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400 transition hover:text-white">
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}