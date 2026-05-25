"use client";

import { useEffect, useState } from "react";
import {
  Clock3,
  UserCheck,
  LogOut,
  CalendarClock,
  Coffee,
  ShieldCheck,
} from "lucide-react";

import PageShell from "@/components/crm/PageShell";
import StatCard from "@/components/crm/StatCard";

const schedule = [
  {
    title: "Shift Opens",
    time: "7:00 PM",
    type: "Work Start",
  },
  {
    title: "Tea Break",
    time: "9:15 PM - 9:30 PM",
    type: "15 Minutes",
  },
  {
    title: "Dinner Break",
    time: "12:00 AM - 12:30 AM",
    type: "30 Minutes",
  },
  {
    title: "Tea Break",
    time: "2:45 AM - 3:00 AM",
    type: "15 Minutes",
  },
];

const history = [
  {
    date: "Today",
    checkIn: "7:04 PM",
    checkOut: "Not checked out",
    hours: "Active",
    status: "Present",
  },
  {
    date: "Yesterday",
    checkIn: "7:01 PM",
    checkOut: "3:08 AM",
    hours: "7h 07m",
    status: "Present",
  },
  {
    date: "May 23",
    checkIn: "7:12 PM",
    checkOut: "3:03 AM",
    hours: "6h 51m",
    status: "Late",
  },
];

export default function AttendancePage() {
  const [agentName, setAgentName] = useState("Muhammad");
  const [checkInTime, setCheckInTime] = useState("7:04 PM");
  const [status, setStatus] = useState("Present");

  useEffect(() => {
    const userId = localStorage.getItem("crmUserId");
    if (userId) setAgentName(userId);

    const savedCheckIn = localStorage.getItem("crmCheckInTime");
    if (savedCheckIn) setCheckInTime(savedCheckIn);
  }, []);

  return (
    <PageShell
      title="Attendance"
      subtitle="Your shift attendance is linked directly with login and logout."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Current Status"
          value={status}
          note="Checked in from login"
          icon={UserCheck}
          accent="green"
        />
        <StatCard
          label="Check In"
          value={checkInTime}
          note="Auto-marked on login"
          icon={Clock3}
          accent="cyan"
        />
        <StatCard
          label="Work Hours"
          value="Active"
          note="Counting until logout"
          icon={CalendarClock}
          accent="purple"
        />
        <StatCard
          label="Re-login Rule"
          value="Locked"
          note="After checkout, same-day login blocked"
          icon={ShieldCheck}
          accent="yellow"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
                Agent Shift
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">
                {agentName}
              </h3>
            </div>

            <span className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">
              Online
            </span>
          </div>

          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-black/20 text-cyan-300">
                <Clock3 size={22} />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white">
                  Shift started at {checkInTime}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Attendance is automatic. Login marks check-in. Logout marks
                  check-out. Once checked out, the agent cannot login again for
                  the same day.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Call Center Schedule
            </h3>

            <div className="space-y-4">
              {schedule.map((item) => (
                <div
                  key={item.title + item.time}
                  className="flex items-center justify-between border-b border-white/10 pb-4 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-300/10 text-cyan-300">
                      {item.title.includes("Break") ? (
                        <Coffee size={16} />
                      ) : (
                        <Clock3 size={16} />
                      )}
                    </div>

                    <div>
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.type}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm text-cyan-300">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
          <div className="mb-5 flex items-center gap-2">
            <LogOut size={18} className="text-cyan-300" />
            <h3 className="text-lg font-semibold text-white">
              Attendance History
            </h3>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-slate-400">
                <tr>
                  <th className="px-4 py-4 font-medium">Date</th>
                  <th className="px-4 py-4 font-medium">In</th>
                  <th className="px-4 py-4 font-medium">Out</th>
                  <th className="px-4 py-4 font-medium">Hours</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {history.map((row) => (
                  <tr key={row.date} className="text-slate-300">
                    <td className="px-4 py-4 text-white">{row.date}</td>
                    <td className="px-4 py-4">{row.checkIn}</td>
                    <td className="px-4 py-4">{row.checkOut}</td>
                    <td className="px-4 py-4">{row.hours}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-lg border px-3 py-1 text-xs ${
                          row.status === "Present"
                            ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-300"
                            : "border-yellow-300/20 bg-yellow-300/10 text-yellow-300"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 rounded-2xl border border-red-400/15 bg-red-400/10 p-4">
            <p className="text-sm font-medium text-red-300">
              Checkout rule active
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Logout will count as checkout. After checkout, same-day login
              should be blocked through login logic.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  );
}