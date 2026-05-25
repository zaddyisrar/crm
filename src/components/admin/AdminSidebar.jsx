"use client";

import Image from "next/image";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  LogOut,
} from "lucide-react";

const navItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },

  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },

  {
    name: "Attendance",
    href: "/admin/attendance",
    icon: ClipboardCheck,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("crmRole");
      localStorage.removeItem("crmUserId");
    }

    router.replace("/login");
  }

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 border-r border-cyan-400/10 bg-[#03060b]/95 px-4 py-4 backdrop-blur-xl lg:flex lg:flex-col">
      
      <div className="mb-5 rounded-[2rem] border border-cyan-300/10 bg-white/[0.03] p-5">
        <div className="relative h-20 w-full">
          <Image
            src="/crm-logo.png"
            alt="CRM"
            fill
            priority
            className="object-contain"
          />
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                active
                  ? "border border-cyan-300/20 bg-cyan-300/10 text-cyan-200"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Icon size={17} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200 transition hover:bg-red-400/15"
      >
        <LogOut size={16} />
        Logout
      </button>

    </aside>
  );
}