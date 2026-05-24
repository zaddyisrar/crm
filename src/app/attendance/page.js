"use client";

import { useState } from "react";
import {
  Clock3,
  LogIn,
  LogOut,
  Coffee,
  Toilet,
  Activity,
  Timer,
} from "lucide-react";

import PageShell from "@/components/crm/PageShell";
import StatCard from "@/components/crm/StatCard";
import SectionCard from "@/components/crm/SectionCard";

const defaultTimeline = [
  { time: "09:14 AM", action: "Checked In", note: "Shift started" },
  { time: "09:30 AM", action: "Started Calling", note: "Commercial Cleaning campaign" },
  { time: "11:15 AM", action: "Break", note: "Short break started" },
  { time: "11:32 AM", action: "Back Active", note: "Returned to calling" },
  { time: "01:10 PM", action: "Washroom", note: "Temporary away status" },
];

export default function AttendancePage() {
  const [status, setStatus] = useState("Active");
  const [timeline, setTimeline] = useState(defaultTimeline);

  function addStatus(nextStatus, note) {
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setStatus(nextStatus);
    setTimeline((prev) => [
      { time: now, action: nextStatus, note },
      ...prev,
    ]);
  }

  return (
    <PageShell
      title="Attendance"
      subtitle="Track your work status, breaks, and daily activity."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Current Status"
          value={status}
          note="Live agent state"
          icon={Activity}
          accent="cyan"
        />
        <StatCard
          label="Total Work Time"
          value="5h 42m"
          note="Today’s active time"
          icon={Timer}
          accent="purple"
        />
        <StatCard
          label="Check In"
          value="09:14 AM"
          note="Marked present"
          icon={LogIn}
          accent="green"
        />
        <StatCard
          label="Break Time"
          value="18m"
          note="Total break duration"
          icon={Coffee}
          accent="yellow"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <SectionCard
          title="Quick Status"
          subtitle="Update your availability with one click."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => addStatus("Checked In", "Agent started the shift")}
              className="flex items-center justify-center gap-2 rounded-2xl border border-green-400/20 bg-green-400/10 px-5 py-4 text-sm font-medium text-green-200 transition hover:bg-green-400/15"
            >
              <LogIn size={18} />
              Check In
            </button>

            <button
              onClick={() => addStatus("Checked Out", "Agent ended the shift")}
              className="flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm font-medium text-red-200 transition hover:bg-red-400/15"
            >
              <LogOut size={18} />
              Check Out
            </button>

            <button
              onClick={() => addStatus("Break", "Agent started a break")}
              className="flex items-center justify-center gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-5 py-4 text-sm font-medium text-yellow-200 transition hover:bg-yellow-400/15"
            >
              <Coffee size={18} />
              Start Break
            </button>

            <button
              onClick={() => addStatus("Washroom", "Agent is temporarily away")}
              className="flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/15"
            >
              <Toilet size={18} />
              Washroom
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-slate-400">Current agent</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              Muhammad Israr
            </h3>
            <p className="mt-2 text-sm text-cyan-200">
              Status: {status}
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Today’s Timeline" subtitle="Live activity history.">
          <div className="space-y-4">
            {timeline.map((item, index) => (
              <div
                key={`${item.time}-${index}`}
                className="relative rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                    <Clock3 size={18} />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-medium text-white">{item.action}</h4>
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-400">
                        {item.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{item.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}