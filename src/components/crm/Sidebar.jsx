"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Clock3, LogOut } from "lucide-react";

import { sheetsPost } from "@/lib/sheetsApi";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Attendance",
    href: "/attendance",
    icon: Clock3,
  },
];

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getTimeNow() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const userId = localStorage.getItem("crmUserId");
    const role = localStorage.getItem("crmRole");

    if (userId && role === "agent") {
      const today = getTodayKey();
      const checkOutTime = getTimeNow();

      localStorage.setItem(`crmCheckOutTime:${userId}`, checkOutTime);
      localStorage.setItem(`crmCheckedOutDate:${userId}`, today);

      try {
        await sheetsPost({
          action: "checkOut",
          agentId: userId,
          date: today,
          checkOut: checkOutTime,
        });

        console.log("Check-out synced to Google Sheets");
      } catch (error) {
        console.error("Google Sheets check-out failed:", error);
      }
    }

    localStorage.removeItem("crmRole");
    localStorage.removeItem("crmUserId");
    localStorage.removeItem("crmUserName");

    router.push("/login");
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
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-xs transition ${
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

      <div className="mt-3 border-t border-cyan-400/10 pt-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-3 text-xs font-medium text-red-200 transition hover:bg-red-400/15"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}