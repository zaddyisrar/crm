"use client";

import AutoLogout from "@/components/crm/AutoLogout";
import PageShell from "@/components/crm/PageShell";
import { useEffect, useState } from "react";
import {
  Clock3,
  UserCheck,
  CalendarClock,
  Coffee,
  Bath,
  BriefcaseBusiness,
  LogOut,
  CalendarDays,
} from "lucide-react";

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
  if (!checkInTime || checkInTime === "-") return "0h 0m";

  const now = new Date();
  const checkIn = new Date();

  const [time, modifier] = checkInTime.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  checkIn.setHours(hours);
  checkIn.setMinutes(minutes);
  checkIn.setSeconds(0);

  if (checkIn > now) checkIn.setDate(checkIn.getDate() - 1);

  const diff = now - checkIn;
  const total = Math.floor(diff / 1000 / 60);

  return `${Math.floor(total / 60)}h ${total % 60}m`;
}

export default function AttendancePage() {
  const [agentId, setAgentId] = useState("");
  const [agentName, setAgentName] = useState("Agent");
  const [checkIn, setCheckIn] = useState("-");
  const [checkOut, setCheckOut] = useState("-");
  const [hours, setHours] = useState("0h 0m");
  const [status, setStatus] = useState("Absent");
  const [currentStatus, setCurrentStatus] = useState("Active");

  useEffect(() => {
    const userId = localStorage.getItem("crmUserId");
    const userName = localStorage.getItem("crmUserName");

    if (!userId) return;

    setAgentId(userId);
    setAgentName(userName || formatAgentName(userId));

    const today = getTodayKey();

    const savedStatus =
      localStorage.getItem(`crmCurrentStatus:${userId}`) || "Active";

    const checkInDate = localStorage.getItem(`crmCheckInDate:${userId}`);
    const inTime = localStorage.getItem(`crmCheckInTime:${userId}`);
    const checkedOutDate = localStorage.getItem(`crmCheckedOutDate:${userId}`);
    const outTime = localStorage.getItem(`crmCheckOutTime:${userId}`);

    setCurrentStatus(savedStatus);

    if (checkInDate === today) {
      setCheckIn(inTime || "-");
      setHours(getWorkDuration(inTime));
      setStatus(checkedOutDate === today ? "Checked Out" : "Present");

      if (checkedOutDate === today) setCheckOut(outTime || "-");
    }

    function syncStatus() {
      const nextStatus =
        localStorage.getItem(`crmCurrentStatus:${userId}`) || "Active";
      setCurrentStatus(nextStatus);
    }

    window.addEventListener("crm-status-change", syncStatus);

    return () => {
      window.removeEventListener("crm-status-change", syncStatus);
    };
  }, []);

  useEffect(() => {
    if (!checkIn || checkIn === "-") return;

    const timer = setInterval(() => {
      setHours(getWorkDuration(checkIn));
    }, 60000);

    return () => clearInterval(timer);
  }, [checkIn]);

  return (
    <>
      <AutoLogout />

      <PageShell title="Attendance" subtitle="Live shift tracking">
        <div className="origin-top-left scale-[0.9] w-[111.11%]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <StatusBadge status={currentStatus} />

            <div className="rounded-2xl border border-cyan-300/15 bg-[#071018]/80 px-4 py-2 text-sm font-bold text-slate-300">
              Agent ID: <span className="text-cyan-300">{agentId || "-"}</span>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <StatBox
              title="Status"
              value={status}
              sub="Today attendance"
              icon={UserCheck}
              tone="emerald"
            />

            <StatBox
              title="Check In"
              value={checkIn}
              sub="Auto from login"
              icon={Clock3}
              tone="cyan"
            />

            <StatBox
              title="Work Hours"
              value={hours}
              sub="Live tracking"
              icon={CalendarClock}
              tone="yellow"
            />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.8fr]">
            <section className="rounded-[2rem] border border-cyan-300/15 bg-[#071018]/80 p-5 backdrop-blur-xl">
              <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
                  Agent Shift
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  {agentName}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current work session details.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <ShiftCard label="Check In" value={checkIn} icon={Clock3} />
                <ShiftCard label="Check Out" value={checkOut} icon={LogOut} />
                <ShiftCard label="Shift Date" value="Today" icon={CalendarDays} />
                <ShiftCard
                  label="Live Status"
                  value={
                    currentStatus === "Break"
                      ? "On Break"
                      : currentStatus === "Washroom"
                      ? "Washroom"
                      : "Active"
                  }
                  icon={
                    currentStatus === "Break"
                      ? Coffee
                      : currentStatus === "Washroom"
                      ? Bath
                      : BriefcaseBusiness
                  }
                />
              </div>
            </section>

            <section className="rounded-[2rem] border border-cyan-300/15 bg-[#071018]/80 p-5 backdrop-blur-xl">
              <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
                  Shift Rules
                </p>

                <h2 className="mt-2 text-xl font-black text-white">
                  Call Center Timings
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Fixed schedule for agent operations.
                </p>
              </div>

              <div className="space-y-3">
                <Rule title="Shift Opens" time="7:00 PM" />
                <Rule title="Tea Break" time="9:15 PM - 9:30 PM" />
                <Rule title="Dinner Break" time="12:00 AM - 12:30 AM" />
                <Rule title="Tea Break" time="2:45 AM - 3:00 AM" />
              </div>
            </section>
          </div>

          <section className="mt-4 rounded-[2rem] border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
                  History
                </p>

                <h2 className="mt-2 text-xl font-black text-white">
                  Attendance Preview
                </h2>
              </div>

              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-300">
                Frontend Only
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.22em] text-cyan-300">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Check In</th>
                    <th className="px-4 py-3">Check Out</th>
                    <th className="px-4 py-3">Hours</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-t border-white/10 text-slate-300">
                    <td className="px-4 py-4 font-bold text-white">Today</td>
                    <td className="px-4 py-4">{checkIn}</td>
                    <td className="px-4 py-4">{checkOut}</td>
                    <td className="px-4 py-4 text-cyan-300">{hours}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                        {status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </PageShell>
    </>
  );
}

function StatBox({ title, value, sub, icon: Icon, tone }) {
  const colors = {
    emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-300",
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-300",
    yellow: "border-yellow-300/20 bg-yellow-300/10 text-yellow-300",
  };

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
          {title}
        </p>

        <div className={`rounded-2xl border p-3 ${colors[tone]}`}>
          <Icon size={20} />
        </div>
      </div>

      <h3 className="text-3xl font-black text-white">{value}</h3>
      <p className="mt-1 text-sm text-slate-500">{sub}</p>
    </div>
  );
}

function ShiftCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
          {label}
        </p>

        <div className="rounded-xl bg-cyan-300/10 p-2 text-cyan-300">
          <Icon size={16} />
        </div>
      </div>

      <p className="text-xl font-black text-white">{value}</p>
    </div>
  );
}

function Rule({ title, time }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
      <div className="flex items-center gap-3">
        <Coffee size={15} className="text-cyan-300" />
        <p className="text-sm font-bold text-white">{title}</p>
      </div>

      <p className="text-sm font-bold text-cyan-300">{time}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    Active: {
      label: "Active",
      className: "border-emerald-300/20 bg-emerald-300/10 text-emerald-300",
      icon: BriefcaseBusiness,
    },
    Break: {
      label: "On Break",
      className: "border-yellow-300/20 bg-yellow-300/10 text-yellow-300",
      icon: Coffee,
    },
    Washroom: {
      label: "Washroom",
      className: "border-purple-300/20 bg-purple-300/10 text-purple-300",
      icon: Bath,
    },
  };

  const item = config[status] || config.Active;
  const Icon = item.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-bold ${item.className}`}
    >
      <Icon size={16} />
      Current Status: {item.label}
    </div>
  );
}