"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  User,
  Users,
  Building2,
  X,
  Search,
  CheckCircle2,
  Coffee,
  Bath,
  BriefcaseBusiness,
  RefreshCcw,
  Activity,
  TimerOff,
  LogIn,
  RotateCcw,
  CalendarDays,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  StickyNote,
  Star,
} from "lucide-react";

import PageShell from "@/components/crm/PageShell";
import { sheetsPost } from "@/lib/sheetsApi";

const REFRESH_INTERVAL = 30 * 1000;
const LIVE_TICK_INTERVAL = 30 * 1000;

function formatAgentName(value) {
  if (!value) return "Agent";
  return value
    .replace(/^LR-/i, "")
    .replace(/[-_]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getTimeNow() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

function parseDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue || timeValue === "-") return null;

  const date = normalizeDate(dateValue);
  const time = normalizeTime(timeValue);
  const parsed = new Date(`${date} ${time}`);

  if (!Number.isNaN(parsed.getTime())) return parsed;
  return null;
}

function resolveLoginDateTime(attendance, agentShift) {
  if (!attendance) return null;

  const loginDateTime = parseDateTime(attendance.Date, attendance.LoginTime);
  if (!loginDateTime) return null;

  const shiftStart = parseTimeToMinutes(agentShift?.shiftStart);
  const shiftEnd = parseTimeToMinutes(agentShift?.shiftEnd);
  const loginMinutes = parseTimeToMinutes(attendance.LoginTime);

  const isNightShift =
    shiftStart !== null && shiftEnd !== null && shiftEnd <= shiftStart;

  if (isNightShift && loginMinutes !== null && loginMinutes <= shiftEnd) {
    loginDateTime.setDate(loginDateTime.getDate() + 1);
  }

  return loginDateTime;
}

function formatMinutes(value) {
  const minutes = Number(value || 0);
  if (!minutes || minutes < 0) return "0m";

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (!hrs) return `${mins}m`;
  return `${hrs}h ${mins}m`;
}

function getLiveScreenMinutes(attendance, agentShift) {
  if (!attendance) return 0;

  const savedScreen = Number(attendance.TotalScreenMinutes || 0);
  const inactive = Number(attendance.TotalInactiveMinutes || 0);
  const status = attendance.Status || "Active";

  if (status === "Checked Out") return savedScreen;

  const loginDateTime = resolveLoginDateTime(attendance, agentShift);
  if (!loginDateTime) return savedScreen;

  const diff = Math.max(0, Date.now() - loginDateTime.getTime());
  const totalMinutes = Math.floor(diff / 60000);

  return Math.max(0, totalMinutes - inactive);
}

function convertSheetLead(lead, index) {
  return {
    id: `${lead.AgentID || "agent"}-${lead.Phone || "phone"}-${
      lead.Date || "date"
    }-${lead.Time || "time"}-${index}`,
    agentId: lead.AgentID || "",
    agentName: lead.AgentName || "",
    name: lead.LeadName || "",
    company: lead.Company || "",
    phone: lead.Phone || "",
    email: lead.Email || "",
    address: lead.Address || "",
    note: lead.Note || "",
    date: normalizeDate(lead.Date),
    time: lead.Time || "",
    approvalStatus: lead.ApprovalStatus || "Pending",
  };
}

function convertSheetClient(client, index) {
  return {
    id: client.ClientID || `client-${index}`,
    name: client.ClientName || "",
    company: client.Company || "",
    status: client.Status || "Active",
  };
}

function getReadableDate() {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getWeekday() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

export default function DashboardPage() {
  const [agentId, setAgentId] = useState("");
  const [agentName, setAgentName] = useState("Agent");
  const [currentStatus, setCurrentStatus] = useState("Active");

  const [agentShift, setAgentShift] = useState({
    entryTime: "",
    shiftStart: "",
    shiftEnd: "",
  });

  const [attendance, setAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadError, setLeadError] = useState("");
  const [savingLead, setSavingLead] = useState(false);

  const [, setLiveTick] = useState(0);

  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });

  async function loadAgentProfile(userId = agentId) {
    if (!userId) return;

    try {
      const response = await sheetsPost({ action: "getAgents" });
      const agents = response?.data || [];

      const currentAgent = agents.find(
        (agent) =>
          String(agent.AgentID || "").toUpperCase() ===
          String(userId || "").toUpperCase()
      );

      if (!currentAgent) return;

      setAgentShift({
        entryTime: currentAgent.EntryTime || "",
        shiftStart: currentAgent.ShiftStart || currentAgent.EntryTime || "",
        shiftEnd: currentAgent.ShiftEnd || "",
      });
    } catch (error) {
      console.error("Agent profile load failed:", error);
    }
  }

  async function loadClients() {
    try {
      setClientsLoading(true);

      const response = await sheetsPost({ action: "getClients" });

      const activeClients = (response?.data || [])
        .filter((client) => String(client.Status || "Active") !== "Inactive")
        .map(convertSheetClient);

      setClients(activeClients);

      setSelectedClient((current) => {
        if (current) {
          const stillExists = activeClients.find(
            (client) => client.id === current.id
          );

          if (stillExists) return stillExists;
        }

        return activeClients[0] || null;
      });
    } catch (error) {
      console.error("Client load failed:", error);
      setClients([]);
      setSelectedClient(null);
    } finally {
      setClientsLoading(false);
    }
  }

  async function loadAgentLeads(userId = agentId) {
    if (!userId) return;

    try {
      setLeadsLoading(true);
      setLeadError("");

      const response = await sheetsPost({ action: "getLeads" });
      const sheetLeads = response.data || [];

      const agentLeads = sheetLeads
        .filter(
          (lead) =>
            String(lead.AgentID || "").toUpperCase() ===
            String(userId || "").toUpperCase()
        )
        .map(convertSheetLead)
        .reverse();

      setLeads(agentLeads);
    } catch (error) {
      console.error("Agent leads sheet read failed:", error);
      setLeadError(error.message || "Failed to load leads from Google Sheets");
      setLeads([]);
    } finally {
      setLeadsLoading(false);
    }
  }

  async function loadAgentAttendance(userId = agentId) {
    if (!userId) return;

    try {
      setAttendanceLoading(true);

      const response = await sheetsPost({ action: "getAttendance" });
      const rows = response.data || [];

      const agentRows = rows.filter(
        (row) =>
          String(row.AgentID || "").toUpperCase() ===
          String(userId || "").toUpperCase()
      );

      const latestRow = agentRows[agentRows.length - 1] || null;

      setAttendance(latestRow);

      if (latestRow?.Status) {
        setCurrentStatus(latestRow.Status);
        localStorage.setItem(`crmCurrentStatus:${userId}`, latestRow.Status);
      }
    } catch (error) {
      console.error("Agent attendance read failed:", error);
    } finally {
      setAttendanceLoading(false);
    }
  }

  async function refreshDashboardData(userId = agentId) {
    if (!userId) return;

    await Promise.all([
      loadAgentProfile(userId),
      loadClients(),
      loadAgentLeads(userId),
      loadAgentAttendance(userId),
    ]);
  }

  useEffect(() => {
    const userId = localStorage.getItem("crmUserId");
    const userName = localStorage.getItem("crmUserName");

    if (!userId) return;

    setAgentId(userId);
    setAgentName(userName || formatAgentName(userId));

    const savedStatus =
      localStorage.getItem(`crmCurrentStatus:${userId}`) || "Active";

    setCurrentStatus(savedStatus);

    function syncStatusFromStorage() {
      const nextStatus =
        localStorage.getItem(`crmCurrentStatus:${userId}`) || "Active";

      setCurrentStatus(nextStatus);

      setAttendance((current) => {
        if (!current) return current;

        return {
          ...current,
          Status: nextStatus,
        };
      });
    }

    window.addEventListener("crm-status-change", syncStatusFromStorage);

    refreshDashboardData(userId);

    const refreshInterval = setInterval(() => {
      refreshDashboardData(userId);
    }, REFRESH_INTERVAL);

    const liveInterval = setInterval(() => {
      setLiveTick((value) => value + 1);
    }, LIVE_TICK_INTERVAL);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(liveInterval);
      window.removeEventListener("crm-status-change", syncStatusFromStorage);
    };
  }, []);

  const filteredClients = clients.filter((client) => {
    const search = clientSearch.toLowerCase();

    return (
      String(client.name || "").toLowerCase().includes(search) ||
      String(client.company || "").toLowerCase().includes(search)
    );
  });

  const currentMonthKey = getTodayKey().slice(0, 7);

  const monthlyLeadCount = leads.filter(
    (lead) => normalizeDate(lead.date).slice(0, 7) === currentMonthKey
  ).length;

  const todayLeadCount = leads.filter(
    (lead) => normalizeDate(lead.date) === getTodayKey()
  ).length;

  const checkInTime = normalizeTime(attendance?.LoginTime);
  const inactiveMinutes = Number(attendance?.TotalInactiveMinutes || 0);
  const screenMinutes = getLiveScreenMinutes(attendance, agentShift);
  const lastAutoLogout = normalizeTime(attendance?.LastAutoLogout);
  const lastResumeTime = normalizeTime(attendance?.LastResumeTime);
  const attendanceStatus = attendance?.Status || currentStatus || "Active";

  const shiftNote = useMemo(() => {
    if (!agentShift?.shiftStart || !agentShift?.shiftEnd) {
      return "Shift timing not loaded";
    }

    return `${agentShift.shiftStart} → ${agentShift.shiftEnd}`;
  }, [agentShift]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.company || !form.phone || !agentId) return;

    const newLead = {
      date: getTodayKey(),
      time: getTimeNow(),
      ...form,
    };

    try {
      setSavingLead(true);
      setLeadError("");

      await sheetsPost({
        action: "addLead",
        date: newLead.date,
        time: newLead.time,
        agentId,
        agentName,
        leadName: newLead.name,
        company: newLead.company,
        phone: newLead.phone,
        email: newLead.email,
        address: newLead.address,
        note: newLead.note,
      });

      await loadAgentLeads(agentId);

      setForm({
        name: "",
        company: "",
        phone: "",
        email: "",
        address: "",
        note: "",
      });
    } catch (err) {
      console.error("Google Sheets lead sync failed:", err);
      setLeadError(err.message || "Google Sheets lead sync failed");
    } finally {
      setSavingLead(false);
    }
  }

  function selectClient(client) {
    setSelectedClient(client);
    setForm((prev) => ({
      ...prev,
      company: client.company || prev.company,
    }));
    setIsClientModalOpen(false);
    setClientSearch("");
  }
    return (
    <PageShell
      title={`Wellcome Back, ${agentName} 👋`}
      subtitle="Ready to start today's outreach."
    >
      <div className="h-[calc(100vh-180px)] overflow-hidden">
        <div className="origin-top-left scale-[0.5] w-[200%] space-y-7">
          <div className="mt-3 flex items-center justify-between">
  <div className="scale-110 origin-left">
    <StatusBadge status={attendanceStatus} />
  </div>

  <button
    onClick={() => refreshDashboardData(agentId)}
    disabled={leadsLoading || attendanceLoading || clientsLoading}
    className="flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-[#071018] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-200 disabled:opacity-60"
  >
    <RefreshCcw
      size={16}
      className={
        leadsLoading || attendanceLoading || clientsLoading
          ? "animate-spin"
          : ""
      }
    />
    {leadsLoading || attendanceLoading || clientsLoading
      ? "Refreshing..."
      : "Refresh"}
  </button>
</div>
          <section className="rounded-[1.6rem] border border-cyan-300/20 bg-gradient-to-r from-cyan-300/10 via-[#071018]/85 to-[#071018]/80 p-5 shadow-[0_0_50px_rgba(34,211,238,0.08)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <ClientAvatar name={selectedClient?.company} />
                

                <div>
                  <p className="text-xs font-semibold text-slate-300">
                    Current Client
                  </p>
                  <h2 className="mt-1 max-w-[620px] truncate text-2xl font-black text-white">
                    {clientsLoading
                      ? "Loading Clients..."
                      : selectedClient?.company || "Select Client"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedClient?.name ||
                      "Clients are loaded live from Google Sheets."}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsClientModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300/10 px-5 py-3 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/15 hover:shadow-[0_0_30px_rgba(34,211,238,0.16)]"
              >
                Change Client
                <ChevronDown size={16} />
              </button>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-3">
            <MetricCard
              label="Leads Today"
              value={leadsLoading ? "..." : todayLeadCount}
              note={`${monthlyLeadCount} this month`}
              icon={Users}
              color="green"
            />

            <MetricCard
              label="Screen Time"
              value={formatMinutes(screenMinutes)}
              note="Active today"
              icon={Activity}
              color="blue"
            />

            <MetricCard
              label="Inactive Time"
              value={formatMinutes(inactiveMinutes)}
              note={
                lastAutoLogout !== "-"
                  ? `Last auto logout ${lastAutoLogout}`
                  : "No inactivity yet"
              }
              icon={TimerOff}
              color="red"
            />
          </div>

          <section className="rounded-[1.6rem] border border-white/10 bg-[#071018]/80 p-5 shadow-[0_0_45px_rgba(34,211,238,0.06)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/10 text-cyan-300">
                  <Users size={18} />
                </div>

                <h2 className="text-xl font-black text-white">Add Lead</h2>
              </div>

              {leadError && (
                <span className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-[10px] font-semibold text-red-300">
                  {leadError}
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
              <Field
                label="Client Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Carter"
                required
                icon={User}
              />

              <Field
                label="Company"
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder={selectedClient?.company || "Company name"}
                required
                icon={Building2}
              />

              <Field
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 555 000 1234"
                required
                icon={Phone}
              />

              <Field
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@company.com"
                icon={Mail}
              />

              <Field
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street, city, state"
                icon={MapPin}
              />

              <Field
                label="Note"
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="Short call note"
                icon={StickyNote}
              />

              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={savingLead}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-300/25 bg-gradient-to-r from-cyan-400/70 to-cyan-300 px-4 py-3 text-sm font-black text-black shadow-[0_0_35px_rgba(34,211,238,0.22)] transition hover:scale-[1.005] hover:shadow-[0_0_50px_rgba(34,211,238,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={16} />
                  {savingLead ? "Saving Lead..." : "Save Lead"}
                </button>
              </div>
            </form>
          </section>

          <div className="grid gap-4 xl:grid-cols-[2fr_0.8fr]">
            <section className="rounded-[1.6rem] border border-white/10 bg-[#071018]/80 p-5 shadow-[0_0_45px_rgba(34,211,238,0.06)] backdrop-blur-xl">
              <h2 className="mb-5 text-lg font-black text-white">
                Today's Schedule
              </h2>

              <div className="space-y-4">
                <TimelineItem
                  color="green"
                  label="Login Time"
                  value={checkInTime}
                />

                <TimelineItem
                  color="blue"
                  label="Auto Logout"
                  value={lastAutoLogout}
                />

                <TimelineItem
                  color="purple"
                  label="Last Resume"
                  value={lastResumeTime}
                />
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#071018]/80 p-5 shadow-[0_0_45px_rgba(34,211,238,0.06)] backdrop-blur-xl">
              <div className="relative z-10">
                <div className="mb-8 flex items-center gap-3">
                  <Star className="text-yellow-300" size={20} />
                  <h2 className="text-lg font-black text-white">Pro Tip</h2>
                </div>

                <p className="max-w-[260px] text-base leading-relaxed text-slate-300">
                  Consistency is what transforms average into excellence.
                </p>

                <p className="mt-8 text-5xl font-black text-cyan-300/60">“</p>
              </div>

              <div className="absolute bottom-0 left-0 h-24 w-full bg-[radial-gradient(circle_at_30%_100%,rgba(34,211,238,0.18),transparent_55%)]" />
            </section>
          </div>
        </div>
      </div>

      {isClientModalOpen && (
        <div className="fixed inset-y-0 right-0 z-50 flex w-[calc(100%-280px)] items-center justify-center bg-black/75 px-6 py-6 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-[2rem] border border-cyan-300/20 bg-[#071018] p-5 shadow-[0_0_80px_rgba(34,211,238,0.12)]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white">
                  Select Client
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Choose from active clients in Google Sheets.
                </p>
              </div>

              <button
                onClick={() => setIsClientModalOpen(false)}
                className="rounded-2xl border border-white/10 p-3 text-slate-400 hover:border-cyan-300/30 hover:text-cyan-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative mb-4">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Search client or company..."
                className="w-full rounded-2xl border border-white/10 bg-black/25 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/35"
              />
            </div>

            <div className="max-h-[420px] overflow-y-auto pr-2">
              <div className="grid gap-3 md:grid-cols-2">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => selectClient(client)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selectedClient?.id === client.id
                        ? "border-cyan-300/35 bg-cyan-300/10"
                        : "border-white/10 bg-black/20 hover:border-cyan-300/25"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-white">
                          {client.company}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {client.name}
                        </p>
                      </div>

                      {selectedClient?.id === client.id ? (
                        <span className="flex items-center gap-1 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-[11px] text-emerald-300">
                          <CheckCircle2 size={12} />
                          Selected
                        </span>
                      ) : (
                        <span className="rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] text-slate-400">
                          Client
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {!clientsLoading && filteredClients.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-8 text-center text-xs text-slate-500">
                  No active clients found.
                </div>
              )}

              {clientsLoading && (
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-8 text-center text-xs text-slate-500">
                  Loading clients...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function ClientAvatar({ name }) {
  const initials = String(name || "CRM")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/10 text-xl font-black text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.12)]">
      {initials || "CRM"}
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    Active: {
      text: "Active",
      icon: BriefcaseBusiness,
      className: "border-emerald-300/25 bg-emerald-300/10 text-emerald-300",
    },
    Break: {
      text: "On Break",
      icon: Coffee,
      className: "border-yellow-300/25 bg-yellow-300/10 text-yellow-300",
    },
    Washroom: {
      text: "Washroom",
      icon: Bath,
      className: "border-purple-300/25 bg-purple-300/10 text-purple-300",
    },
    "In Meeting": {
      text: "In Meeting",
      icon: BriefcaseBusiness,
      className: "border-blue-300/25 bg-blue-300/10 text-blue-300",
    },
    "Auto Logged Out": {
      text: "Auto Logged Out",
      icon: TimerOff,
      className: "border-red-300/25 bg-red-300/10 text-red-300",
    },
    "Checked Out": {
      text: "Checked Out",
      icon: CheckCircle2,
      className: "border-slate-300/25 bg-slate-300/10 text-slate-300",
    },
  };

  const item = config[status] || config.Active;
  const Icon = item.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-bold ${item.className}`}
    >
      <Icon size={15} />
      {item.text}
    </div>
  );
}

function MetricCard({ label, value, note, icon: Icon, color }) {
  const colors = {
    green: "text-emerald-300 bg-emerald-300/10 border-emerald-300/15",
    blue: "text-blue-300 bg-blue-300/10 border-blue-300/15",
    purple: "text-purple-300 bg-purple-300/10 border-purple-300/15",
    red: "text-red-300 bg-red-300/10 border-red-300/15",
  };

  return (
    <div className="group rounded-[1.4rem] border border-white/10 bg-[#071018]/80 p-6 shadow-[0_0_35px_rgba(34,211,238,0.04)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-[#09141f]/90">
      <div className="flex items-center gap-5">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-3xl border ${
            colors[color] || colors.blue
          }`}
        >
          <Icon size={30} />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{note}</p>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ color, label, value }) {
  const colors = {
    green: "bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.5)]",
    blue: "bg-blue-300 shadow-[0_0_18px_rgba(147,197,253,0.5)]",
    purple: "bg-purple-300 shadow-[0_0_18px_rgba(216,180,254,0.5)]",
    red: "bg-red-300 shadow-[0_0_18px_rgba(252,165,165,0.5)]",
  };

  return (
    <div className="flex items-center gap-4">
      <span className={`h-3 w-3 rounded-full ${colors[color]}`} />

      <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-2">
        <p className="text-sm font-black text-white">{value}</p>
      </div>

      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

function Field({ label, icon: Icon, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-slate-400">
        {label}
      </label>

      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-3 py-3 transition focus-within:border-cyan-300/35 focus-within:bg-black/35">
        {Icon && <Icon size={16} className="text-slate-500" />}

        <input
          {...props}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
        />
      </div>
    </div>
  );
}