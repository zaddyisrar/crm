"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CheckCircle2,
  FileBarChart,
  LogOut,
} from "lucide-react";

const links = [
  {
    label: "Dashboard",
    href: "/manager",
    icon: LayoutDashboard,
  },
  {
    label: "Agents",
    href: "/manager/agents",
    icon: Users,
  },
  {
    label: "Approvals",
    href: "/manager/approvals",
    icon: CheckCircle2,
  },
  {
    label: "Reports",
    href: "/manager/reports",
    icon: FileBarChart,
  },
];

export default function ManagerSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("crmRole");
    localStorage.removeItem("crmUserId");
    localStorage.removeItem("crmUserName");

    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-cyan-300/10 bg-[#03060b]/90 p-5 backdrop-blur-xl lg:block">
      <div className="rounded-3xl border border-cyan-300/15 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
          LeadsRift
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          Manager Panel
        </h2>

        <p className="mt-2 text-xs text-slate-500">
          Operations & agent control
        </p>
      </div>

      <nav className="mt-6 space-y-2">
        {links.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                active
                  ? "border-cyan-300/30 bg-cyan-400/10 text-cyan-300"
                  : "border-transparent text-slate-400 hover:border-cyan-300/20 hover:bg-cyan-300/10 hover:text-cyan-300"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-300 transition hover:bg-red-400/15"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}