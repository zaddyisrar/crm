"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Clock3,
  Target,
  UserCheck,
  PhoneCall,
  CalendarCheck,
  ArrowRight,
  Activity,
} from "lucide-react";

import PageShell from "@/components/crm/PageShell";
import StatCard from "@/components/crm/StatCard";

const focusItems = [
  "Complete today’s assigned campaign leads",
  "Follow up with interested prospects",
  "Keep attendance status updated",
  "Move booked prospects to meetings",
];

const recentActivity = [
  { time: "09:05 AM", text: "Logged in successfully" },
  { time: "09:07 AM", text: "Campaign selected" },
  { time: "09:20 AM", text: "First call session started" },
  { time: "10:15 AM", text: "3 leads updated today" },
];

function formatAgentName(value) {
  if (!value) return "Agent";

  return value
    .replace(/^LR-/i, "")
    .replace(/[-_]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function DashboardPage() {
  const [agentName, setAgentName] = useState("Agent");
  const [campaign, setCampaign] = useState("Commercial Cleaning");
  const [checkInTime, setCheckInTime] = useState("09:05 AM");

  useEffect(() => {
    const userId = localStorage.getItem("crmUserId");
    const savedCampaign = localStorage.getItem("crmCampaign");

    if (userId) {
      setAgentName(formatAgentName(userId));

      const savedCheckIn = localStorage.getItem(`crmCheckInTime:${userId}`);
      if (savedCheckIn) setCheckInTime(savedCheckIn);
    }

    if (savedCampaign) setCampaign(savedCampaign);
  }, []);

  return (
    <PageShell
      title={`Good Morning, ${agentName} 👋`}
      subtitle="Simple overview of today’s CRM activity."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Current Campaign"
          value={campaign}
          note="Active campaign"
          icon={Target}
          accent="cyan"
        />
        <StatCard
          label="Attendance"
          value="Present"
          note={`Checked in at ${checkInTime}`}
          icon={UserCheck}
          accent="green"
        />
        <StatCard
          label="Leads Today"
          value="25"
          note="Assigned for today"
          icon={Users}
          accent="purple"
        />
        <StatCard
          label="Work Hours"
          value="Active"
          note="Counting until logout"
          icon={Clock3}
          accent="yellow"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
                Today’s Focus
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">
                Agent Daily Overview
              </h3>
            </div>

            <span className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">
              Online
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {focusItems.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-cyan-300/10 text-cyan-300">
                  <Activity size={17} />
                </div>
                <p className="text-sm leading-6 text-slate-300">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <a
              href="/calls"
              className="flex items-center justify-between rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-medium text-cyan-200 hover:bg-cyan-300/15"
            >
              Open Dialer
              <PhoneCall size={16} />
            </a>

            <a
              href="/leads"
              className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-slate-300 hover:border-cyan-300/30 hover:text-cyan-200"
            >
              View Leads
              <Users size={16} />
            </a>

            <a
              href="/meetings"
              className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-slate-300 hover:border-cyan-300/30 hover:text-cyan-200"
            >
              Meetings
              <CalendarCheck size={16} />
            </a>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Recent Activity
            </h3>
            <span className="text-sm text-cyan-300">Today</span>
          </div>

          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div
                key={item.text}
                className="flex items-start gap-3 border-b border-white/10 pb-4 last:border-b-0"
              >
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-300" />
                <div>
                  <p className="text-sm text-slate-400">{item.time}</p>
                  <p className="mt-1 text-sm text-slate-200">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <a
            href="/attendance"
            className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-cyan-300 hover:border-cyan-300/30"
          >
            View Attendance
            <ArrowRight size={16} />
          </a>
        </section>
      </div>
    </PageShell>
  );
}