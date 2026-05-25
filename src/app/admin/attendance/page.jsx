"use client";

import { useEffect, useState } from "react";
import { Clock3, UserCheck, Users, AlertTriangle } from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";
import { users } from "@/data/users";

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

export default function AttendancePage() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const today = getTodayKey();

    const agentRecords = users
      .filter((user) => user.role === "agent")
      .map((agent) => {
        const checkInDate = localStorage.getItem(`crmCheckInDate:${agent.id}`);
        const checkIn = localStorage.getItem(`crmCheckInTime:${agent.id}`);
        const checkOutDate = localStorage.getItem(
          `crmCheckedOutDate:${agent.id}`
        );
        const checkOut = localStorage.getItem(`crmCheckOutTime:${agent.id}`);

        const presentToday = checkInDate === today;
        const checkedOutToday = checkOutDate === today;

        return {
          id: agent.id,
          name: agent.name,
          checkIn: presentToday ? checkIn : "-",
          checkOut: checkedOutToday ? checkOut : "-",
          status: presentToday
            ? checkedOutToday
              ? "Checked Out"
              : "Active"
            : "Absent",
        };
      });

    setRecords(agentRecords);
  }, []);

  const present = records.filter((x) => x.status !== "Absent").length;
  const active = records.filter((x) => x.status === "Active").length;
  const absent = records.filter((x) => x.status === "Absent").length;

  return (
    <AdminShell>
      <div className="mb-5 rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03] px-8 py-6">
        <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-300">
          TODAY ATTENDANCE
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">Attendance</h1>

        <p className="mt-2 text-sm text-slate-500">
          Only today&apos;s check-in and checkout records are shown.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Stat title="Present Today" value={present} icon={UserCheck} />
        <Stat title="Active Now" value={active} icon={Clock3} />
        <Stat title="Absent Today" value={absent} icon={AlertTriangle} />
      </div>

      <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03]">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-slate-400">
            <tr>
              <th className="px-5 py-4 font-medium">Agent</th>
              <th className="px-5 py-4 font-medium">Login ID</th>
              <th className="px-5 py-4 font-medium">Check In</th>
              <th className="px-5 py-4 font-medium">Check Out</th>
              <th className="px-5 py-4 font-medium">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {records.map((agent) => (
              <tr key={agent.id} className="text-slate-300">
                <td className="px-5 py-4 text-white">{agent.name}</td>
                <td className="px-5 py-4 text-cyan-300">{agent.id}</td>
                <td className="px-5 py-4">{agent.checkIn}</td>
                <td className="px-5 py-4">{agent.checkOut}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-lg border px-3 py-1 text-xs ${
                      agent.status === "Active"
                        ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-300"
                        : agent.status === "Checked Out"
                        ? "border-yellow-300/20 bg-yellow-300/10 text-yellow-300"
                        : "border-red-300/20 bg-red-300/10 text-red-300"
                    }`}
                  >
                    {agent.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

function Stat({ title, value, icon: Icon }) {
  return (
    <div className="rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03] p-5">
      <div className="mb-4 rounded-xl bg-cyan-300/10 p-3 text-cyan-300 w-fit">
        <Icon size={18} />
      </div>

      <h2 className="text-2xl font-black text-white">{value}</h2>
      <p className="mt-1 text-sm text-slate-400">{title}</p>
    </div>
  );
}