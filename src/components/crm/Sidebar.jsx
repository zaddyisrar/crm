"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Clock3,
  Phone,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Attendance", href: "/attendance", icon: Clock3 },
  { name: "Calls", href: "/calls", icon: Phone },
  { name: "Meetings", href: "/meetings", icon: CalendarDays },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  function handleLogout() {
    const userId = localStorage.getItem("crmUserId");

    if (userId) {
      const today = new Date().toISOString().split("T")[0];

      localStorage.setItem(`crmCheckedOutDate:${userId}`, today);
      localStorage.setItem(
        `crmCheckOutTime:${userId}`,
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }

    localStorage.removeItem("crmRole");
    localStorage.removeItem("crmCampaign");
    localStorage.removeItem("crmUserId");

    window.location.href = "/login";
  }

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 flex-col border-r border-cyan-400/10 bg-[#03060b]/95 px-3 py-4 backdrop-blur-xl lg:flex">
      <div className="mb-4 shrink-0 rounded-3xl border border-cyan-400/15 bg-cyan-400/[0.03] p-4">
        <div className="relative h-20 w-full">
          <Image
            src="/crm-logo.png"
            alt="CRM by LeadsRift"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs transition ${
                active
                  ? "border border-cyan-300/25 bg-cyan-300/10 text-cyan-200 shadow-[0_0_25px_rgba(34,211,238,0.08)]"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Icon size={16} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-3 shrink-0 border-t border-cyan-400/10 pt-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2.5 text-xs font-medium text-red-200 transition hover:bg-red-400/15"
        >
          <LogOut size={15} />
          Logout / Checkout
        </button>
      </div>
    </aside>
  );
}