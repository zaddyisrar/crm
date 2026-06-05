"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Clock3,
  Activity,
  TrendingUp,
  Coffee,
  Bath,
  ShieldCheck,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";
import { sheetsPost } from "@/lib/sheetsApi";

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function normalizeDate(value) {
  if (!value) return "";

  const stringValue = String(value);

  if (stringValue.includes("T")) {
    return stringValue.split("T")[0];
  }

  return stringValue.trim();
}

function normalizeStatus(value) {
  return String(value || "Absent").trim();
}

export default function AdminPage() {
  const [agentRows, setAgentRows] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [leadRows, setLeadRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadSheetData(showLoader = false) {
    try {
      if (showLoader) setLoading(true);

      const agentsResponse = await sheetsPost({ action: "getAgents" });
      const attendanceResponse = await sheetsPost({ action: "getAttendance" });
      const leadsResponse = await sheetsPost({ action: "getLeads" });

      setAgentRows(agentsResponse.data || []);
      setAttendanceRows(attendanceResponse.data || []);
      setLeadRows(leadsResponse.data || []);
    } catch (error) {
      console.error("Admin Google Sheets read failed:", error);
      setAgentRows([]);
      setAttendanceRows([]);
      setLeadRows([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    loadSheetData(true);

    const interval = setInterval(() => {
      loadSheetData(false);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const today = getTodayKey();

  const today = getTodayKey();

const latestAttendanceDate =
  attendanceRows
    .map((row) => normalizeDate(row.Date))
    .filter(Boolean)
    .sort()
    .at(-1) || today;

const latestLeadDate =
  leadRows
    .map((row) => normalizeDate(row.Date))
    .filter(Boolean)
    .sort()
    .at(-1) || today;

const dashboardAttendanceDate = latestAttendanceDate;
const dashboardLeadDate = latestLeadDate;

const todayAttendance = attendanceRows.filter(
  (row) => normalizeDate(row.Date) === dashboardAttendanceDate
);

const todayLeadsRows = leadRows.filter(
  (row) => normalizeDate(row.Date) === dashboardLeadDate
);

  const agentsData = agentUsers.map((agent) => {
    const agentId = String(agent.AgentID || "").toUpperCase();

    const records = todayAttendance.filter(
      (row) => String(row.AgentID || "").toUpperCase() === agentId
    );

    const latestRecord = records[records.length - 1];

    const presentToday = Boolean(latestRecord);
    const loginAt = latestRecord?.LoginTime || "";
    const logoutAt = latestRecord?.LogoutTime || "";

    const status = presentToday
      ? normalizeStatus(latestRecord?.Status)
      : "Absent";

    const activeNow = status === "Active";
    const onBreak = status === "Break";
    const inWashroom = status === "Washroom";
    const checkedOut = status === "Checked Out";

    const todayLeads = todayLeadsRows.filter(
      (lead) => String(lead.AgentID || "").toUpperCase() === agentId
    );

    return {
      ...agent,
      loginAt,
      logoutAt,
      status,
      presentToday,
      activeNow,
      onBreak,
      inWashroom,
      checkedOut,
      todayLeads,
    };
  });

  const activeAgents = agentsData.filter((x) => x.activeNow).length;
  const breakAgents = agentsData.filter((x) => x.onBreak).length;
  const washroomAgents = agentsData.filter((x) => x.inWashroom).length;
  const checkedOutAgents = agentsData.filter((x) => x.checkedOut).length;
  const presentAgents = agentsData.filter((x) => x.presentToday).length;
  const totalAgents = agentsData.length;
  const todayLeads = todayLeadsRows.length;

  const activeManagersToday = managerUsers.length;

  const attendanceRate =
    totalAgents > 0 ? Math.round((presentAgents / totalAgents) * 100) : 0;

  const liveOperations = useMemo(() => {
    return agentsData
      .filter((agent) => agent.presentToday)
      .slice(0, 8)
      .map((agent) => {
        const action =
          agent.status === "Break"
            ? "Currently on break"
            : agent.status === "Washroom"
            ? "Currently in washroom"
            : agent.status === "Checked Out"
            ? `Logout at ${agent.logoutAt || "-"}`
            : `Login at ${agent.loginAt || "-"}`;

        return {
          agent: agent.AgentName || agent.AgentID || "Agent",
          action,
          status: agent.status,
        };
      });
  }, [agentsData]);

  const stats = [
    {
      title: "Active Agents",
      value: loading ? "..." : activeAgents,
      note: "Working now",
      icon: Users,
      color: "text-emerald-300",
    },
    {
      title: "Active Manager Today",
      value: loading ? "..." : activeManagersToday,
      note: "Manager access",
      icon: ShieldCheck,
      color: "text-cyan-300",
    },
    {
      title: "On Break",
      value: loading ? "..." : breakAgents,
      note: "Break status",
      icon: Coffee,
      color: "text-yellow-300",
    },
    {
      title: "Washroom",
      value: loading ? "..." : washroomAgents,
      note: "Away temporarily",
      icon: Bath,
      color: "text-purple-300",
    },
    {
      title: "Attendance",
      value: loading ? "..." : `${attendanceRate}%`,
      note: loading ? "Loading..." : `${presentAgents}/${totalAgents} present`,
      icon: Clock3,
      color: "text-cyan-300",
    },
  ];

  const summary = [
    {
      title: "Leads Added Today",
      value: loading ? "..." : todayLeads,
    },
    {
      title: "Present Agents",
      value: loading ? "..." : presentAgents,
    },
    {
      title: "Active Agents",
      value: loading ? "..." : activeAgents,
    },
    {
      title: "Active Manager Today",
      value: loading ? "..." : activeManagersToday,
    },
    {
      title: "On Break",
      value: loading ? "..." : breakAgents,
    },
    {
      title: "Washroom",
      value: loading ? "..." : washroomAgents,
    },
    {
      title: "Checked Out",
      value: loading ? "..." : checkedOutAgents,
    },
  ];

  return (
    <AdminShell>
      <div className="mb-5 rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03] px-8 py-6">
        <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-300">
          ADMIN CONTROL CENTER
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Welcome Back, Admin
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03] p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={`rounded-xl bg-white/[0.04] p-3 ${card.color}`}>
                  <Icon size={17} />
                </div>

                <p className="text-xs text-slate-500">{card.note}</p>
              </div>

              <h2 className="text-2xl font-black text-white">{card.value}</h2>
              <p className="mt-1 text-sm text-slate-400">{card.title}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03] p-5">
          <div className="mb-5 flex items-center gap-3">
            <Activity className="text-cyan-300" size={18} />
            <h2 className="text-lg font-bold text-white">Live Operations</h2>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="rounded-xl border border-white/5 bg-black/20 px-4 py-8 text-center text-sm text-slate-500">
                Loading live operations...
              </div>
            ) : liveOperations.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-black/20 px-4 py-8 text-center text-sm text-slate-500">
                No agent activity today.
              </div>
            ) : (
              liveOperations.map((x, index) => (
                <div
                  key={`${x.agent}-${x.status}-${index}`}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-4 py-4"
                >
                  <div>
                    <p className="font-semibold text-white">{x.agent}</p>
                    <p className="mt-1 text-sm text-slate-500">{x.action}</p>
                  </div>

                  <StatusPill status={x.status} />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03] p-5">
          <div className="mb-5 flex items-center gap-3">
            <TrendingUp className="text-cyan-300" size={18} />
            <h2 className="text-lg font-bold text-white">Today Summary</h2>
          </div>

          <div className="space-y-3">
            {summary.map((x) => (
              <div
                key={x.title}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-4 py-4"
              >
                <span className="text-slate-400">{x.title}</span>
                <span className="text-xl font-black text-white">{x.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function StatusPill({ status }) {
  const styles = {
    Active: "border-emerald-300/20 bg-emerald-300/10 text-emerald-300",
    Break: "border-yellow-300/20 bg-yellow-300/10 text-yellow-300",
    Washroom: "border-purple-300/20 bg-purple-300/10 text-purple-300",
    "Checked Out": "border-orange-300/20 bg-orange-300/10 text-orange-300",
    Absent: "border-red-300/20 bg-red-300/10 text-red-300",
  };

  return (
    <span
      className={`rounded-lg border px-3 py-1 text-xs ${
        styles[status] || styles.Absent
      }`}
    >
      {status}
    </span>
  );
}