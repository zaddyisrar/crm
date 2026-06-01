"use client";

import ManagerShell from "@/components/manager/ManagerShell";
import StatCard from "@/components/crm/StatCard";
import { users } from "@/data/agents";
import {
  Users,
  UserCheck,
  ClipboardCheck,
  FileBarChart,
} from "lucide-react";

export default function ManagerDashboardPage() {
  const agents = users.filter((user) => user.role === "agent");
  const managers = users.filter((user) => user.role === "manager");

  return (
    <ManagerShell>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Agents"
          value={agents.length}
          subtitle="Registered active agents"
          icon={Users}
        />

        <StatCard
          title="Managers"
          value={managers.length}
          subtitle="Manager level users"
          icon={UserCheck}
        />

        <StatCard
          title="Pending Approvals"
          value="0"
          subtitle="Leads waiting for review"
          icon={ClipboardCheck}
        />

        <StatCard
          title="Reports"
          value="0"
          subtitle="Attendance & agent reports"
          icon={FileBarChart}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6 backdrop-blur-xl">
          <h2 className="text-xl font-black text-white">
            Manager Overview
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            This panel is designed for managing agents, approving submitted
            leads, and reviewing attendance or agent performance reports.
          </p>

          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-bold text-white">
                Dashboard
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Same overview style as admin for now.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-bold text-white">
                Agents
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Create, edit, delete, and manage agent accounts.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-bold text-white">
                Approvals
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Review all agent leads and approve or reject them.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6 backdrop-blur-xl">
          <h2 className="text-xl font-black text-white">
            Quick Access
          </h2>

          <div className="mt-6 grid gap-3">
            <a
              href="/manager/agents"
              className="rounded-2xl border border-cyan-300/15 bg-cyan-400/10 p-4 text-sm font-bold text-cyan-300 transition hover:bg-cyan-400/15"
            >
              Open Agent Management
            </a>

            <a
              href="/manager/approvals"
              className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm font-bold text-slate-300 transition hover:border-cyan-300/20 hover:text-cyan-300"
            >
              Open Lead Approvals
            </a>

            <a
              href="/manager/reports"
              className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm font-bold text-slate-300 transition hover:border-cyan-300/20 hover:text-cyan-300"
            >
              Open Reports
            </a>
          </div>
        </div>
      </div>
    </ManagerShell>
  );
}