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
  RefreshCcw,
  CalendarPlus,
  Trash2,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";
import { sheetsPost } from "@/lib/sheetsApi";

function getTodayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeDate(value) {
  if (!value) return "";
  const raw = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
  const [holidayRows, setHolidayRows] = useState([]);

  const [holidayTitle, setHolidayTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [holidaySaving, setHolidaySaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadAttendance(showLoader = false) {
    try {
      if (showLoader) setLoading(true);
      setError("");

      const [attendanceResponse, agentsResponse, holidaysResponse] =
        await Promise.all([
          sheetsPost({ action: "getAttendance" }),
          sheetsPost({ action: "getAgents" }),
          sheetsPost({ action: "getHolidays" }),
        ]);

      setAttendanceRows(attendanceResponse?.data || []);
      setAgentRows(agentsResponse?.data || []);
      setHolidayRows(holidaysResponse?.data || []);
    } catch (error) {
      console.error("Attendance sheet read failed:", error);
      setError(error?.message || "Failed to load attendance data");
      setAttendanceRows([]);
      setAgentRows([]);
      setHolidayRows([]);
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

  const selectedHoliday = useMemo(() => {
    return (
      holidayRows.find((holiday) => normalizeDate(holiday.Date) === selectedDate) ||
      null
    );
  }, [holidayRows, selectedDate]);

  const records = useMemo(() => {
    const selectedRows = attendanceRows.filter(
      (row) => normalizeDate(row.Date) === selectedDate
    );

    return selectedRows.map((row, index) => {
      const loginAt = normalizeTime(row.LoginTime);
      const logoutAt = normalizeTime(row.LogoutTime);

      return {
        id: row.AgentID || "-",
        name: row.AgentName || "Agent",
        loginAt,
        logoutAt,
        status: normalizeStatus(row.Status, logoutAt),
        updatedAt: normalizeTime(row.UpdatedAt),
        rowKey: `${row.AgentID || "agent"}-${normalizeDate(row.Date)}-${
          row.LoginTime || "login"
        }-${index}`,
      };
    });
  }, [attendanceRows, selectedDate]);

  const present = records.filter((x) => x.status !== "Absent").length;
  const active = records.filter((x) => x.status === "Active").length;
  const onBreak = records.filter((x) => x.status === "Break").length;
  const washroom = records.filter((x) => x.status === "Washroom").length;
  const checkedOut = records.filter((x) => x.status === "Checked Out").length;

  const recentRecords = records
    .filter((item) => item.status !== "Absent")
    .slice(0, 8);

  async function handleAddHoliday(e) {
    e.preventDefault();

    try {
      setHolidaySaving(true);
      setError("");
      setSuccess("");

      const title = holidayTitle.trim() || "Company Holiday";

      const response = await sheetsPost({
        action: "addHoliday",
        date: selectedDate,
        title,
        type: "Holiday",
        addedBy: "Admin",
      });

      if (response?.success === false) {
        throw new Error(response.message || "Failed to add holiday");
      }

      setHolidayTitle("");
      setSuccess("Holiday added successfully.");
      await loadAttendance(false);
    } catch (error) {
      console.error("Holiday add failed:", error);
      setError(error?.message || "Failed to add holiday");
    } finally {
      setHolidaySaving(false);
    }
  }

  async function handleDeleteHoliday() {
    const confirmed = window.confirm(
      `Remove holiday from ${formatDateLabel(selectedDate)}?`
    );

    if (!confirmed) return;

    try {
      setHolidaySaving(true);
      setError("");
      setSuccess("");

      const response = await sheetsPost({
        action: "deleteHoliday",
        date: selectedDate,
      });

      if (response?.success === false) {
        throw new Error(response.message || "Failed to delete holiday");
      }

      setSuccess("Holiday removed successfully.");
      await loadAttendance(false);
    } catch (error) {
      console.error("Holiday delete failed:", error);
      setError(error?.message || "Failed to delete holiday");
    } finally {
      setHolidaySaving(false);
    }
  }

  return (
    <AdminShell>
      <div className="mb-5 rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03] px-8 py-6">
        <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-300">
          ATTENDANCE CONTROL CENTER
        </p>

        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-black text-white">Attendance</h1>

            <p className="mt-2 text-xs text-slate-500">
              Historical selected-date view. Holidays added here are excluded from payroll.
            </p>
          </div>

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

            <button
              onClick={() => loadAttendance(true)}
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-300 hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {(error || success) && (
        <div
          className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
            error
              ? "border-red-400/20 bg-red-400/10 text-red-300"
              : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          }`}
        >
          {error || success}
        </div>
      )}

      <div className="mb-5 rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
              Holiday Control
            </p>

            <h2 className="mt-2 text-xl font-black text-white">
              {selectedHoliday
                ? selectedHoliday.Title || "Holiday"
                : "Mark Selected Date As Holiday"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Selected date: {formatDateLabel(selectedDate)}
            </p>

            {selectedHoliday && (
              <div className="mt-3 inline-flex rounded-xl border border-yellow-300/20 bg-yellow-300/10 px-3 py-1.5 text-xs font-bold text-yellow-300">
                Holiday · {selectedHoliday.Type || "Holiday"} · Added by{" "}
                {selectedHoliday.AddedBy || "Admin"}
              </div>
            )}
          </div>

          {selectedHoliday ? (
            <button
              onClick={handleDeleteHoliday}
              disabled={holidaySaving}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={16} />
              {holidaySaving ? "Removing..." : "Remove Holiday"}
            </button>
          ) : (
            <form
              onSubmit={handleAddHoliday}
              className="grid w-full gap-3 md:grid-cols-[1fr_auto] xl:w-[520px]"
            >
              <input
                value={holidayTitle}
                onChange={(e) => setHolidayTitle(e.target.value)}
                placeholder="Holiday title e.g. Eid Holiday"
                className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/35"
              />

              <button
                type="submit"
                disabled={holidaySaving}
                className="flex items-center justify-center gap-2 rounded-xl border border-yellow-300/20 bg-yellow-300/10 px-4 py-2.5 text-sm font-bold text-yellow-300 transition hover:bg-yellow-300/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CalendarPlus size={16} />
                {holidaySaving ? "Adding..." : "Mark Holiday"}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Stat title="Present" value={loading ? "..." : present} icon={UserCheck} tone="emerald" />
        <Stat title="Active Now" value={loading ? "..." : active} icon={Clock3} tone="cyan" />
        <Stat title="On Break" value={loading ? "..." : onBreak} icon={Coffee} tone="yellow" />
        <Stat title="Washroom" value={loading ? "..." : washroom} icon={Bath} tone="purple" />
        <Stat title="Checked Out" value={loading ? "..." : checkedOut} icon={LogOut} tone="orange" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_0.8fr]">
        <div className="overflow-hidden rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
              Attendance Records
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-white/[0.03] text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-medium">Agent</th>
                  <th className="px-5 py-4 font-medium">Login ID</th>
                  <th className="px-5 py-4 font-medium">Login At</th>
                  <th className="px-5 py-4 font-medium">Logout At</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Updated</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-slate-500">
                      Loading attendance records...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-slate-500">
                      No records found for selected date.
                    </td>
                  </tr>
                ) : (
                  records.map((agent) => (
                    <tr key={agent.rowKey} className="text-slate-300">
                      <td className="px-5 py-4 font-bold text-white">{agent.name}</td>
                      <td className="px-5 py-4 text-cyan-300">{agent.id}</td>
                      <td className="px-5 py-4">{agent.loginAt}</td>
                      <td className="px-5 py-4">{agent.logoutAt}</td>
                      <td className="px-5 py-4">
                        <StatusPill status={agent.status} />
                      </td>
                      <td className="px-5 py-4 text-slate-500">{agent.updatedAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
                <div key={item.rowKey} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.id}</p>
                    </div>

                    <StatusPill status={item.status} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <p>
                      Login At: <span className="text-cyan-300">{item.loginAt}</span>
                    </p>

                    <p>
                      Logout At: <span className="text-cyan-300">{item.logoutAt}</span>
                    </p>

                    <p className="col-span-2">
                      Updated: <span className="text-cyan-300">{item.updatedAt}</span>
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
    "Auto Logged Out": "border-red-300/20 bg-red-300/10 text-red-300",
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