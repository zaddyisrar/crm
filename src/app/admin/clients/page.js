"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Plus,
  RefreshCw,
  Search,
  Pencil,
  Power,
  Save,
  X,
  UsersRound,
  CheckCircle2,
  Ban,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";
import { sheetsPost } from "@/lib/sheetsApi";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/35";

export default function AdminClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    clientName: "",
    company: "",
    status: "Active",
  });

  async function loadClients() {
    try {
      setLoading(true);
      const res = await sheetsPost({ action: "getClients" });
      setClients(res?.data || []);
    } catch (err) {
      alert(err.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  const stats = useMemo(() => {
    return {
      total: clients.length,
      active: clients.filter((c) => c.Status !== "Inactive").length,
      inactive: clients.filter((c) => c.Status === "Inactive").length,
    };
  }, [clients]);

  const filteredClients = useMemo(() => {
    const q = search.toLowerCase().trim();

    return clients.filter((client) => {
      const text = `${client.ClientID || ""} ${client.ClientName || ""} ${
        client.Company || ""
      } ${client.Status || ""}`.toLowerCase();

      return text.includes(q);
    });
  }, [clients, search]);

  function resetForm() {
    setForm({
      clientName: "",
      company: "",
      status: "Active",
    });
    setEditingId(null);
  }

  function startEdit(client) {
    setEditingId(client.ClientID);
    setForm({
      clientName: client.ClientName || "",
      company: client.Company || "",
      status: client.Status || "Active",
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.clientName.trim()) return alert("Client name required");
    if (!form.company.trim()) return alert("Company required");

    try {
      setSaving(true);

      await sheetsPost(
        editingId
          ? {
              action: "updateClient",
              clientId: editingId,
              clientName: form.clientName,
              company: form.company,
              status: form.status,
            }
          : {
              action: "addClient",
              clientName: form.clientName,
              company: form.company,
              status: form.status,
              addedBy: "Admin",
            }
      );

      resetForm();
      await loadClients();
    } catch (err) {
      alert(err.message || "Failed to save client");
    } finally {
      setSaving(false);
    }
  }

  async function deactivateClient(client) {
    const ok = window.confirm(`Deactivate ${client.ClientName}?`);
    if (!ok) return;

    try {
      setSaving(true);

      await sheetsPost({
        action: "deleteClient",
        clientId: client.ClientID,
      });

      await loadClients();
    } catch (err) {
      alert(err.message || "Failed to deactivate client");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell
      title="Client Management"
      subtitle="Manage CRM clients directly from Google Sheets."
    >
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-gradient-to-br from-cyan-400/[0.10] via-white/[0.035] to-transparent p-7 shadow-[0_0_60px_rgba(34,211,238,0.08)]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="mb-3 tracking-[0.45em] text-cyan-300">
                ADMIN CONTROL CENTER
              </p>

              <h1 className="flex items-center gap-4 text-4xl font-black tracking-tight text-white">
                <span className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-4 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
                  <Building2 className="h-7 w-7 text-cyan-200" />
                </span>
                Client Management
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
                Manage CRM client records directly from Google Sheets. Active
                clients will be available for agents inside the lead submission
                flow.
              </p>
            </div>

            <button
              onClick={loadClients}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/15 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <StatCard
            icon={UsersRound}
            title="Total Clients"
            value={loading ? "..." : stats.total}
            subtitle="All client records"
          />
          <StatCard
            icon={CheckCircle2}
            title="Active Clients"
            value={loading ? "..." : stats.active}
            subtitle="Visible to agents"
          />
          <StatCard
            icon={Ban}
            title="Inactive Clients"
            value={loading ? "..." : stats.inactive}
            subtitle="Hidden / disabled"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <section className="rounded-[2rem] border border-white/10 bg-[#071017]/80 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs tracking-[0.35em] text-cyan-300">
                  CLIENT FORM
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  {editingId ? "Edit Client" : "Add Client"}
                </h2>
              </div>

              {editingId && (
                <button
                  onClick={resetForm}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-slate-400 transition hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Client Name">
                <input
                  value={form.clientName}
                  onChange={(e) =>
                    setForm({ ...form, clientName: e.target.value })
                  }
                  placeholder="Kevin"
                  className={inputClass}
                />
              </Field>

              <Field label="Company">
                <input
                  value={form.company}
                  onChange={(e) =>
                    setForm({ ...form, company: e.target.value })
                  }
                  placeholder="Chrome Stone Structural"
                  className={inputClass}
                />
              </Field>

              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                  className={inputClass}
                >
                  <option className="bg-[#03060b]" value="Active">
                    Active
                  </option>
                  <option className="bg-[#03060b]" value="Inactive">
                    Inactive
                  </option>
                </select>
              </Field>

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-4 text-sm font-black text-black shadow-[0_0_35px_rgba(34,211,238,0.20)] transition hover:bg-cyan-200 disabled:opacity-60"
              >
                {editingId ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Client"
                  : "Add Client"}
              </button>
            </form>
          </section>

          <section className="min-w-0 rounded-[2rem] border border-white/10 bg-[#071017]/80 p-6 shadow-2xl">
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs tracking-[0.35em] text-cyan-300">
                  CLIENT DATABASE
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">Clients</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Total: {clients.length} / Showing: {filteredClients.length}
                </p>
              </div>

              <div className="relative w-full xl:max-w-md">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search clients..."
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10">
              <div className="max-h-[520px] overflow-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-[#111820] text-xs uppercase text-slate-400">
                    <tr>
                      <th className="px-5 py-4">Client ID</th>
                      <th className="px-5 py-4">Client Name</th>
                      <th className="px-5 py-4">Company</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Created</th>
                      <th className="px-5 py-4">Added By</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10 bg-[#050b11]">
                    {loading ? (
                      <EmptyRow text="Loading clients..." />
                    ) : filteredClients.length === 0 ? (
                      <EmptyRow text="No clients found." />
                    ) : (
                      filteredClients.map((client) => (
                        <tr
                          key={client.ClientID}
                          className="transition hover:bg-cyan-300/[0.04]"
                        >
                          <td className="px-5 py-4 font-mono text-xs text-cyan-300">
                            {client.ClientID}
                          </td>
                          <td className="px-5 py-4 font-bold text-white">
                            {client.ClientName}
                          </td>
                          <td className="px-5 py-4 text-slate-300">
                            {client.Company}
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={client.Status || "Active"} />
                          </td>
                          <td className="px-5 py-4 text-slate-400">
                            {client.CreatedAt || "-"}
                          </td>
                          <td className="px-5 py-4 text-slate-400">
                            {client.AddedBy || "-"}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => startEdit(client)}
                                className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 p-2 text-cyan-200 transition hover:bg-cyan-300/20"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => deactivateClient(client)}
                                disabled={client.Status === "Inactive" || saving}
                                className="rounded-xl border border-red-400/25 bg-red-400/10 p-2 text-red-300 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                                title="Deactivate"
                              >
                                <Power className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, title, value, subtitle }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-[#071017]/80 p-5">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-3xl font-black text-white">{value}</h3>
      <p className="mt-1 text-sm font-semibold text-slate-300">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const active = status === "Active";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        active
          ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border border-red-400/30 bg-red-400/10 text-red-300"
      }`}
    >
      {status}
    </span>
  );
}

function EmptyRow({ text }) {
  return (
    <tr>
      <td colSpan="7" className="px-5 py-14 text-center text-slate-400">
        {text}
      </td>
    </tr>
  );
}