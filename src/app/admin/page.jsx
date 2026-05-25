"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  BriefcaseBusiness,
  Clock3,
  Activity,
  TrendingUp,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";

function formatName(value) {
  if (!value) return "Admin";

  return value
    .replace(/^LR-/i, "")
    .replace(/[-_]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

const operations = [
  {
    agent: "Hamza",
    action: "Working on Nova Building Maintenance",
    time: "2 min ago",
  },
  {
    agent: "Ammar",
    action: "Added new lead",
    time: "6 min ago",
  },
  {
    agent: "Sameen",
    action: "Checked in",
    time: "10 min ago",
  },
  {
    agent: "Asim",
    action: "Selected Seagull Cleaning",
    time: "15 min ago",
  },
];

const summary = [
  { title: "Leads Added", value: "34" },
  { title: "Clients Contacted", value: "12" },
  { title: "Active Agents", value: "9" },
  { title: "Meetings Booked", value: "3" },
];

export default function AdminPage() {
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const user = localStorage.getItem("crmUserId");

    if (user) {
      setAdminName(formatName(user));
    }
  }, []);

  const stats = [
    {
      title: "Active Agents",
      value: "12",
      note: "9 online now",
      icon: Users,
      color: "text-cyan-300",
    },
    {
      title: "Available Clients",
      value: "16",
      note: "Total clients",
      icon: Building2,
      color: "text-green-300",
    },
    {
      title: "Working Clients",
      value: "8",
      note: "Assigned now",
      icon: BriefcaseBusiness,
      color: "text-yellow-300",
    },
    {
      title: "Attendance",
      value: "91%",
      note: "Present today",
      icon: Clock3,
      color: "text-purple-300",
    },
  ];

  return (
    <AdminShell>
      <div className="mb-5 rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03] px-8 py-6">
        <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-300">
          ADMIN CONTROL CENTER
        </p>

        <h1 className="mt-3 text-4xl font-black text-white">
          Welcome {adminName}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage team activity and CRM operations.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {stats.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03] p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={`rounded-xl bg-white/[0.04] p-3 ${card.color}`}>
                  <Icon size={17} />
                </div>

                <p className="text-xs text-slate-500">
                  {card.note}
                </p>
              </div>

              <h2 className="text-2xl font-black text-white">
                {card.value}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {card.title}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03] p-5">
          <div className="mb-5 flex items-center gap-3">
            <Activity className="text-cyan-300" size={18} />
            <h2 className="text-lg font-bold text-white">
              Live Operations
            </h2>
          </div>

          <div className="space-y-3">
            {operations.map((x) => (
              <div
                key={x.agent}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-4 py-4"
              >
                <div>
                  <p className="font-semibold text-white">
                    {x.agent}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {x.action}
                  </p>
                </div>

                <span className="text-xs text-slate-500">
                  {x.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-cyan-300/10 bg-white/[0.03] p-5">
          <div className="mb-5 flex items-center gap-3">
            <TrendingUp className="text-cyan-300" size={18} />

            <h2 className="text-lg font-bold text-white">
              Today Summary
            </h2>
          </div>

          <div className="space-y-3">
            {summary.map((x) => (
              <div
                key={x.title}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-4 py-4"
              >
                <span className="text-slate-400">
                  {x.title}
                </span>

                <span className="text-xl font-black text-white">
                  {x.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}