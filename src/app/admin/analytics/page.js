"use client";

import { useMemo, useState } from "react";
import {
  Wallet,
  Search,
  CalendarDays,
  BadgeDollarSign,
  UserCheck,
  UserX,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";
import { users } from "@/data/agents";

const MONTHLY_SALARY = 50000;

function getWorkingDaysInMonth(year, month) {
  let total = 0;

  for (
    let day = new Date(year, month, 1);
    day.getMonth() === month;
    day.setDate(day.getDate() + 1)
  ) {
    const weekDay = day.getDay();

    if (weekDay !== 0 && weekDay !== 6) {
      total++;
    }
  }

  return total;
}

function formatPKR(value) {
  return `${Math.round(value).toLocaleString()} PKR`;
}

export default function AnalyticsPage() {
  const today = new Date();

  const [searchAgent, setSearchAgent] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  );

  const salaryRows = useMemo(() => {
    const [yearValue, monthValue] = selectedMonth.split("-").map(Number);
    const workingDays = getWorkingDaysInMonth(yearValue, monthValue - 1);
    const dailySalary = MONTHLY_SALARY / workingDays;

    return users
      .filter((user) => user.role === "agent")
      .filter((agent) => {
        const search = searchAgent.toLowerCase();

        return (
          agent.name.toLowerCase().includes(search) ||
          agent.id.toLowerCase().includes(search)
        );
      })
      .map((agent) => {
        const presentDays = 0;
        const absentDays = workingDays;
        const earnedSalary = dailySalary * presentDays;

        return {
          ...agent,
          workingDays,
          presentDays,
          absentDays,
          dailySalary,
          earnedSalary,
          monthlySalary: agent.salary || MONTHLY_SALARY,
        };
      });
  }, [searchAgent, selectedMonth]);

  const selectedSummary = salaryRows[0];

  return (
    <AdminShell
      title="Analytics"
      subtitle="Salary analytics and monthly attendance-based calculations."
    >
      <section className="rounded-2xl border border-cyan-300/15 bg-[#071018]/80 p-5 backdrop-blur-xl">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
              Salary Analytics
            </p>

            <h3 className="mt-1 text-lg font-semibold text-white">
              Agent Monthly Salary Calculation
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Base salary is fixed at 50,000 PKR. Saturday and Sunday are counted as off days.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={searchAgent}
                onChange={(e) => setSearchAgent(e.target.value)}
                placeholder="Search agent name or ID..."
                className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/35"
              />
            </div>

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-300/35"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SalaryMiniCard
            label="Monthly Salary"
            value={formatPKR(MONTHLY_SALARY)}
            icon={Wallet}
            tone="text-cyan-300"
          />

          <SalaryMiniCard
            label="Working Days"
            value={selectedSummary?.workingDays || 0}
            icon={CalendarDays}
            tone="text-purple-300"
          />

          <SalaryMiniCard
            label="Present Days"
            value={selectedSummary?.presentDays || 0}
            icon={UserCheck}
            tone="text-green-300"
          />

          <SalaryMiniCard
            label="Absent Days"
            value={selectedSummary?.absentDays || 0}
            icon={UserX}
            tone="text-red-300"
          />

          <SalaryMiniCard
            label="Estimated Salary"
            value={formatPKR(selectedSummary?.earnedSalary || 0)}
            icon={BadgeDollarSign}
            tone="text-yellow-300"
          />
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-white/[0.03] text-slate-400">
              <tr>
                <th className="px-4 py-4 font-medium">Agent</th>
                <th className="px-4 py-4 font-medium">Login ID</th>
                <th className="px-4 py-4 font-medium">Working Days</th>
                <th className="px-4 py-4 font-medium">Present</th>
                <th className="px-4 py-4 font-medium">Absent</th>
                <th className="px-4 py-4 font-medium">Daily Salary</th>
                <th className="px-4 py-4 font-medium">Estimated Salary</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {salaryRows.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No agent found.
                  </td>
                </tr>
              ) : (
                salaryRows.map((agent) => (
                  <tr key={agent.id} className="text-slate-300">
                    <td className="px-4 py-4 text-white">{agent.name}</td>
                    <td className="px-4 py-4 text-cyan-300">{agent.id}</td>
                    <td className="px-4 py-4">{agent.workingDays}</td>
                    <td className="px-4 py-4 text-green-300">
                      {agent.presentDays}
                    </td>
                    <td className="px-4 py-4 text-red-300">
                      {agent.absentDays}
                    </td>
                    <td className="px-4 py-4">
                      {formatPKR(agent.dailySalary)}
                    </td>
                    <td className="px-4 py-4 font-semibold text-yellow-300">
                      {formatPKR(agent.earnedSalary)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}

function SalaryMiniCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className={`rounded-xl bg-white/5 p-2 ${tone}`}>
          <Icon size={17} />
        </div>
      </div>

      <p className="text-xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}