"use client";

import AutoLogout from "@/components/crm/AutoLogout";
import { useEffect, useState } from "react";
import {
  Clock3,
  UserCheck,
  ShieldCheck,
  Coffee,
  CalendarClock,
} from "lucide-react";

import PageShell from "@/components/crm/PageShell";
import StatCard from "@/components/crm/StatCard";

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function formatAgentName(value) {
  if (!value) return "Agent";

  return value
    .replace(/^LR-/i, "")
    .replace(/[-_]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function getWorkDuration(checkInTime) {
  if (!checkInTime) return "0h 0m";

  const now = new Date();
  const checkIn = new Date();

  const [time, modifier] = checkInTime.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  checkIn.setHours(hours);
  checkIn.setMinutes(minutes);

  if (checkIn > now) {
    checkIn.setDate(checkIn.getDate() - 1);
  }

  const diff = now - checkIn;
  const total = Math.floor(diff / 1000 / 60);

  return `${Math.floor(total / 60)}h ${total % 60}m`;
}

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

export default function AttendancePage() {
  const [agentName, setAgentName] = useState("Agent");
  const [checkIn, setCheckIn] = useState("-");
  const [checkOut, setCheckOut] = useState("-");
  const [hours, setHours] = useState("0h 0m");
  const [status, setStatus] = useState("Absent");

  useEffect(() => {
    const userId = localStorage.getItem("crmUserId");

    if (!userId) return;

    setAgentName(formatAgentName(userId));

    const today = getTodayKey();

    const checkInDate = localStorage.getItem(`crmCheckInDate:${userId}`);
    const inTime = localStorage.getItem(`crmCheckInTime:${userId}`);
    const checkedOutDate = localStorage.getItem(`crmCheckedOutDate:${userId}`);
    const outTime = localStorage.getItem(`crmCheckOutTime:${userId}`);

    if (checkInDate === today) {
      setCheckIn(inTime || "-");
      setHours(getWorkDuration(inTime));

      setStatus(checkedOutDate === today ? "Checked Out" : "Present");

      if (checkedOutDate === today) {
        setCheckOut(outTime || "-");
      }
    }
  }, []);

  return (
    <>
      <AutoLogout />

      <PageShell title="Attendance" subtitle="Today's attendance only">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Current Status"
            value={status}
            note="Today's status"
            icon={UserCheck}
          />

          <StatCard
            label="Check In"
            value={checkIn}
            note="Auto from login"
            icon={Clock3}
          />

          <StatCard
            label="Work Hours"
            value={hours}
            note="Live tracking"
            icon={CalendarClock}
          />

          <StatCard
            label="Re-login"
            value="Locked"
            note="After checkout"
            icon={ShieldCheck}
          />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
          <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
                Agent Shift
              </p>

              <h3 className="mt-1 text-lg font-semibold text-white">
                {agentName}
              </h3>
            </div>

            <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-5">
              <h2 className="text-lg font-semibold text-white">
                Check In: {checkIn}
              </h2>

              <p className="mt-2 text-slate-300">Check Out: {checkOut}</p>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
              <h3 className="mb-4 text-white">Call Center Schedule</h3>

              <div className="space-y-4">
                {schedule.map((item) => (
                  <div
                    key={item.title + item.time}
                    className="flex justify-between border-b border-white/10 pb-4"
                  >
                    <div className="flex items-center gap-3">
                      <Coffee size={14} className="text-cyan-300" />

                      <div>
                        <p className="text-white">{item.title}</p>
                        <p className="text-sm text-slate-500">{item.type}</p>
                      </div>
                    </div>

                    <span className="text-cyan-300">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5">
            <h3 className="mb-5 text-white">Today&apos;s Attendance</h3>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-slate-400">Date</p>
              <p className="mt-1 text-white">Today</p>

              <hr className="my-4 border-white/10" />

              <p className="text-slate-400">Status</p>
              <p className="mt-1 text-cyan-300">{status}</p>

              <hr className="my-4 border-white/10" />

              <p className="text-slate-400">Hours</p>
              <p className="mt-1 text-white">{hours}</p>
            </div>
          </section>
        </div>
      </PageShell>
    </>
  );
}