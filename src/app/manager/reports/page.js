"use client";

import { useEffect, useMemo, useState } from "react";
import ManagerShell from "@/components/manager/ManagerShell";
import { sheetsPost } from "@/lib/sheetsApi";
import {
  CalendarCheck,
  FileBarChart,
  Banknote,
  Trophy,
  TrendingUp,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function normalizeDate(value) {
  if (!value) return "";

  const stringValue = String(value).trim();

  if (stringValue.includes("T")) {
    return stringValue.split("T")[0];
  }

  return stringValue;
}

function formatPKR(value) {
  return `PKR ${Number(value || 0).toLocaleString()}`;
}

function getStatus(attendanceRow) {
  if (!attendanceRow) return "Absent";

  if (attendanceRow.LogoutTime && attendanceRow.LogoutTime !== "-") {
    return "Checked Out";
  }

  return attendanceRow.Status || "Active";
}

function statusBadgeClass(status) {
  if (status === "Active") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  }

  if (status === "Checked Out") {
    return "border-orange-400/20 bg-orange-400/10 text-orange-300";
  }

  if (status === "Break") {
    return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300";
  }

  if (status === "Washroom") {
    return "border-purple-400/20 bg-purple-400/10 text-purple-300";
  }

  return "border-red-400/20 bg-red-400/10 text-red-300";
}

export default function ManagerReportsPage() {
  const [agentRows, setAgentRows] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [leadRows, setLeadRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReports(showLoader = false) {
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
      console.error("Manager reports sheet read failed:", err);
      setError(err.message || "Failed to load reports from Google Sheets");
      setAgentRows([]);
      setAttendanceRows([]);
      setLeadRows([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    loadReports(true);

    const interval = setInterval(() => {
      loadReports(false);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const today = getTodayKey();

  const agentReports = useMemo(() => {
    const agents = agentRows.filter(
      (user) => String(user.Role || "").toLowerCase() === "agent"
    );

    const todayAttendance = attendanceRows.filter(
      (row) => normalizeDate(row.Date) === today
    );

    const todayLeads = leadRows.filter(
      (lead) => normalizeDate(lead.Date) === today
    );

    return agents.map((agent) => {
      const agentId = String(agent.AgentID || "").toUpperCase();

      const agentAttendanceRows = todayAttendance.filter(
        (row) => String(row.AgentID || "").toUpperCase() === agentId
      );

      const latestAttendance =
        agentAttendanceRows[agentAttendanceRows.length - 1];

      const agentLeads = todayLeads.filter(
        (lead) => String(lead.AgentID || "").toUpperCase() === agentId
      );

      const approved = agentLeads.filter(
        (lead) =>
          String(lead.ApprovalStatus || "").toLowerCase() === "approved"
      ).length;

      const status = getStatus(latestAttendance);

      return {
        name: agent.AgentName || "Agent",
        id: agent.AgentID || "-",
        status,
        checkIn: latestAttendance?.LoginTime || "-",
        checkOut: latestAttendance?.LogoutTime || "-",
        leads: agentLeads.length,
        approved,
        salary: Number(agent.Salary || 0),
      };
    });
  }, [agentRows, attendanceRows, leadRows, today]);

  const presentToday = agentReports.filter(
    (agent) => agent.status !== "Absent"
  ).length;

  const totalLeads = agentReports.reduce((sum, agent) => sum + agent.leads, 0);

  const approvedLeads = agentReports.reduce(
    (sum, agent) => sum + agent.approved,
    0
  );

  const salaryDue = agentReports.reduce((sum, agent) => {
    if (agent.status === "Absent") return sum;
    return sum + agent.salary;
  }, 0);

  const topAgents = useMemo(() => {
    return [...agentReports]
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 3)
      .map((agent, index) => ({
        rank: `#${index + 1}`,
        name: agent.name,
        metric: `${agent.leads} Leads`,
      }));
  }, [agentReports]);

  return (
    <ManagerShell>
      {error && (
        <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mb-5 flex justify-end">
        <button
          onClick={() => loadReports(true)}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-sm font-bold text-cyan-200 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <ReportCard
          title="Present Today"
          value={loading ? "..." : presentToday}
          subtitle="Agents marked present today"
          icon={CalendarCheck}
          tone="emerald"
        />

        <ReportCard
          title="Total Leads"
          value={loading ? "..." : totalLeads}
          subtitle="Submitted today"
          icon={FileBarChart}
          tone="cyan"
        />

        <ReportCard
          title="Approved Leads"
          value={loading ? "..." : approvedLeads}
          subtitle="Manager approved today"
          icon={TrendingUp}
          tone="yellow"
        />

        <ReportCard
          title="Salary Preview"
          value={loading ? "..." : formatPKR(salaryDue)}
          subtitle="Present agents salary base"
          icon={Banknote}
          tone="purple"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.7fr]">
        <section className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6 backdrop-blur-xl">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
                Agent Performance Report
              </p>

              <h2 className="mt-2 text-2xl font-black text-white">
                Today&apos;s Agent Summary
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Live data from Agents, Attendance, and Leads sheets.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-300">
              Google Sheets Live
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.22em] text-cyan-300">
                <tr>
                  <th className="px-5 py-4">Agent</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Check In</th>
                  <th className="px-5 py-4">Check Out</th>
                  <th className="px-5 py-4">Leads</th>
                  <th className="px-5 py-4">Approved</th>
                  <th className="px-5 py-4">Salary</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      Loading reports from Google Sheets...
                    </td>
                  </tr>
                ) : agentReports.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      No agent reports found.
                    </td>
                  </tr>
                ) : (
                  agentReports.map((agent) => (
                    <tr
                      key={agent.id}
                      className="border-t border-white/10 text-slate-300"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-white">{agent.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {agent.id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${statusBadgeClass(
                            agent.status
                          )}`}
                        >
                          {agent.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">{agent.checkIn}</td>
                      <td className="px-5 py-4">{agent.checkOut}</td>
                      <td className="px-5 py-4">{agent.leads}</td>
                      <td className="px-5 py-4">{agent.approved}</td>
                      <td className="px-5 py-4">
                        {formatPKR(agent.salary)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6 backdrop-blur-xl">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
                Top Agents
              </p>

              <h2 className="mt-2 text-xl font-black text-white">
                Today&apos;s Ranking
              </h2>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-500">
                  Loading rankings...
                </div>
              ) : topAgents.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-500">
                  No rankings available.
                </div>
              ) : (
                topAgents.map((agent) => (
                  <div
                    key={agent.rank}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-sm font-black text-cyan-300">
                        {agent.rank}
                      </div>

                      <div>
                        <p className="font-bold text-white">{agent.name}</p>
                        <p className="text-xs text-slate-500">
                          {agent.metric}
                        </p>
                      </div>
                    </div>

                    <Trophy size={18} className="text-yellow-300" />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-yellow-300/15 bg-yellow-300/[0.04] p-6 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-1 text-yellow-300" size={20} />

              <div>
                <h3 className="font-black text-white">
                  Reports connected to Sheets
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  This page now reads live Agents, Attendance, and Leads data.
                  Salary preview is currently base salary for present agents.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ManagerShell>
  );
}

function ReportCard({ title, value, subtitle, icon: Icon, tone }) {
  const tones = {
    emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-300",
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-300",
    yellow: "border-yellow-300/20 bg-yellow-300/10 text-yellow-300",
    purple: "border-purple-300/20 bg-purple-300/10 text-purple-300",
  };

  return (
    <div className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
          {title}
        </p>

        <div className={`rounded-2xl border p-3 ${tones[tone]}`}>
          <Icon size={22} />
        </div>
      </div>

      <h3 className="text-3xl font-black text-white">{value}</h3>

      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}