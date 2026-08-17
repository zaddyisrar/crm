"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UserRound,
  LogOut,
} from "lucide-react";

export default function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      name: "Dashboard",
      href: "/client",
      icon: LayoutDashboard,
    },
    {
      name: "Profile",
      href: "/client/profile",
      icon: UserRound,
    },
  ];

  function handleLogout() {
    localStorage.removeItem("crmRole");
    localStorage.removeItem("crmUserId");
    localStorage.removeItem("crmUserName");

    router.replace("/login");
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col border-r border-cyan-400/10 bg-[#03060b]/95 px-3 py-4 backdrop-blur-xl lg:flex">
      {/* Logo */}
      <div className="mb-10 flex items-center justify-center pt-5">
        <Image
          src="/crm-logo.png"
          alt="CRM by LeadsRift"
          width={175}
          height={90}
          priority
          className="object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/client"
              ? pathname === "/client"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-cyan-300/10 text-cyan-200"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Icon size={17} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-cyan-400/10 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-3 text-xs font-bold text-red-200 transition hover:bg-red-400/15"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}