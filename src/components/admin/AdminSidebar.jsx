"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Briefcase,
  CalendarClock,
  Users,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

const links = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Campaigns",
    href: "/admin/campaigns",
    icon: Briefcase,
  },
  {
    title: "Attendance",
    href: "/admin/attendance",
    icon: CalendarClock,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[250px] rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-5 backdrop-blur-xl">

      <img
        src="/crm-logo.png"
        className="mb-8 w-[150px]"
      />

      <div className="space-y-2">

        {links.map((item) => {

          const Icon = item.icon;

          const active =
            pathname === item.href;

          return (

          <Link
          key={item.title}
          href={item.href}
          className={`flex items-center gap-3 rounded-2xl px-4 py-4 transition
          ${
          active
          ? "bg-cyan-400/10 text-cyan-300 border border-cyan-300/20"
          : "text-slate-400 hover:bg-white/[0.03]"
          }
          `}
          >

          <Icon size={18}/>

          <span className="text-sm font-medium">
          {item.title}
          </span>

          </Link>

          )

        })}

      </div>

      <button className="mt-10 flex w-full items-center gap-3 rounded-2xl border border-cyan-300/10 px-4 py-4 text-slate-400 hover:text-white">

      <LogOut size={18}/>

      Logout

      </button>

    </aside>
  );
}