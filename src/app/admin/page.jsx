"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Building2,
  BriefcaseBusiness,
  Clock3,
  Activity,
  TrendingUp,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";
import { users } from "@/data/users";
import { sheetsGet } from "@/lib/sheetsApi";

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function normalizeDate(value) {
  if (!value) return "";

  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  const stringValue = String(value);

  if (stringValue.includes("T")) {
    return stringValue.split("T")[0];
  }

  return stringValue;
}

export default function AdminPage() {
  const [adminName, setAdminName] = useState("Admin");
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [leadRows, setLeadRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const name = localStorage.getItem("crmUserName");
    const id = localStorage.getItem("crmUserId");

    setAdminName(name || id || "Admin");

    async function loadSheetData() {
      try {
        const attendanceResponse = await sheetsGet("getAttendance");
        const leadsResponse = await sheetsGet("getLeads");

        setAttendanceRows(attendanceResponse.data || []);
        setLeadRows(leadsResponse.data || []);
      } catch (error) {
        console.error("Admin Google Sheets read failed:", error);
        setAttendanceRows([]);
        setLeadRows([]);
      } finally {
        setLoading(false);
      }
    }

    loadSheetData();
  }, []);

  const today = getTodayKey();

  const agentUsers = users.filter((user) => user.role === "agent");

  const todayAttendance = attendanceRows.filter(
    (row) => normalizeDate(row.Date) === today
  );

  const todayLeadsRows = leadRows.filter(
    (row) => normalizeDate(row.Date) === today
  );

  const agentsData = agentUsers.map((agent) => {
    const records = todayAttendance.filter(
      (row) => String(row.AgentID).toUpperCase() === agent.id.toUpperCase()
    );

    const latestRecord = records[records.length - 1];

    const presentToday = Boolean(latestRecord);
    const checkedOutToday = Boolean(latestRecord?.CheckOut);
    const activeNow = presentToday && !checkedOutToday;

    const todayLeads = todayLeadsRows.filter(
      (lead) => String(lead.AgentID).toUpperCase() === agent.id.toUpperCase()
    );

    return {
      ...agent,
      checkIn: latestRecord?.CheckIn || "",
      checkOut: latestRecord?.CheckOut || "",
      status: latestRecord?.Status || "Absent",
      presentToday,
      activeNow,
      todayLeads,
    };
  });

  const availableClients = 16;

  const activeAgents = agentsData.filter((x) => x.activeNow).length;
  const presentAgents = agentsData.filter((x) => x.presentToday).length;
  const totalAgents = agentsData.length;
  const todayLeads = todayLeadsRows.length;

  const attendanceRate =
    totalAgents > 0 ? Math.round((presentAgents / totalAgents) * 100) : 0;

  const liveOperations = useMemo(() => {
    return agentsData
      .filter((agent) => agent.presentToday)
      .slice(0, 5)
      .map((agent) => ({
        agent: agent.name,
        action: agent.activeNow
          ? `Checked in at ${agent.checkIn}`
          : `Checked out at ${agent.checkOut || "-"}`,
        status: agent.activeNow ? "Online" : "Checked out",
      }));
  }, [agentsData]);

  const stats = [
    {
      title: "Active Agents",
      value: loading ? "..." : activeAgents,
      note: "Online now",
      icon: Users,
      color: "text-cyan-300",
    },
    {
      title: "Available Clients",
      value: availableClients,
      note: "Total clients",
      icon: Building2,
      color: "text-green-300",
    },
    {
      title: "Working Clients",
      value: loading ? "..." : activeAgents,
      note: "Currently active",
      icon: BriefcaseBusiness,
      color: "text-yellow-300",
    },
    {
      title: "Attendance",
      value: loading ? "..." : `${attendanceRate}%`,
      note: loading ? "Loading..." : `${presentAgents}/${totalAgents} present`,
      icon: Clock3,
      color: "text-purple-300",
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
      title: "Available Clients",
      value: availableClients,
    },
  ];

  return (
    <AdminShell>
      <div className="mb-5 rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03] px-8 py-6">
        <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-300">
          ADMIN CONTROL CENTER
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Welcome {adminName}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Showing today&apos;s attendance and saved lead activity from Google
          Sheets.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
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
              liveOperations.map((x) => (
                <div
                  key={x.agent}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-4 py-4"
                >
                  <div>
                    <p className="font-semibold text-white">{x.agent}</p>
                    <p className="mt-1 text-sm text-slate-500">{x.action}</p>
                  </div>

                  <span className="text-xs text-cyan-300">{x.status}</span>
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