"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RefreshCcw,
  Search,
  Users,
  ShieldCheck,
  Clock3,
  BadgeDollarSign,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";

import ManagerShell from "@/components/manager/ManagerShell";
import { sheetsPost } from "@/lib/sheetsApi";

const emptyForm = {
  agentId: "",
  agentName: "",
  password: "",
  salary: "",
  workingHours: "9",
  entryTime: "18:45",
  shiftStart: "19:00",
  shiftEnd: "04:00",
  status: "Active",
};

function formatPKR(value) {
  const amount = Number(value || 0);
  return `PKR ${amount.toLocaleString()}`;
}

function statusClass(status) {
  const clean = String(status || "Active").toLowerCase();

  if (clean === "inactive") {
    return "border-red-400/20 bg-red-400/10 text-red-300";
  }

  return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
}

function normalizeDate(value) {
  if (!value) return "-";

  const raw = String(value).trim();
  if (!raw || raw === "-") return "-";

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

function timeToMinutes(value) {
  if (!value) return null;

  const raw = String(value).trim();

  let match24 = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return Number(match24[1]) * 60 + Number(match24[2]);
  }

  let match12 = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hour = Number(match12[1]);
    const minute = Number(match12[2]);
    const meridian = match12[3].toUpperCase();

    if (meridian === "PM" && hour !== 12) hour += 12;
    if (meridian === "AM" && hour === 12) hour = 0;

    return hour * 60 + minute;
  }

  const date = new Date(raw);
  if (!Number.isNaN(date.getTime())) {
    return date.getHours() * 60 + date.getMinutes();
  }

  return null;
}

function toTimeInput(value, fallback = "19:00") {
  const minutes = timeToMinutes(value);

  if (minutes === null) return fallback;

  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function toAmPm(value, fallback = "07:00 PM") {
  const minutes = timeToMinutes(value);

  if (minutes === null) return fallback;

  let hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const meridian = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;
  if (hour === 0) hour = 12;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0"
  )} ${meridian}`;
}

function calculateWorkingHours(shiftStart, shiftEnd) {
  const start = timeToMinutes(shiftStart);
  const end = timeToMinutes(shiftEnd);

  if (start === null || end === null) return "0";

  let diff = end - start;

  if (diff <= 0) {
    diff += 24 * 60;
  }

  return (diff / 60).toFixed(diff % 60 === 0 ? 0 : 2);
}

function isNightShift(shiftStart, shiftEnd) {
  const start = timeToMinutes(shiftStart);
  const end = timeToMinutes(shiftEnd);

  if (start === null || end === null) return false;

  return end <= start;
}

function validateShiftTimes(entryTime, shiftStart, shiftEnd) {
  const entry = timeToMinutes(entryTime);
  const start = timeToMinutes(shiftStart);
  const end = timeToMinutes(shiftEnd);

  if (entry === null) throw new Error("Entry Time is required");
  if (start === null) throw new Error("Shift Start is required");
  if (end === null) throw new Error("Shift End is required");

  if (start === end) {
    throw new Error("Shift Start and Shift End cannot be the same.");
  }

  if (entry > start) {
    throw new Error("Entry Time cannot be after Shift Start.");
  }

  return true;
}

export default function ManagerAgentsPage() {
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(emptyForm);

  const calculatedHours = useMemo(() => {
    return calculateWorkingHours(form.shiftStart, form.shiftEnd);
  }, [form.shiftStart, form.shiftEnd]);

  const shiftType = useMemo(() => {
    return isNightShift(form.shiftStart, form.shiftEnd)
      ? "Night Shift"
      : "Day Shift";
  }, [form.shiftStart, form.shiftEnd]);

  async function loadAgents(showLoader = false) {
    try {
      if (showLoader) setLoading(true);

      setError("");

      const response = await sheetsPost({ action: "getAgents" });

      if (response?.success === false) {
        throw new Error(response.message || "Failed to load agents");
      }

      setAgents(response?.data || []);
    } catch (err) {
      console.error("Manager agents sheet read failed:", err);
      setError(err?.message || "Failed to load agents from Google Sheets");
      setAgents([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    loadAgents(true);

    const interval = setInterval(() => {
      loadAgents(false);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  function openCreateModal() {
    setMode("create");
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openEditModal(user) {
    setMode("edit");
    setForm({
      agentId: user.AgentID || "",
      agentName: user.AgentName || "",
      password: user.Password || "",
      salary: user.Salary || "",
      workingHours: user.WorkingHours || "9",
      entryTime: toTimeInput(user.EntryTime || user.ShiftStart, "18:45"),
      shiftStart: toTimeInput(user.ShiftStart || user.EntryTime, "19:00"),
      shiftEnd: toTimeInput(user.ShiftEnd, "04:00"),
      status: user.Status || "Active",
    });
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setForm(emptyForm);
  }

  function updateForm(key, value) {
    setForm((prev) => {
      const next = {
        ...prev,
        [key]: value,
      };

      if (key === "shiftStart" || key === "shiftEnd") {
        next.workingHours = calculateWorkingHours(
          key === "shiftStart" ? value : next.shiftStart,
          key === "shiftEnd" ? value : next.shiftEnd
        );
      }

      return next;
    });
  }

  async function handleSaveAgent(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const cleanAgentId = String(form.agentId || "").trim().toUpperCase();
      const cleanAgentName = String(form.agentName || "").trim();
      const cleanPassword = String(form.password || "").trim();

      if (!cleanAgentId) throw new Error("Agent ID is required");
      if (!cleanAgentName) throw new Error("Agent name is required");
      if (!cleanPassword) throw new Error("Password is required");

      validateShiftTimes(form.entryTime, form.shiftStart, form.shiftEnd);

      const finalWorkingHours = calculateWorkingHours(
        form.shiftStart,
        form.shiftEnd
      );

      const payload = {
        action: mode === "create" ? "addAgent" : "updateAgent",
        agentId: cleanAgentId,
        agentName: cleanAgentName,
        password: cleanPassword,
        salary: Number(form.salary || 0),
        workingHours: Number(finalWorkingHours || 0),
        entryTime: toAmPm(form.entryTime, "06:45 PM"),
        shiftStart: toAmPm(form.shiftStart, "07:00 PM"),
        shiftEnd: toAmPm(form.shiftEnd, "04:00 AM"),
        status: form.status || "Active",
      };

      const response = await sheetsPost(payload);

      if (response?.success === false) {
        throw new Error(response.message || "Failed to save agent");
      }

      setSuccess(
        mode === "create"
          ? "Agent created successfully."
          : "Agent updated successfully."
      );

      setModalOpen(false);
      setForm(emptyForm);

      await loadAgents(true);
    } catch (err) {
      console.error("Agent save failed:", err);
      setError(err?.message || "Failed to save agent");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivateAgent(user) {
    const agentId = String(user.AgentID || "").trim().toUpperCase();

    if (!agentId) return;

    const confirmed = window.confirm(
      `Deactivate ${
        user.AgentName || agentId
      }? This will block login but keep old reports safe.`
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await sheetsPost({
        action: "deleteAgent",
        agentId,
      });

      if (response?.success === false) {
        throw new Error(response.message || "Failed to deactivate agent");
      }

      setSuccess("Agent deactivated successfully.");
      await loadAgents(true);
    } catch (err) {
      console.error("Agent deactivate failed:", err);
      setError(err?.message || "Failed to deactivate agent");
    } finally {
      setSaving(false);
    }
  }

  const visibleUsers = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return agents
      .filter((user) => {
        const role = String(user.Role || "").toLowerCase();
        return role === "agent" || role === "manager";
      })
      .filter((user) => {
        if (!search) return true;

        return (
          String(user.AgentID || "").toLowerCase().includes(search) ||
          String(user.AgentName || "").toLowerCase().includes(search) ||
          String(user.Role || "").toLowerCase().includes(search) ||
          String(user.Status || "").toLowerCase().includes(search) ||
          String(user.EntryTime || "").toLowerCase().includes(search) ||
          String(user.ShiftStart || "").toLowerCase().includes(search) ||
          String(user.ShiftEnd || "").toLowerCase().includes(search)
        );
      });
  }, [agents, searchTerm]);

  const agentCount = visibleUsers.filter(
    (user) => String(user.Role || "").toLowerCase() === "agent"
  ).length;

  const managerCount = visibleUsers.filter(
    (user) => String(user.Role || "").toLowerCase() === "manager"
  ).length;

  const activeCount = visibleUsers.filter(
    (user) => String(user.Status || "Active").toLowerCase() === "active"
  ).length;

  const totalSalary = visibleUsers
    .filter((user) => String(user.Role || "").toLowerCase() === "agent")
    .reduce((sum, user) => sum + Number(user.Salary || 0), 0);

  return (
    <ManagerShell>
      <div className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6 backdrop-blur-xl">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
              Manager Panel
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              Agent Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create, edit, deactivate agents, and manage shift timings.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={openCreateModal}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-2.5 text-sm font-bold text-emerald-200 transition hover:bg-emerald-300/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={15} />
              Create Agent
            </button>

            <button
              onClick={() => loadAgents(true)}
              disabled={loading || saving}
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

        {success && (
          <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MiniCard
            title="Agents"
            value={loading ? "..." : agentCount}
            icon={Users}
            tone="text-cyan-300"
          />

          <MiniCard
            title="Managers"
            value={loading ? "..." : managerCount}
            icon={ShieldCheck}
            tone="text-purple-300"
          />

          <MiniCard
            title="Active Users"
            value={loading ? "..." : activeCount}
            icon={Clock3}
            tone="text-emerald-300"
          />

          <MiniCard
            title="Agent Payroll"
            value={loading ? "..." : formatPKR(totalSalary)}
            icon={BadgeDollarSign}
            tone="text-yellow-300"
          />
        </div>

        <div className="mb-5 flex justify-end">
          <div className="relative w-full xl:w-[360px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, ID, role, status, shift time..."
              className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/35"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-[1.5rem] border border-white/10">
          <table className="w-full min-w-[1550px] text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.2em] text-cyan-300">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Password</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Salary</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4">Last Login</th>
                <th className="px-5 py-4">Hours</th>
                <th className="px-5 py-4">Entry Time</th>
                <th className="px-5 py-4">Shift Start</th>
                <th className="px-5 py-4">Shift End</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="13"
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    Loading users from Agents sheet...
                  </td>
                </tr>
              ) : visibleUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="13"
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                visibleUsers.map((user, index) => {
                  const role = String(user.Role || "").toLowerCase();
                  const canManage = role === "agent";
                  const isInactive =
                    String(user.Status || "Active").toLowerCase() ===
                    "inactive";

                  return (
                    <tr
                      key={`${user.AgentID || "user"}-${index}`}
                      className="border-t border-white/10 text-slate-300"
                    >
                      <td className="px-5 py-4 font-bold text-white">
                        {user.AgentName || "-"}
                      </td>

                      <td className="px-5 py-4 text-cyan-300">
                        {user.AgentID || "-"}
                      </td>

                      <td className="px-5 py-4">{user.Password || "-"}</td>

                      <td className="px-5 py-4 capitalize">
                        {user.Role || "-"}
                      </td>

                      <td className="px-5 py-4">{formatPKR(user.Salary)}</td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass(
                            user.Status
                          )}`}
                        >
                          {user.Status || "Active"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {normalizeDate(user.CreatedAt)}
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {user.LastLogin || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {user.WorkingHours || "-"}
                      </td>

                      <td className="px-5 py-4 text-cyan-300">
                        {user.EntryTime || "-"}
                      </td>

                      <td className="px-5 py-4 text-blue-300">
                        {user.ShiftStart || "-"}
                      </td>

                      <td className="px-5 py-4 text-purple-300">
                        {user.ShiftEnd || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            disabled={!canManage || saving}
                            className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-2 text-cyan-200 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-40"
                            title={
                              canManage
                                ? "Edit agent"
                                : "Managers cannot edit this account"
                            }
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            onClick={() => handleDeactivateAgent(user)}
                            disabled={!canManage || isInactive || saving}
                            className="rounded-xl border border-red-400/20 bg-red-400/10 p-2 text-red-300 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-40"
                            title={
                              isInactive
                                ? "Already inactive"
                                : "Deactivate agent"
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-slate-600">
          Remove action uses safe deactivation. Old attendance and leads history
          will stay protected.
        </p>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-[2rem] border border-cyan-300/15 bg-[#050913] p-6 shadow-2xl shadow-cyan-950/40">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
                  {mode === "create" ? "Create Agent" : "Edit Agent"}
                </p>

                <h3 className="mt-2 text-2xl font-black text-white">
                  {mode === "create"
                    ? "Add New Agent ID"
                    : `Update ${form.agentId}`}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Entry Time controls login window. Shift End controls auto
                  checkout.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAgent} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Agent ID">
                  <input
                    value={form.agentId}
                    onChange={(e) =>
                      updateForm("agentId", e.target.value.toUpperCase())
                    }
                    disabled={mode === "edit" || saving}
                    placeholder="e.g. AG001"
                    className="inputBox disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </Field>

                <Field label="Agent Name">
                  <input
                    value={form.agentName}
                    onChange={(e) => updateForm("agentName", e.target.value)}
                    disabled={saving}
                    placeholder="Agent full name"
                    className="inputBox"
                  />
                </Field>

                <Field label="Password">
                  <input
                    value={form.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                    disabled={saving}
                    placeholder="Login password"
                    className="inputBox"
                  />
                </Field>

                <Field label="Salary">
                  <input
                    type="number"
                    value={form.salary}
                    onChange={(e) => updateForm("salary", e.target.value)}
                    disabled={saving}
                    placeholder="60000"
                    className="inputBox"
                  />
                </Field>

                <Field label="Entry Time">
                  <input
                    type="time"
                    value={form.entryTime}
                    onChange={(e) => updateForm("entryTime", e.target.value)}
                    disabled={saving}
                    className="inputBox"
                  />
                </Field>

                <Field label="Shift Start">
                  <input
                    type="time"
                    value={form.shiftStart}
                    onChange={(e) => updateForm("shiftStart", e.target.value)}
                    disabled={saving}
                    className="inputBox"
                  />
                </Field>

                <Field label="Shift End">
                  <input
                    type="time"
                    value={form.shiftEnd}
                    onChange={(e) => updateForm("shiftEnd", e.target.value)}
                    disabled={saving}
                    className="inputBox"
                  />
                </Field>

                <Field label="Working Hours">
                  <input
                    value={calculatedHours}
                    readOnly
                    className="inputBox cursor-not-allowed opacity-80"
                  />
                </Field>

                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => updateForm("status", e.target.value)}
                    disabled={saving}
                    className="inputBox"
                  >
                    <option value="Active">🟢 Active</option>
                    <option value="Inactive">🔴 Inactive</option>
                  </select>
                </Field>
              </div>

              <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-4 text-sm">
                <p className="font-black text-cyan-200">Shift Preview</p>

                <div className="mt-3 grid gap-3 text-slate-300 sm:grid-cols-2">
                  <PreviewItem
                    label="Entry Time"
                    value={toAmPm(form.entryTime, "06:45 PM")}
                  />
                  <PreviewItem
                    label="Shift Start"
                    value={toAmPm(form.shiftStart, "07:00 PM")}
                  />
                  <PreviewItem
                    label="Auto Checkout"
                    value={toAmPm(form.shiftEnd, "04:00 AM")}
                  />
                  <PreviewItem label="Duration" value={`${calculatedHours} Hours`} />
                  <PreviewItem label="Shift Type" value={shiftType} />
                  <PreviewItem
                    label="Next Login"
                    value={`${toAmPm(form.entryTime, "06:45 PM")} Next Cycle`}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-2.5 text-sm font-bold text-cyan-200 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .inputBox {
          width: 100%;
          border-radius: 0.9rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.25);
          padding: 0.75rem 0.85rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
        }

        .inputBox::placeholder {
          color: rgb(71 85 105);
        }

        .inputBox:focus {
          border-color: rgba(103, 232, 249, 0.35);
        }

        select.inputBox option {
          background: #050913;
          color: white;
        }
      `}</style>
    </ManagerShell>
  );
}

function MiniCard({ title, value, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className={`mb-3 w-fit rounded-xl bg-white/5 p-2 ${tone}`}>
        <Icon size={17} />
      </div>

      <p className="text-xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{title}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      {children}
    </label>
  );
}

function PreviewItem({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}