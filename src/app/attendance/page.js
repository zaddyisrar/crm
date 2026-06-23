"use client";

import PageShell from "@/components/crm/PageShell";
import { sheetsPost } from "@/lib/sheetsApi";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Clock3,
  TimerOff,
  UserCheck,
  XCircle,
} from "lucide-react";

const LATE_LIMIT_HOUR = 19;
const LATE_LIMIT_MINUTE = 10;

function getTodayKey() {
  const date = new Date();
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

function parseDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue || timeValue === "-") return null;

  const date = normalizeDate(dateValue);
  const time = normalizeTime(timeValue);
  const parsed = new Date(`${date} ${time}`);

  if (!Number.isNaN(parsed.getTime())) return parsed;

  return null;
}

function parseTimeToMinutes(value) {
  const time = normalizeTime(value);
  if (!time || time === "-") return null;

  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridian = match[3]?.toUpperCase();

  if (meridian === "PM" && hour !== 12) hour += 12;
  if (meridian === "AM" && hour === 12) hour = 0;

  return hour * 60 + minute;
}

function formatMinutes(value) {
  const minutes = Number(value || 0);
  if (!minutes || minutes < 0) return "0m";

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (!hrs) return `${mins}m`;
  return `${hrs}h ${mins}m`;
}

function getLiveScreenMinutes(attendance) {
  if (!attendance) return 0;

  const savedScreen = Number(attendance.TotalScreenMinutes || 0);
  const inactive = Number(attendance.TotalInactiveMinutes || 0);
  const status = attendance.Status || "Active";

  if (status === "Checked Out") return savedScreen;

  const loginDateTime = parseDateTime(attendance.Date, attendance.LoginTime);
  if (!loginDateTime) return savedScreen;

  const diff = Math.max(0, Date.now() - loginDateTime.getTime());
  const totalMinutes = Math.floor(diff / 60000);

  return Math.max(0, totalMinutes - inactive);
}

function getMonthKey(dateKey = getTodayKey()) {
  return dateKey.slice(0, 7);
}

function getMonthDays(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const totalDays = new Date(year, month, 0).getDate();

  return Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1;
    const date = new Date(year, month - 1, day);
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    return {
      day,
      date,
      dateKey,
      weekday: date.getDay(),
    };
  });
}

function isWeekend(dayInfo) {
  return dayInfo.weekday === 0 || dayInfo.weekday === 6;
}

function isLate(loginTime) {
  const minutes = parseTimeToMinutes(loginTime);
  if (minutes === null) return false;

  const lateLimit = LATE_LIMIT_HOUR * 60 + LATE_LIMIT_MINUTE;
  return minutes > lateLimit;
}

function getDayStatus(dayInfo, attendanceRow) {
  const today = getTodayKey();

  if (isWeekend(dayInfo)) return "Off";
  if (dayInfo.dateKey > today) return "Upcoming";
  if (!attendanceRow) return "Absent";
  if (isLate(attendanceRow.LoginTime)) return "Late";

  return "Present";
}

function pickLatestRowsByDate(rows) {
  const map = new Map();

  rows.forEach((row) => {
    const date = normalizeDate(row.Date);
    if (!date) return;
    map.set(date, row);
  });

  return map;
}

export default function AttendancePage() {
  const [agentId, setAgentId] = useState("");
  const [agentName, setAgentName] = useState("Agent");
  const [currentStatus, setCurrentStatus] = useState("Active");
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  const today = getTodayKey();
  const monthKey = getMonthKey(today);

  async function loadAttendance(userId = agentId) {
    if (!userId) return;

    try {
      setLoading(true);

      const response = await sheetsPost({ action: "getAttendance" });
      const rows = response.data || [];

      const agentRows = rows.filter(
        (row) =>
          String(row.AgentID || "").toUpperCase() ===
          String(userId || "").toUpperCase()
      );

      setAttendanceRows(agentRows);

      const latestRow = agentRows[agentRows.length - 1] || null;
      if (latestRow?.Status) {
        setCurrentStatus(latestRow.Status);
        localStorage.setItem(`crmCurrentStatus:${userId}`, latestRow.Status);
      }
    } catch (error) {
      console.error("Agent attendance read failed:", error);
      setAttendanceRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const userId = localStorage.getItem("crmUserId");
    const userName = localStorage.getItem("crmUserName");

    if (!userId) return;

    setAgentId(userId);
    setAgentName(userName || "Agent");

    const savedStatus =
      localStorage.getItem(`crmCurrentStatus:${userId}`) || "Active";

    setCurrentStatus(savedStatus);

    function syncStatusFromStorage() {
      const nextStatus =
        localStorage.getItem(`crmCurrentStatus:${userId}`) || "Active";

      setCurrentStatus(nextStatus);
    }

    window.addEventListener("crm-status-change", syncStatusFromStorage);

    loadAttendance(userId);

    const refreshInterval = setInterval(() => {
      loadAttendance(userId);
    }, 10000);

    const liveInterval = setInterval(() => {
      setTick((value) => value + 1);
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(liveInterval);
      window.removeEventListener("crm-status-change", syncStatusFromStorage);
    };
  }, []);

  const monthlyRows = useMemo(() => {
    return attendanceRows.filter((row) =>
      normalizeDate(row.Date).startsWith(monthKey)
    );
  }, [attendanceRows, monthKey]);

  const rowsByDate = useMemo(() => {
    return pickLatestRowsByDate(monthlyRows);
  }, [monthlyRows]);

  const monthDays = useMemo(() => {
    return getMonthDays(monthKey);
  }, [monthKey]);

  const todayRow = rowsByDate.get(today) || null;

  const todayStatus = todayRow?.Status || currentStatus || "Active";
  const checkIn = normalizeTime(todayRow?.LoginTime);
  const workHours = formatMinutes(getLiveScreenMinutes(todayRow));

  const report = useMemo(() => {
    let present = 0;
    let late = 0;
    let absent = 0;
    let off = 0;
    let autoLogouts = 0;
    let totalScreen = 0;
    let totalInactive = 0;

    monthDays.forEach((dayInfo) => {
      const row = rowsByDate.get(dayInfo.dateKey);
      const status = getDayStatus(dayInfo, row);

      if (status === "Present") present += 1;
      if (status === "Late") late += 1;
      if (status === "Absent") absent += 1;
      if (status === "Off") off += 1;
      if (row?.LastAutoLogout) autoLogouts += 1;

      if (normalizeDate(row?.Date) === today) {
        totalScreen += getLiveScreenMinutes(row);
      } else {
        totalScreen += Number(row?.TotalScreenMinutes || 0);
      }

      totalInactive += Number(row?.TotalInactiveMinutes || 0);
    });

    return {
      present,
      late,
      absent,
      off,
      autoLogouts,
      totalScreen,
      totalInactive,
    };
  }, [monthDays, rowsByDate, today, tick]);

  return (
    <PageShell title="Attendance" subtitle={`Monthly report for ${agentName}`}>
      <div className="origin-top-left scale-[0.9] w-[111.11%]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
              Agent Attendance
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              {agentName}
            </h2>
          </div>

          <div className="rounded-2xl border border-cyan-300/15 bg-[#071018]/80 px-4 py-2 text-sm font-bold text-slate-300">
            Agent ID: <span className="text-cyan-300">{agentId || "-"}</span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <StatBox
            title="Status"
            value={todayStatus}
            sub="Live current state"
            icon={UserCheck}
            tone={
              todayStatus === "Checked Out" || todayStatus === "Auto Logged Out"
                ? "red"
                : todayStatus === "Break"
                ? "yellow"
                : todayStatus === "Washroom"
                ? "purple"
                : todayStatus === "In Meeting"
                ? "blue"
                : "emerald"
            }
          />

          <StatBox
            title="Check In"
            value={checkIn}
            sub="From Google Sheets"
            icon={Clock3}
            tone="cyan"
          />

          <StatBox
            title="Work Hours"
            value={workHours}
            sub="Live screen time"
            icon={CalendarClock}
            tone="yellow"
          />
        </div>

        <section className="mt-4 rounded-[2rem] border border-cyan-300/15 bg-[#071018]/80 p-5 backdrop-blur-xl">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
                Monthly Attendance Report
              </p>

              <h2 className="mt-2 text-xl font-black text-white">
                {monthKey}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Saturday and Sunday are counted as off days. Late starts after 7:10 PM.
              </p>
            </div>

            <button
              onClick={() => loadAttendance(agentId)}
              disabled={loading}
              className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-300/15 disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <MiniReportCard title="Present" value={report.present} icon={CalendarCheck} tone="emerald" />
            <MiniReportCard title="Late" value={report.late} icon={AlertTriangle} tone="yellow" />
            <MiniReportCard title="Absent" value={report.absent} icon={XCircle} tone="red" />
            <MiniReportCard title="Off" value={report.off} icon={CalendarDays} tone="slate" />
            <MiniReportCard title="Screen Time" value={formatMinutes(report.totalScreen)} icon={Activity} tone="cyan" />
            <MiniReportCard title="Inactive" value={formatMinutes(report.totalInactive)} icon={TimerOff} tone="purple" />
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-7 bg-white/[0.04] text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="border-r border-white/10 px-3 py-3 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {Array.from({ length: monthDays[0]?.weekday || 0 }).map((_, index) => (
                <div key={`blank-${index}`} className="min-h-[86px] border-r border-t border-white/10 bg-black/10 last:border-r-0" />
              ))}

              {monthDays.map((dayInfo) => {
                const row = rowsByDate.get(dayInfo.dateKey);
                const dayStatus = getDayStatus(dayInfo, row);
                const style = statusStyle(dayStatus);

                const dayWorkMinutes =
                  dayInfo.dateKey === today
                    ? getLiveScreenMinutes(row)
                    : Number(row?.TotalScreenMinutes || 0);

                return (
                  <div
                    key={dayInfo.dateKey}
                    className="min-h-[86px] border-r border-t border-white/10 bg-black/20 p-3 last:border-r-0"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-sm font-black text-white">
                        {String(dayInfo.day).padStart(2, "0")}
                      </span>

                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${style.badge}`}>
                        {dayStatus}
                      </span>
                    </div>

                    <div className="space-y-1 text-[10px] text-slate-500">
                      <p>
                        In: <span className="text-slate-300">{normalizeTime(row?.LoginTime)}</span>
                      </p>
                      <p>
                        Out: <span className="text-slate-300">{normalizeTime(row?.LogoutTime)}</span>
                      </p>
                      <p>
                        Work: <span className="text-cyan-300">{formatMinutes(dayWorkMinutes)}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
            <Legend label="Present" tone="emerald" />
            <Legend label="Late" tone="yellow" />
            <Legend label="Absent" tone="red" />
            <Legend label="Off" tone="slate" />
            <Legend label="Upcoming" tone="cyan" />
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function statusStyle(status) {
  const styles = {
    Present: {
      badge: "border-emerald-300/20 bg-emerald-300/10 text-emerald-300",
    },
    Late: {
      badge: "border-yellow-300/20 bg-yellow-300/10 text-yellow-300",
    },
    Absent: {
      badge: "border-red-300/20 bg-red-300/10 text-red-300",
    },
    Off: {
      badge: "border-slate-300/20 bg-slate-300/10 text-slate-300",
    },
    Upcoming: {
      badge: "border-cyan-300/20 bg-cyan-300/10 text-cyan-300",
    },
  };

  return styles[status] || styles.Upcoming;
}

function StatBox({ title, value, sub, icon: Icon, tone }) {
  const colors = {
    emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-300",
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-300",
    yellow: "border-yellow-300/20 bg-yellow-300/10 text-yellow-300",
    red: "border-red-300/20 bg-red-300/10 text-red-300",
    purple: "border-purple-300/20 bg-purple-300/10 text-purple-300",
    blue: "border-blue-300/20 bg-blue-300/10 text-blue-300",
  };

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
          {title}
        </p>

        <div className={`rounded-2xl border p-3 ${colors[tone]}`}>
          <Icon size={20} />
        </div>
      </div>

      <h3 className="text-3xl font-black text-white">{value}</h3>
      <p className="mt-1 text-sm text-slate-500">{sub}</p>
    </div>
  );
}

function MiniReportCard({ title, value, icon: Icon, tone }) {
  const colors = {
    emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-300",
    yellow: "border-yellow-300/20 bg-yellow-300/10 text-yellow-300",
    red: "border-red-300/20 bg-red-300/10 text-red-300",
    slate: "border-slate-300/20 bg-slate-300/10 text-slate-300",
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-300",
    purple: "border-purple-300/20 bg-purple-300/10 text-purple-300",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
          {title}
        </p>

        <div className={`rounded-xl border p-2 ${colors[tone]}`}>
          <Icon size={15} />
        </div>
      </div>

      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function Legend({ label, tone }) {
  const colors = {
    emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-300",
    yellow: "border-yellow-300/20 bg-yellow-300/10 text-yellow-300",
    red: "border-red-300/20 bg-red-300/10 text-red-300",
    slate: "border-slate-300/20 bg-slate-300/10 text-slate-300",
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-300",
  };

  return (
    <span className={`rounded-full border px-3 py-1 ${colors[tone]}`}>
      {label}
    </span>
  );
}