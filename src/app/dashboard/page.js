"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Users,
  Clock3,
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
} from "lucide-react";

import PageShell from "@/components/crm/PageShell";
import { sheetsPost } from "@/lib/sheetsApi";
import { clientOptions } from "@/data/clients";

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

function parseDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue || timeValue === "-") return null;

  const date = normalizeDate(dateValue);
  const time = normalizeTime(timeValue);
  const parsed = new Date(`${date} ${time}`);

  if (!Number.isNaN(parsed.getTime())) return parsed;

  return null;
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

export default function DashboardPage() {
  const [agentId, setAgentId] = useState("");
  const [agentName, setAgentName] = useState("Agent");
  const [currentStatus, setCurrentStatus] = useState("Active");

  const [attendance, setAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const [selectedClient, setSelectedClient] = useState(clientOptions[0]);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadError, setLeadError] = useState("");
  const [savingLead, setSavingLead] = useState(false);

  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });

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
      }
    } catch (error) {
      console.error("Agent attendance read failed:", error);
    } finally {
      setAttendanceLoading(false);
    }
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
    }

    window.addEventListener("crm-status-change", syncStatusFromStorage);

    loadAgentLeads(userId);
    loadAgentAttendance(userId);

    const interval = setInterval(() => {
      loadAgentLeads(userId);
      loadAgentAttendance(userId);
    }, 10000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("crm-status-change", syncStatusFromStorage);
    };
  }, []);

  const filteredClients = clientOptions.filter((client) => {
    const search = clientSearch.toLowerCase();

    return (
      client.name.toLowerCase().includes(search) ||
      client.company.toLowerCase().includes(search) ||
      client.phone.toLowerCase().includes(search) ||
      client.email.toLowerCase().includes(search)
    );
  });

  const currentMonthKey = getTodayKey().slice(0, 7);

  const monthlyLeadCount = leads.filter(
  (lead) => normalizeDate(lead.date).slice(0, 7) === currentMonthKey
  ).length;

  const checkInTime = normalizeTime(attendance?.LoginTime);
  const inactiveMinutes = Number(attendance?.TotalInactiveMinutes || 0);
  const screenMinutes = getLiveScreenMinutes(attendance);
  const lastAutoLogout = normalizeTime(attendance?.LastAutoLogout);
  const lastResumeTime = normalizeTime(attendance?.LastResumeTime);
  const attendanceStatus = attendance?.Status || currentStatus || "Active";

  const recentActivity =(
    () => [
      {
        time: "Now",
        text:
          attendanceStatus === "Break"
            ? `${agentName} is on break`
            : attendanceStatus === "Washroom"
            ? `${agentName} is in washroom`
            : attendanceStatus === "Auto Logged Out"
            ? `${agentName} was auto logged out`
            : attendanceStatus === "Checked Out"
            ? `${agentName} completed the shift`
            : `${agentName} is active`,
      },
      {
        time: checkInTime || "Today",
        text: `${agentName} checked in`,
      },
      {
        time: "Now",
        text: `Working on ${selectedClient.company}`,
      },
      ...leads.slice(0, 2).map((lead) => ({
        time: lead.time,
        text: `Added lead: ${lead.company}`,
      })),
    ],
    [
      agentName,
      checkInTime,
      leads,
      selectedClient,
      attendanceStatus,
    ]
  );

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
    setIsClientModalOpen(false);
    setClientSearch("");
  }

  return (
    <PageShell title={`Hello, Good Morning ${agentName}`} subtitle="">
      <div className="origin-top-left scale-[0.85] w-[117.65%]">
        <div className="-mt-4 mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <StatusBadge status={attendanceStatus} />

          <button
            onClick={() => {
              loadAgentLeads(agentId);
              loadAgentAttendance(agentId);
            }}
            disabled={leadsLoading || attendanceLoading}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-slate-300 hover:border-cyan-300/25 hover:text-cyan-100 disabled:opacity-60"
          >
            <RefreshCcw
              size={13}
              className={leadsLoading || attendanceLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="mb-2.5 flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#071018]/80 px-3 py-2.5 backdrop-blur-xl xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/70">
              Agent Workspace
            </p>
            <h2 className="mt-0.5 truncate text-sm font-semibold text-white">
              {selectedClient.company}
            </h2>
            <p className="text-[10px] text-slate-500">
              Current client selected for calling workflow.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => loadAgentLeads(agentId)}
              disabled={leadsLoading}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-slate-300 hover:border-cyan-300/25 hover:text-cyan-100 disabled:opacity-60"
            >
              <RefreshCcw
                size={13}
                className={leadsLoading ? "animate-spin" : ""}
              />
              Leads
            </button>

            <button
              onClick={() => setIsClientModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-[11px] font-medium text-cyan-100 hover:bg-cyan-300/15"
            >
              <Plus size={13} />
              Select Client
            </button>
          </div>
        </div>

        <div className="grid gap-2.5 md:grid-cols-4">
          <DashboardCard
            label="Current Client"
            value={selectedClient.company}
            note={selectedClient.name}
            icon={Building2}
            tone="text-cyan-300"
          />

          <DashboardCard
            label="Leads This Month"
            value={leadsLoading ? "..." : monthlyLeadCount}
            note="From Google Sheets"
            icon={Users}
            tone="text-green-300"
          />

          <DashboardCard
            label="Screen Time"
            value={formatMinutes(screenMinutes)}
            note={checkInTime ? `Checked in at ${checkInTime}` : "Not started"}
            icon={Activity}
            tone="text-yellow-300"
          />

          <DashboardCard
            label="Inactive Time"
            value={formatMinutes(inactiveMinutes)}
            note={
              lastAutoLogout !== "-"
                ? `Last auto logout ${lastAutoLogout}`
                : "No inactivity yet"
            }
            icon={TimerOff}
            tone="text-red-300"
          />
        </div>

        -<div className="mt-2.5 grid gap-2.5 md:grid-cols-3">
  <DashboardCard
    label="Login Time"
    value={checkInTime}
    note="Google Sheets"
    icon={LogIn}
    tone="text-cyan-300"
  />

  <DashboardCard
    label="Auto Logout Time"
    value={lastAutoLogout}
    note="Last inactivity logout"
    icon={TimerOff}
    tone="text-red-300"
  />

  <DashboardCard
    label="Last Resume"
    value={lastResumeTime}
    note="After auto logout"
    icon={RotateCcw}
    tone="text-purple-300"
  />
</div>

        <div className="mt-3">
          <section className="rounded-2xl border border-white/10 bg-[#071018]/80 px-3 py-2.5 backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/70">
                  Manual Entry
                </p>
                <h2 className="text-sm font-semibold text-white">
                  Add Lead Data
                </h2>
              </div>

              {leadError && (
                <span className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-1 text-[10px] text-red-300">
                  {leadError}
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="grid gap-2 md:grid-cols-3">
              <Field
                label="Client Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Carter"
                required
              />
              <Field
                label="Company"
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder={selectedClient.company}
                required
              />
              <Field
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 555 000 1234"
                required
              />
              <Field
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@company.com"
              />
              <Field
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street, city, state"
              />
              <Field
                label="Note"
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="Short call note"
              />

              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={savingLead}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-[11px] font-medium text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={13} />
                  {savingLead ? "Saving Lead..." : "Save Lead"}
                </button>
              </div>
            </form>

            <div className="mt-2.5 overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full min-w-[760px] text-left text-[10px]">
                <thead className="bg-white/[0.03] text-slate-400">
                  <tr>
                    <th className="px-2 py-2 font-medium">Client</th>
                    <th className="px-2 py-2 font-medium">Company</th>
                    <th className="px-2 py-2 font-medium">Phone</th>
                    <th className="px-2 py-2 font-medium">Address</th>
                    <th className="px-2 py-2 font-medium">Note</th>
                    <th className="px-2 py-2 font-medium">Status</th>
                    <th className="px-2 py-2 font-medium">Time</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {leadsLoading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-3 py-4 text-center text-[11px] text-slate-500"
                      >
                        Loading leads from Google Sheets...
                      </td>
                    </tr>
                  ) : leads.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-3 py-4 text-center text-[11px] text-slate-500"
                      >
                        No leads added yet.
                      </td>
                    </tr>
                  ) : (
                    leads.slice(0, 3).map((lead) => (
                      <tr key={lead.id} className="text-slate-300">
                        <td className="px-2 py-2 text-white">{lead.name}</td>
                        <td className="px-2 py-2">{lead.company}</td>
                        <td className="px-2 py-2 text-cyan-300">
                          {lead.phone}
                        </td>
                        <td className="px-2 py-2">{lead.address || "-"}</td>
                        <td className="max-w-[150px] truncate px-2 py-2">
                          {lead.note || "-"}
                        </td>
                        <td className="px-2 py-2 text-yellow-300">
                          {lead.approvalStatus || "Pending"}
                        </td>
                        <td className="px-2 py-2 text-slate-500">
                          {lead.time}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
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
                  Choose from commercial cleaning client list.
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
                placeholder="Search client, company, phone, or email..."
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
                      selectedClient.id === client.id
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

                      {selectedClient.id === client.id ? (
                        <span className="flex items-center gap-1 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-[11px] text-emerald-300">
                          <CheckCircle2 size={12} />
                          Selected
                        </span>
                      ) : (
                        <span className="rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] text-slate-400">
                          {client.status}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-1 text-[11px] text-slate-500">
                      <p>{client.phone}</p>
                      <p className="truncate">{client.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function StatusBadge({ status }) {
  const config = {
    Active: {
      text: "Active",
      icon: BriefcaseBusiness,
      className: "border-emerald-300/20 bg-emerald-300/10 text-emerald-300",
    },
    Break: {
      text: "On Break",
      icon: Coffee,
      className: "border-yellow-300/20 bg-yellow-300/10 text-yellow-300",
    },
    Washroom: {
      text: "Washroom",
      icon: Bath,
      className: "border-purple-300/20 bg-purple-300/10 text-purple-300",
    },
    "Auto Logged Out": {
      text: "Auto Logged Out",
      icon: TimerOff,
      className: "border-red-300/20 bg-red-300/10 text-red-300",
    },
    "Checked Out": {
      text: "Checked Out",
      icon: CheckCircle2,
      className: "border-slate-300/20 bg-slate-300/10 text-slate-300",
    },
  };

  const item = config[status] || config.Active;
  const Icon = item.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-semibold ${item.className}`}
    >
      <Icon size={15} />
      Current Status: {item.text}
    </div>
  );
}

function DashboardCard({ label, value, note, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#071018]/80 px-4 py-3 backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-between">
        <div className={`rounded-xl bg-white/5 p-2 ${tone}`}>
          <Icon size={15} />
        </div>

        <span className="max-w-[160px] truncate text-[10px] text-slate-500">
          {note}
        </span>
      </div>

      <p className="truncate text-base font-black text-white">{value}</p>
      <p className="text-[11px] text-slate-400">{label}</p>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="mb-0.5 block text-[10px] text-slate-300">
        {label}
      </label>

      <input
        {...props}
        className="w-full rounded-lg border border-white/10 bg-black/25 px-2.5 py-1.5 text-[11px] text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/35"
      />
    </div>
  );
}