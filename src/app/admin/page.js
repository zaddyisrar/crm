"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Clock3,
  Activity,
  TrendingUp,
  Coffee,
  Bath,
  FileBarChart,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";
import { sheetsPost } from "@/lib/sheetsApi";

function makeDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayKey() {
  return makeDateKey(new Date());
}

function getCurrentMonthKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function normalizeDate(value) {
  if (!value) return "";

  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return makeDateKey(date);
  }

  return raw;
}

function normalizeTime(value) {
  if (!value) return "-";

  const raw = String(value).trim();
  if (!raw || raw === "-") return "-";

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return raw;
}

function parseDateTime(dateValue, timeValue) {
  const dateKey = normalizeDate(dateValue);
  const timeRaw = String(timeValue || "").trim();

  if (!dateKey || !timeRaw || timeRaw === "-") return null;

  const parsed = new Date(`${dateKey} ${timeRaw}`);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const timeDate = new Date(timeRaw);

  if (!Number.isNaN(timeDate.getTime())) {
    return new Date(
      Number(dateKey.slice(0, 4)),
      Number(dateKey.slice(5, 7)) - 1,
      Number(dateKey.slice(8, 10)),
      timeDate.getHours(),
      timeDate.getMinutes(),
      0
    );
  }

  return null;
}

function parseStamp(value) {
  if (!value) return null;

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) return date;

  return null;
}

function normalizeStatus(value, logoutTime) {
  const logout = normalizeTime(logoutTime);

  if (logout && logout !== "-") return "Checked Out";

  const status = String(value || "Absent").trim();

  if (!status || status === "-") return "Absent";

  return status;
}

function liveScreenMinutes(row) {
  if (!row) return 0;

  const savedScreen = Number(row.TotalScreenMinutes || 0);
  const status = String(row.Status || "").trim();

  if (status === "Checked Out") return savedScreen;

  const loginAt = parseDateTime(row.Date, row.LoginTime);
  if (!loginAt) return savedScreen;

  let endAt = new Date();

  if (status === "Auto Logged Out" && row.LastAutoLogout) {
    const autoAt = parseStamp(row.LastAutoLogout);
    if (autoAt) endAt = autoAt;
  }

  const totalMinutes = Math.max(
    0,
    Math.round((endAt.getTime() - loginAt.getTime()) / 60000)
  );

  const inactive = Number(row.TotalInactiveMinutes || 0);

  return Math.max(0, totalMinutes - inactive);
}

function minutesToHours(minutes) {
  const total = Number(minutes || 0);

  if (total <= 0) return "0h 0m";

  const hours = Math.floor(total / 60);
  const mins = total % 60;

  return `${hours}h ${mins}m`;
}

function getTodayRecordForAgent(rows, agentId, today) {
  const cleanAgentId = String(agentId || "").toUpperCase();

  const agentRows = rows.filter((row) => {
    return (
      String(row.AgentID || "").toUpperCase() === cleanAgentId &&
      normalizeDate(row.Date) === today
    );
  });

  if (agentRows.length === 0) return null;

  return agentRows[agentRows.length - 1];
}

export default function AdminPage() {
  const [agentRows, setAgentRows] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [leadRows, setLeadRows] = useState([]);

  const [nowTick, setNowTick] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSheetData(showLoader = false) {
    try {
      if (showLoader) setLoading(true);

      setError("");

      const [agentsResponse, attendanceResponse, leadsResponse] =
        await Promise.all([
          sheetsPost({ action: "getAgents" }),
          sheetsPost({ action: "getAttendance" }),
          sheetsPost({ action: "getLeads" }),
        ]);

      setAgentRows(agentsResponse?.data || []);
      setAttendanceRows(attendanceResponse?.data || []);
      setLeadRows(leadsResponse?.data || []);
    } catch (error) {
      console.error("Admin Google Sheets read failed:", error);
      setError(error?.message || "Failed to load admin dashboard data");
      setAgentRows([]);
      setAttendanceRows([]);
      setLeadRows([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    loadSheetData(true);

    const sheetInterval = setInterval(() => {
      loadSheetData(false);
    }, 15000);

    const liveTimer = setInterval(() => {
      setNowTick(Date.now());
    }, 30000);

    return () => {
      clearInterval(sheetInterval);
      clearInterval(liveTimer);
    };
  }, []);

  const today = getTodayKey();
  const monthKey = getCurrentMonthKey();

  const agentUsers = useMemo(() => {
    return agentRows.filter((user) => {
      const role = String(user.Role || "").toLowerCase();
      const status = String(user.Status || "Active").toLowerCase();

      return role === "agent" && status !== "inactive";
    });
  }, [agentRows]);

  const todayAttendanceRows = useMemo(() => {
    return attendanceRows.filter((row) => normalizeDate(row.Date) === today);
  }, [attendanceRows, today]);

  const monthlyLeads = useMemo(() => {
    return leadRows.filter((lead) =>
      normalizeDate(lead.Date).startsWith(monthKey)
    );
  }, [leadRows, monthKey]);

  const agentsData = useMemo(() => {
    return agentUsers.map((agent) => {
      const agentId = String(agent.AgentID || "").toUpperCase();

      const todayRecord = getTodayRecordForAgent(
        attendanceRows,
        agentId,
        today
      );

      const loginAt = todayRecord?.LoginTime || "";
      const logoutAt = todayRecord?.LogoutTime || "";

      const status = todayRecord
        ? normalizeStatus(todayRecord?.Status, logoutAt)
        : "Absent";

      const activeNow = status === "Active";
      const onBreak = status === "Break";
      const inWashroom = status === "Washroom";
      const autoLoggedOut = status === "Auto Logged Out";
      const checkedOut = status === "Checked Out";
      const presentToday = Boolean(todayRecord);

      const agentLeadsThisMonth = monthlyLeads.filter(
        (lead) => String(lead.AgentID || "").toUpperCase() === agentId
      );

      return {
        ...agent,
        latestDate: todayRecord?.Date || "",
        loginAt,
        logoutAt,
        status,
        activeNow,
        onBreak,
        inWashroom,
        autoLoggedOut,
        checkedOut,
        presentToday,
        screenMinutes: liveScreenMinutes(todayRecord),
        inactiveMinutes: Number(todayRecord?.TotalInactiveMinutes || 0),
        leadsThisMonth: agentLeadsThisMonth.length,
      };
    });
  }, [agentUsers, attendanceRows, monthlyLeads, today, nowTick]);

  const activeAgents = agentsData.filter((x) => x.activeNow).length;
  const breakAgents = agentsData.filter((x) => x.onBreak).length;
  const washroomAgents = agentsData.filter((x) => x.inWashroom).length;
  const autoLoggedOutAgents = agentsData.filter((x) => x.autoLoggedOut).length;
  const checkedOutAgents = agentsData.filter((x) => x.checkedOut).length;
  const presentAgents = agentsData.filter((x) => x.presentToday).length;
  const totalAgents = agentsData.length;

  const totalScreenMinutesToday = agentsData.reduce(
    (sum, agent) => sum + Number(agent.screenMinutes || 0),
    0
  );

  const totalInactiveMinutesToday = agentsData.reduce(
    (sum, agent) => sum + Number(agent.inactiveMinutes || 0),
    0
  );

  const attendanceRate =
    totalAgents > 0 ? Math.round((presentAgents / totalAgents) * 100) : 0;

  const liveOperations = useMemo(() => {
    return agentsData
      .filter((agent) => agent.presentToday)
      .slice(0, 10)
      .map((agent) => {
        const action =
          agent.status === "Break"
            ? "Currently on break"
            : agent.status === "Washroom"
            ? "Currently in washroom"
            : agent.status === "Auto Logged Out"
            ? "Auto logged out"
            : agent.status === "Checked Out"
            ? `Logout at ${normalizeTime(agent.logoutAt)}`
            : `Login at ${normalizeTime(agent.loginAt)}`;

        return {
          agent: agent.AgentName || agent.AgentID || "Agent",
          action,
          status: agent.status,
          date: normalizeDate(agent.latestDate),
          screen: minutesToHours(agent.screenMinutes),
          inactive: minutesToHours(agent.inactiveMinutes),
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
      title: "Leads This Month",
      value: loading ? "..." : monthlyLeads.length,
      note: monthKey,
      icon: FileBarChart,
      color: "text-cyan-300",
    },
    {
      title: "On Break",
      value: loading ? "..." : breakAgents,
      note: "Latest status",
      icon: Coffee,
      color: "text-yellow-300",
    },
    {
      title: "Washroom",
      value: loading ? "..." : washroomAgents,
      note: "Latest status",
      icon: Bath,
      color: "text-purple-300",
    },
    {
      title: "Attendance",
      value: loading ? "..." : `${attendanceRate}%`,
      note: loading ? "Loading..." : `${presentAgents}/${totalAgents} today`,
      icon: Clock3,
      color: "text-cyan-300",
    },
  ];

  const summary = [
    {
      title: "Screen Time Today",
      value: loading ? "..." : minutesToHours(totalScreenMinutesToday),
    },
    {
      title: "Inactive Time Today",
      value: loading ? "..." : minutesToHours(totalInactiveMinutesToday),
    },
    {
      title: "Present Today",
      value: loading ? "..." : presentAgents,
    },
    {
      title: "Active Agents",
      value: loading ? "..." : activeAgents,
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
      title: "Auto Logged Out",
      value: loading ? "..." : autoLoggedOutAgents,
    },
    {
      title: "Checked Out",
      value: loading ? "..." : checkedOutAgents,
    },
  ];

  return (
    <AdminShell>
      {error && (
        <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mb-5 rounded-[1.4rem] border border-cyan-300/10 bg-white/[0.03] px-6 py-5">
        <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-300">
          ADMIN CONTROL CENTER
        </p>

        <h1 className="mt-2 text-3xl font-black text-white">
          Welcome Back, Admin
        </h1>

        <p className="mt-1 text-xs text-slate-500">
          Showing today&apos;s live attendance, screen time, inactive time, and
          monthly leads.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-[1.4rem] border border-cyan-300/10 bg-white/[0.03] p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className={`rounded-xl bg-white/[0.04] p-2.5 ${card.color}`}>
                  <Icon size={16} />
                </div>

                <p className="text-xs text-slate-500">{card.note}</p>
              </div>

              <h2 className="text-2xl font-black leading-none text-white">
                {card.value}
              </h2>

              <p className="mt-2 text-xs text-slate-400">{card.title}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[1.4rem] border border-cyan-300/10 bg-white/[0.03] p-4">
          <div className="mb-4 flex items-center gap-3">
            <Activity className="text-cyan-300" size={17} />
            <h2 className="text-base font-bold text-white">Live Operations</h2>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="rounded-xl border border-white/5 bg-black/20 px-4 py-7 text-center text-sm text-slate-500">
                Loading live operations...
              </div>
            ) : liveOperations.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-black/20 px-4 py-7 text-center text-sm text-slate-500">
                No agent activity found today.
              </div>
            ) : (
              liveOperations.map((x, index) => (
                <div
                  key={`${x.agent}-${x.status}-${index}`}
                  className="flex flex-col gap-3 rounded-xl border border-white/5 bg-black/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-white">{x.agent}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {x.action} {x.date ? `· ${x.date}` : ""}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      Screen {x.screen} · Inactive {x.inactive}
                    </p>
                  </div>

                  <StatusPill status={x.status} />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[1.4rem] border border-cyan-300/10 bg-white/[0.03] p-4">
          <div className="mb-4 flex items-center gap-3">
            <TrendingUp className="text-cyan-300" size={17} />
            <h2 className="text-base font-bold text-white">Today Summary</h2>
          </div>

          <div className="space-y-2.5">
            {summary.map((x) => (
              <div
                key={x.title}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-4 py-3"
              >
                <span className="text-sm text-slate-400">{x.title}</span>
                <span className="text-lg font-black text-white">{x.value}</span>
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
    "Auto Logged Out": "border-red-300/20 bg-red-300/10 text-red-300",
    "Checked Out": "border-orange-300/20 bg-orange-300/10 text-orange-300",
    Absent: "border-red-300/20 bg-red-300/10 text-red-300",
  };

  return (
    <span
      className={`w-fit rounded-lg border px-3 py-1 text-xs font-bold ${
        styles[status] || styles.Absent
      }`}
    >
      {status}
    </span>
  );
}