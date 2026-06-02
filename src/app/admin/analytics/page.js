"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Search,
  CalendarDays,
  BadgeDollarSign,
  UserCheck,
  UserX,
  RefreshCcw,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";
import { sheetsPost } from "@/lib/sheetsApi";

function getCurrentMonthKey() {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

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

function normalizeDate(value) {
  if (!value) return "";

  const stringValue = String(value).trim();

  if (stringValue.includes("T")) {
    return stringValue.split("T")[0];
  }

  return stringValue;
}

function getMonthFromDate(value) {
  const date = normalizeDate(value);

  if (!date || date.length < 7) return "";

  return date.slice(0, 7);
}

function formatPKR(value) {
  const safeValue = Number(value || 0);

  return `${Math.round(safeValue).toLocaleString()} PKR`;
}

function getNumber(value, fallback = 0) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function AnalyticsPage() {
  const [searchAgent, setSearchAgent] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());

  const [agentRows, setAgentRows] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [leadRows, setLeadRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics(showLoader = false) {
    try {
      if (showLoader) setLoading(true);

      setError("");

      const agentsResponse = await sheetsPost({ action: "getAgents" });
      const attendanceResponse = await sheetsPost({
        action: "getAttendance",
      });
      const leadsResponse = await sheetsPost({ action: "getLeads" });

      setAgentRows(agentsResponse.data || []);
      setAttendanceRows(attendanceResponse.data || []);
      setLeadRows(leadsResponse.data || []);
    } catch (err) {
      console.error("Admin analytics sheet read failed:", err);
      setError(err.message || "Failed to load analytics from Google Sheets");
      setAgentRows([]);
      setAttendanceRows([]);
      setLeadRows([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics(true);

    const interval = setInterval(() => {
      loadAnalytics(false);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const salaryRows = useMemo(() => {
    const [yearValue, monthValue] = selectedMonth.split("-").map(Number);
    const workingDays = getWorkingDaysInMonth(yearValue, monthValue - 1);

    const agents = agentRows.filter(
      (user) => String(user.Role || "").toLowerCase() === "agent"
    );

    return agents
      .filter((agent) => {
        const search = searchAgent.toLowerCase();

        return (
          String(agent.AgentName || "").toLowerCase().includes(search) ||
          String(agent.AgentID || "").toLowerCase().includes(search)
        );
      })
      .map((agent) => {
        const agentId = String(agent.AgentID || "").toUpperCase();
        const monthlySalary = getNumber(agent.Salary, 0);
        const requiredWorkingHours = getNumber(agent.WorkingHours, 8);

        const agentAttendanceForMonth = attendanceRows.filter((row) => {
          const sameAgent =
            String(row.AgentID || "").toUpperCase() === agentId;

          const sameMonth = getMonthFromDate(row.Date) === selectedMonth;

          return sameAgent && sameMonth;
        });

        const uniquePresentDays = new Set(
          agentAttendanceForMonth.map((row) => normalizeDate(row.Date))
        );

        const presentDays = uniquePresentDays.size;
        const absentDays = Math.max(workingDays - presentDays, 0);

        const dailySalary =
          workingDays > 0 ? monthlySalary / workingDays : 0;

        const earnedSalary = dailySalary * presentDays;

        const leadsThisMonth = leadRows.filter((lead) => {
          const sameAgent =
            String(lead.AgentID || "").toUpperCase() === agentId;

          const sameMonth = getMonthFromDate(lead.Date) === selectedMonth;

          return sameAgent && sameMonth;
        });

        const approvedLeads = leadsThisMonth.filter(
          (lead) =>
            String(lead.ApprovalStatus || "").toLowerCase() === "approved"
        ).length;

        const pendingLeads = leadsThisMonth.filter(
          (lead) =>
            String(lead.ApprovalStatus || "").toLowerCase() === "pending"
        ).length;

        const rejectedLeads = leadsThisMonth.filter(
          (lead) =>
            String(lead.ApprovalStatus || "").toLowerCase() === "rejected"
        ).length;

        return {
          agentId: agent.AgentID || "-",
          agentName: agent.AgentName || "Agent",
          monthlySalary,
          requiredWorkingHours,
          workingDays,
          presentDays,
          absentDays,
          dailySalary,
          earnedSalary,
          totalLeads: leadsThisMonth.length,
          approvedLeads,
          pendingLeads,
          rejectedLeads,
        };
      });
  }, [agentRows, attendanceRows, leadRows, searchAgent, selectedMonth]);

  const summary = useMemo(() => {
    const totalMonthlySalary = salaryRows.reduce(
      (sum, agent) => sum + agent.monthlySalary,
      0
    );

    const totalEstimatedSalary = salaryRows.reduce(
      (sum, agent) => sum + agent.earnedSalary,
      0
    );

    const totalPresentDays = salaryRows.reduce(
      (sum, agent) => sum + agent.presentDays,
      0
    );

    const totalAbsentDays = salaryRows.reduce(
      (sum, agent) => sum + agent.absentDays,
      0
    );

    return {
      totalMonthlySalary,
      totalEstimatedSalary,
      totalPresentDays,
      totalAbsentDays,
    };
  }, [salaryRows]);

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
              Data is calculated from Agents, Attendance, and Leads sheets.
              Saturday and Sunday are counted as off days.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
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

            <button
              onClick={() => loadAnalytics(true)}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-sm font-bold text-cyan-200 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SalaryMiniCard
            label="Total Monthly Payroll"
            value={loading ? "..." : formatPKR(summary.totalMonthlySalary)}
            icon={Wallet}
            tone="text-cyan-300"
          />

          <SalaryMiniCard
            label="Estimated Payable"
            value={loading ? "..." : formatPKR(summary.totalEstimatedSalary)}
            icon={BadgeDollarSign}
            tone="text-yellow-300"
          />

          <SalaryMiniCard
            label="Present Days"
            value={loading ? "..." : summary.totalPresentDays}
            icon={UserCheck}
            tone="text-green-300"
          />

          <SalaryMiniCard
            label="Absent Days"
            value={loading ? "..." : summary.totalAbsentDays}
            icon={UserX}
            tone="text-red-300"
          />

          <SalaryMiniCard
            label="Agents"
            value={loading ? "..." : salaryRows.length}
            icon={CalendarDays}
            tone="text-purple-300"
          />
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[1250px] text-left text-sm">
            <thead className="bg-white/[0.03] text-slate-400">
              <tr>
                <th className="px-4 py-4 font-medium">Agent</th>
                <th className="px-4 py-4 font-medium">Login ID</th>
                <th className="px-4 py-4 font-medium">Monthly Salary</th>
                <th className="px-4 py-4 font-medium">Working Days</th>
                <th className="px-4 py-4 font-medium">Present</th>
                <th className="px-4 py-4 font-medium">Absent</th>
                <th className="px-4 py-4 font-medium">Daily Salary</th>
                <th className="px-4 py-4 font-medium">Estimated Salary</th>
                <th className="px-4 py-4 font-medium">Leads</th>
                <th className="px-4 py-4 font-medium">Approved</th>
                <th className="px-4 py-4 font-medium">Pending</th>
                <th className="px-4 py-4 font-medium">Rejected</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td
                    colSpan="12"
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Loading analytics from Google Sheets...
                  </td>
                </tr>
              ) : salaryRows.length === 0 ? (
                <tr>
                  <td
                    colSpan="12"
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No agent found.
                  </td>
                </tr>
              ) : (
                salaryRows.map((agent) => (
                  <tr key={agent.agentId} className="text-slate-300">
                    <td className="px-4 py-4 text-white">
                      {agent.agentName}
                    </td>
                    <td className="px-4 py-4 text-cyan-300">
                      {agent.agentId}
                    </td>
                    <td className="px-4 py-4">
                      {formatPKR(agent.monthlySalary)}
                    </td>
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
                    <td className="px-4 py-4">{agent.totalLeads}</td>
                    <td className="px-4 py-4 text-emerald-300">
                      {agent.approvedLeads}
                    </td>
                    <td className="px-4 py-4 text-yellow-300">
                      {agent.pendingLeads}
                    </td>
                    <td className="px-4 py-4 text-red-300">
                      {agent.rejectedLeads}
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