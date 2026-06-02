"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RefreshCcw,
  Search,
  Users,
  ShieldCheck,
  Clock3,
  BadgeDollarSign,
} from "lucide-react";

import ManagerShell from "@/components/manager/ManagerShell";
import { sheetsPost } from "@/lib/sheetsApi";

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

export default function ManagerAgentsPage() {
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAgents(showLoader = false) {
    try {
      if (showLoader) setLoading(true);

      setError("");

      const response = await sheetsPost({ action: "getAgents" });
      setAgents(response.data || []);
    } catch (err) {
      console.error("Manager agents sheet read failed:", err);
      setError(err.message || "Failed to load agents from Google Sheets");
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

  const visibleUsers = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return agents
      .filter((user) => {
        const role = String(user.Role || "").toLowerCase();
        return role === "agent" || role === "manager";
      })
      .filter((user) => {
        return (
          String(user.AgentID || "").toLowerCase().includes(search) ||
          String(user.AgentName || "").toLowerCase().includes(search) ||
          String(user.Role || "").toLowerCase().includes(search) ||
          String(user.Status || "").toLowerCase().includes(search)
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
    (user) => String(user.Status || "").toLowerCase() === "active"
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
              Live read-only view from the Agents sheet.
            </p>
          </div>

          <button
            onClick={() => loadAgents(true)}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-sm font-bold text-cyan-200 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
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
              placeholder="Search user, ID, role, status..."
              className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/35"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-[1.5rem] border border-white/10">
          <table className="w-full min-w-[1100px] text-left text-sm">
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
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    Loading users from Agents sheet...
                  </td>
                </tr>
              ) : visibleUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                visibleUsers.map((user, index) => (
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

                    <td className="px-5 py-4">
                      {formatPKR(user.Salary)}
                    </td>

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
                      {user.CreatedAt || "-"}
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {user.LastLogin || "-"}
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {user.WorkingHours || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-slate-600">
          Create, edit, delete, and reset password actions will be added after
          backend write-actions are created in Apps Script.
        </p>
      </div>
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