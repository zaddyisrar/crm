"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Clock3,
  UserCheck,
  Coffee,
  Bath,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";
import { sheetsPost } from "@/lib/sheetsApi";

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function formatDateLabel(dateKey) {
  return new Date(dateKey + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function moveDate(dateKey, days) {
  const date = new Date(dateKey + "T00:00:00");
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function normalizeDate(value) {
  if (!value) return "";

  const stringValue = String(value);

  if (stringValue.includes("T")) {
    return stringValue.split("T")[0];
  }

  return stringValue.trim();
}

function normalizeStatus(value, logoutTime) {
  if (logoutTime && logoutTime !== "-") return "Checked Out";

  const status = String(value || "Active").trim();

  if (!status || status === "-") return "Active";

  return status;
}

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [agentRows, setAgentRows] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadAttendance(showLoader = false) {
    try {
      if (showLoader) setLoading(true);

      const attendanceResponse = await sheetsPost({
        action: "getAttendance",
      });

      const agentsResponse = await sheetsPost({
        action: "getAgents",
      });

      setAttendanceRows(attendanceResponse.data || []);
      setAgentRows(agentsResponse.data || []);
    } catch (error) {
      console.error("Attendance sheet read failed:", error);
      setAttendanceRows([]);
      setAgentRows([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    loadAttendance(true);

    const interval = setInterval(() => {
      loadAttendance(false);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const selectedRows = attendanceRows.filter(
      (row) => normalizeDate(row.Date) === selectedDate
    );

    const agentRecords = agentRows
      .filter(
        (user) => String(user.Role || "").toLowerCase() === "agent"
      )
      .map((agent) => {
        const agentId = String(agent.AgentID || "").toUpperCase();

        const agentAttendanceRows = selectedRows.filter(
          (row) => String(row.AgentID || "").toUpperCase() === agentId
        );

        const latestRecord =
          agentAttendanceRows[agentAttendanceRows.length - 1];

        const loginAt = latestRecord?.LoginTime || "-";
        const logoutAt = latestRecord?.LogoutTime || "-";

        const status = latestRecord
          ? normalizeStatus(latestRecord?.Status, logoutAt)
          : "Absent";

        return {
          id: agent.AgentID || "-",
          name: agent.AgentName || "Agent",
          loginAt,
          logoutAt,
          status,
        };
      });

    setRecords(agentRecords);
  }, [attendanceRows, agentRows, selectedDate]);

  const present = records.filter((x) => x.status !== "Absent").length;
  const active = records.filter((x) => x.status === "Active").length;
  const onBreak = records.filter((x) => x.status === "Break").length;
  const washroom = records.filter((x) => x.status === "Washroom").length;
  const checkedOut = records.filter((x) => x.status === "Checked Out").length;

  const recentRecords = useMemo(() => {
    return records.filter((item) => item.status !== "Absent").slice(0, 5);
  }, [records]);

  return (
    <AdminShell>
      <div className="mb-5 rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03] px-8 py-6">
        <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-300">
          ATTENDANCE CONTROL CENTER
        </p>

        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-4xl font-black text-white">Attendance</h1>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setSelectedDate((date) => moveDate(date, -1))}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold text-slate-300 hover:border-cyan-300/25 hover:text-cyan-300"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="flex items-center gap-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/10 px-5 py-3 text-sm font-black text-cyan-300">
              <CalendarDays size={17} />
              {formatDateLabel(selectedDate)}
            </div>

            <button
              onClick={() => setSelectedDate((date) => moveDate(date, 1))}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold text-slate-300 hover:border-cyan-300/25 hover:text-cyan-300"
            >
              Next
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => setSelectedDate(getTodayKey())}
              className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-bold text-emerald-300 hover:bg-emerald-300/15"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Stat
          title="Present"
          value={loading ? "..." : present}
          icon={UserCheck}
          tone="emerald"
        />
        <Stat
          title="Active Now"
          value={loading ? "..." : active}
          icon={Clock3}
          tone="cyan"
        />
        <Stat
          title="On Break"
          value={loading ? "..." : onBreak}
          icon={Coffee}
          tone="yellow"
        />
        <Stat
          title="Washroom"
          value={loading ? "..." : washroom}
          icon={Bath}
          tone="purple"
        />
        <Stat
          title="Checked Out"
          value={loading ? "..." : checkedOut}
          icon={LogOut}
          tone="orange"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_0.8fr]">
        <div className="overflow-hidden rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
              Attendance Records
            </p>
          </div>

          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-white/[0.03] text-slate-400">
              <tr>
                <th className="px-5 py-4 font-medium">Agent</th>
                <th className="px-5 py-4 font-medium">Login ID</th>
                <th className="px-5 py-4 font-medium">Login At</th>
                <th className="px-5 py-4 font-medium">Logout At</th>
                <th className="px-5 py-4 font-medium">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    Loading attendance records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    No agents found.
                  </td>
                </tr>
              ) : (
                records.map((agent) => (
                  <tr key={agent.id} className="text-slate-300">
                    <td className="px-5 py-4 font-bold text-white">
                      {agent.name}
                    </td>
                    <td className="px-5 py-4 text-cyan-300">{agent.id}</td>
                    <td className="px-5 py-4">{agent.loginAt}</td>
                    <td className="px-5 py-4">{agent.logoutAt}</td>
                    <td className="px-5 py-4">
                      <StatusPill status={agent.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03] p-5">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
              Recent Records
            </p>

            <h2 className="mt-2 text-xl font-black text-white">
              Selected Date Activity
            </h2>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="rounded-xl border border-white/5 bg-black/20 px-4 py-8 text-center text-sm text-slate-500">
                Loading recent records...
              </div>
            ) : recentRecords.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-black/20 px-4 py-8 text-center text-sm text-slate-500">
                No records found for selected date.
              </div>
            ) : (
              recentRecords.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.id}</p>
                    </div>

                    <StatusPill status={item.status} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <p>
                      Login At:{" "}
                      <span className="text-cyan-300">{item.loginAt}</span>
                    </p>

                    <p>
                      Logout At:{" "}
                      <span className="text-cyan-300">{item.logoutAt}</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function Stat({ title, value, icon: Icon, tone }) {
  const tones = {
    emerald: "text-emerald-300 bg-emerald-300/10",
    cyan: "text-cyan-300 bg-cyan-300/10",
    yellow: "text-yellow-300 bg-yellow-300/10",
    purple: "text-purple-300 bg-purple-300/10",
    orange: "text-orange-300 bg-orange-300/10",
  };

  return (
    <div className="rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03] p-5">
      <div className={`mb-4 w-fit rounded-xl p-3 ${tones[tone]}`}>
        <Icon size={18} />
      </div>

      <h2 className="text-2xl font-black text-white">{value}</h2>
      <p className="mt-1 text-sm text-slate-400">{title}</p>
    </div>
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