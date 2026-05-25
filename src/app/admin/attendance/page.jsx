"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Clock3,
  Users,
  UserCheck,
  AlertTriangle,
  CalendarDays,
  Timer,
  ShieldCheck,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";

const attendanceRecords = [
  {
    id: "LR-HAMZA",
    name: "Hamza",
    role: "Agent",
    campaign: "Commercial Cleaning",
    checkIn: "7:04 PM",
    checkOut: "3:08 AM",
    hours: "7h 04m",
    status: "Present",
    late: "4m",
    presentDays: 24,
    lateDays: 2,
    absentDays: 1,
  },
  {
    id: "LR-AMMAR",
    name: "Ammar",
    role: "Agent",
    campaign: "Roofing",
    checkIn: "7:18 PM",
    checkOut: "Active",
    hours: "Active",
    status: "Late",
    late: "18m",
    presentDays: 22,
    lateDays: 4,
    absentDays: 1,
  },
  {
    id: "LR-SAMEEN",
    name: "Sameen",
    role: "Agent",
    campaign: "Solar",
    checkIn: "6:58 PM",
    checkOut: "Active",
    hours: "Active",
    status: "Present",
    late: "0m",
    presentDays: 25,
    lateDays: 1,
    absentDays: 1,
  },
  {
    id: "LR-ASIM",
    name: "Asim",
    role: "Agent",
    campaign: "Commercial Cleaning",
    checkIn: "Not checked in",
    checkOut: "-",
    hours: "0h",
    status: "Absent",
    late: "-",
    presentDays: 19,
    lateDays: 3,
    absentDays: 5,
  },
];

const schedule = [
  { label: "Shift Opens", time: "7:00 PM", type: "Start" },
  { label: "Tea Break", time: "9:15 PM - 9:30 PM", type: "15 min" },
  { label: "Dinner Break", time: "12:00 AM - 12:30 AM", type: "30 min" },
  { label: "Tea Break", time: "2:45 AM - 3:00 AM", type: "15 min" },
];

export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecords = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return attendanceRecords.filter(
      (agent) =>
        agent.id.toLowerCase().includes(search) ||
        agent.name.toLowerCase().includes(search) ||
        agent.campaign.toLowerCase().includes(search) ||
        agent.status.toLowerCase().includes(search)
    );
  }, [searchTerm]);

  const presentCount = attendanceRecords.filter(
    (x) => x.status === "Present"
  ).length;

  const lateCount = attendanceRecords.filter((x) => x.status === "Late").length;
  const absentCount = attendanceRecords.filter((x) => x.status === "Absent").length;
  const activeCount = attendanceRecords.filter((x) => x.checkOut === "Active").length;

  return (
    <AdminShell
      title="Attendance"
      subtitle="Track agent check-in, checkout, monthly totals, and shift compliance."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStat
          label="Present Today"
          value={presentCount}
          note="On-time agents"
          icon={UserCheck}
          tone="text-green-300"
        />
        <AdminStat
          label="Late Today"
          value={lateCount}
          note="After 7:00 PM"
          icon={AlertTriangle}
          tone="text-yellow-300"
        />
        <AdminStat
          label="Absent Today"
          value={absentCount}
          note="Not checked in"
          icon={Users}
          tone="text-red-300"
        />
        <AdminStat
          label="Active Now"
          value={activeCount}
          note="Currently logged in"
          icon={Timer}
          tone="text-cyan-300"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
                Agent Search
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">
                Attendance Records
              </h3>
            </div>

            <div className="relative w-full xl:w-[360px]">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                placeholder="Search by Agent ID, name, campaign..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-300/35"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-white/[0.03] text-slate-400">
                <tr>
                  <th className="px-4 py-4 font-medium">Agent</th>
                  <th className="px-4 py-4 font-medium">Campaign</th>
                  <th className="px-4 py-4 font-medium">Check In</th>
                  <th className="px-4 py-4 font-medium">Check Out</th>
                  <th className="px-4 py-4 font-medium">Hours</th>
                  <th className="px-4 py-4 font-medium">Late</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 font-medium">Monthly</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {filteredRecords.map((agent) => (
                  <tr
                    key={agent.id}
                    className="text-slate-300 transition hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-4">
                      <p className="font-medium text-white">{agent.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{agent.id}</p>
                    </td>

                    <td className="px-4 py-4">{agent.campaign}</td>
                    <td className="px-4 py-4 text-cyan-300">{agent.checkIn}</td>
                    <td className="px-4 py-4">{agent.checkOut}</td>
                    <td className="px-4 py-4">{agent.hours}</td>
                    <td className="px-4 py-4 text-yellow-300">{agent.late}</td>

                    <td className="px-4 py-4">
                      <StatusPill status={agent.status} />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex gap-2 text-xs">
                        <span className="rounded-lg bg-emerald-300/10 px-2 py-1 text-emerald-300">
                          P {agent.presentDays}
                        </span>
                        <span className="rounded-lg bg-yellow-300/10 px-2 py-1 text-yellow-300">
                          L {agent.lateDays}
                        </span>
                        <span className="rounded-lg bg-red-300/10 px-2 py-1 text-red-300">
                          A {agent.absentDays}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      No attendance record found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-2">
              <Clock3 size={18} className="text-cyan-300" />
              <h3 className="text-lg font-semibold text-white">
                Call Center Timing
              </h3>
            </div>

            <div className="space-y-4">
              {schedule.map((item) => (
                <div
                  key={item.label + item.time}
                  className="flex items-center justify-between border-b border-white/10 pb-4 last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.type}</p>
                  </div>

                  <span className="text-sm text-cyan-300">{item.time}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-5">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-cyan-300" />
              <h3 className="text-lg font-semibold text-white">
                Attendance Rules
              </h3>
            </div>

            <div className="space-y-3 text-sm leading-6 text-slate-300">
              <p>• Login automatically counts as check-in.</p>
              <p>• Logout automatically counts as checkout.</p>
              <p>• After checkout, same-day login is blocked.</p>
              <p>• Breaks are fixed by schedule, not manually controlled.</p>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-2">
              <CalendarDays size={18} className="text-cyan-300" />
              <h3 className="text-lg font-semibold text-white">
                Monthly Summary
              </h3>
            </div>

            <div className="grid gap-3">
              <SummaryRow label="Avg Attendance" value="91%" />
              <SummaryRow label="Total Late Marks" value="10" />
              <SummaryRow label="Total Absences" value="8" />
              <SummaryRow label="Best Attendance" value="LR-SAMEEN" />
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}

function AdminStat({ label, value, note, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className={`rounded-xl bg-white/5 p-3 ${tone}`}>
          <Icon size={20} />
        </div>
        <span className="text-xs text-slate-500">{note}</span>
      </div>

      <p className="text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const styles = {
    Present: "border-emerald-300/20 bg-emerald-300/10 text-emerald-300",
    Late: "border-yellow-300/20 bg-yellow-300/10 text-yellow-300",
    Absent: "border-red-300/20 bg-red-300/10 text-red-300",
  };

  return (
    <span
      className={`rounded-lg border px-3 py-1 text-xs ${
        styles[status] || "border-white/10 bg-white/5 text-slate-300"
      }`}
    >
      {status}
    </span>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-cyan-300">{value}</span>
    </div>
  );
}