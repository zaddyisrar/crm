"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Clock3,
  LogOut,
  Coffee,
  Bath,
  BriefcaseBusiness,
  BarChart3,
} from "lucide-react";

import { sheetsPost } from "@/lib/sheetsApi";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Attendance",
    href: "/attendance",
    icon: Clock3,
  },
];

function getTodayKey() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

  function updateAgentStatus(status) {
    const userId = localStorage.getItem("crmUserId");
    const role = localStorage.getItem("crmRole");

    if (!userId || role !== "agent") return;

    localStorage.setItem(`crmCurrentStatus:${userId}`, status);
    window.dispatchEvent(new Event("crm-status-change"));

    sheetsPost({
      action: "updateStatus",
      agentId: userId,
      status,
    }).catch((error) => {
      console.error("Google Sheets status update failed:", error);
    });
  }

  async function handleLogout() {
    const userId = localStorage.getItem("crmUserId");
    const role = localStorage.getItem("crmRole");

    if (userId && role === "agent") {
      const today = getTodayKey();
      const checkOutTime = getTimeNow();

      localStorage.setItem(`crmCheckOutTime:${userId}`, checkOutTime);
      localStorage.setItem(`crmCheckedOutDate:${userId}`, today);
      localStorage.setItem(`crmCurrentStatus:${userId}`, "Checked Out");
      window.dispatchEvent(new Event("crm-status-change"));

      try {
        await sheetsPost({
          action: "attendanceLogout",
          agentId: userId,
          logoutTime: checkOutTime,
        });
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

      <div className="space-y-2 border-t border-cyan-400/10 pt-3">
        <button
          onClick={() => updateAgentStatus("Break")}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-2.5 text-xs font-medium text-yellow-200 transition hover:bg-yellow-400/15"
        >
          <Coffee size={15} />
          Break
        </button>

        <button
          onClick={() => updateAgentStatus("Washroom")}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-400/20 bg-purple-400/10 px-3 py-2.5 text-xs font-medium text-purple-200 transition hover:bg-purple-400/15"
        >
          <Bath size={15} />
          Washroom
        </button>

        <button
          onClick={() => updateAgentStatus("Active")}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2.5 text-xs font-medium text-emerald-200 transition hover:bg-emerald-400/15"
        >
          <BriefcaseBusiness size={15} />
          Back to Work
        </button>

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