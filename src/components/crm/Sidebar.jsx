"use client";

import { useState } from "react";
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
  Video,
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

function getTimeNow() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function setLocalStatus(userId, status) {
  localStorage.setItem(`crmCurrentStatus:${userId}`, status);
  window.dispatchEvent(new Event("crm-status-change"));
}

function setExtensionSession(active, agentId = "") {
  try {
    window.postMessage(
      {
        type: "CRM_SET_EXTENSION_SESSION",
        active: Boolean(active),
        agentId: active ? agentId : "",
      },
      "*"
    );
  } catch (error) {
    // Safe to ignore if extension/content script is not available.
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [statusSaving, setStatusSaving] = useState("");

  async function updateAgentStatus(nextStatus) {
    const userId = localStorage.getItem("crmUserId");
    const role = localStorage.getItem("crmRole");

    if (!userId || role !== "agent") return;

    const previousStatus =
      localStorage.getItem(`crmCurrentStatus:${userId}`) || "Active";

    setLocalStatus(userId, nextStatus);
    setStatusSaving(nextStatus);

    try {
      await sheetsPost({
        action: "updateStatus",
        agentId: userId,
        status: nextStatus,
      });
    } catch (error) {
      console.error("Google Sheets status update failed:", error);

      setLocalStatus(userId, previousStatus);
      alert("Status update failed. Please try again.");
    } finally {
      setStatusSaving("");
    }
  }

  async function handleLogout() {
    const userId = localStorage.getItem("crmUserId");
    const role = localStorage.getItem("crmRole");

    if (userId && role === "agent") {
      const checkOutTime = getTimeNow();

      setLocalStatus(userId, "Checked Out");
      setExtensionSession(false);

      try {
        await sheetsPost({
          action: "attendanceLogout",
          agentId: userId,
          logoutTime: checkOutTime,
        });
      } catch (error) {
        console.error("Google Sheets check-out failed:", error);
      }
    } else {
      setExtensionSession(false);
    }

    localStorage.removeItem("crmRole");
    localStorage.removeItem("crmUserId");
    localStorage.removeItem("crmUserName");

    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 flex-col border-r border-cyan-400/10 bg-[#03060b]/95 px-3 py-4 backdrop-blur-xl lg:flex">
      <div className="mb-8 flex items-center justify-center pt-3">
  <Image
    src="/crm-logo.png"
    alt="CRM by LeadsRift"
    width={175}
    height={90}
    priority
    className="object-contain"
  />
</div>

      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
  active
    ? "bg-cyan-300/10 text-cyan-200"
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
          disabled={Boolean(statusSaving)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-2.5 text-xs font-medium text-yellow-200 transition hover:bg-yellow-400/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Coffee size={15} />
          {statusSaving === "Break" ? "Updating..." : "Break"}
        </button>

        <button
          onClick={() => updateAgentStatus("Washroom")}
          disabled={Boolean(statusSaving)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-400/20 bg-purple-400/10 px-3 py-2.5 text-xs font-medium text-purple-200 transition hover:bg-purple-400/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Bath size={15} />
          {statusSaving === "Washroom" ? "Updating..." : "Washroom"}
        </button>

        <button
          onClick={() => updateAgentStatus("In Meeting")}
          disabled={Boolean(statusSaving)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-400/20 bg-blue-400/10 px-3 py-2.5 text-xs font-medium text-blue-200 transition hover:bg-blue-400/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Video size={15} />
          {statusSaving === "In Meeting" ? "Updating..." : "In Meeting"}
        </button>

        <button
          onClick={() => updateAgentStatus("Active")}
          disabled={Boolean(statusSaving)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2.5 text-xs font-medium text-emerald-200 transition hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <BriefcaseBusiness size={15} />
          {statusSaving === "Active" ? "Updating..." : "Back to Work"}
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