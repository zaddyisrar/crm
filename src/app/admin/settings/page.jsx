"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Bell,
  Save,
  Users,
  Lock,
  Clock3,
  Database,
  Globe,
  PhoneCall,
  AlertTriangle,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    allowAgentRelogin: false,
    campaignSelection: true,
    loginNotifications: true,
    emailAlerts: false,
    callRecording: true,
    attendanceAutomation: true,
    maintenanceMode: false,
  });

  function toggle(key) {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  return (
    <AdminShell
      title="Settings"
      subtitle="Manage CRM rules, permissions, attendance system and future integrations."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminCard
          title="Users"
          value="32"
          note="CRM Accounts"
          icon={Users}
          tone="text-cyan-300"
        />

        <AdminCard
          title="Permissions"
          value="4"
          note="Role types"
          icon={ShieldCheck}
          tone="text-green-300"
        />

        <AdminCard
          title="Attendance"
          value="Auto"
          note="Linked with login"
          icon={Clock3}
          tone="text-yellow-300"
        />

        <AdminCard
          title="Database"
          value="Pending"
          note="Supabase later"
          icon={Database}
          tone="text-purple-300"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
              System Rules
            </p>

            <h3 className="mt-1 text-lg font-semibold text-white">
              CRM Controls
            </h3>
          </div>

          <div className="space-y-4">
            <SettingRow
              title="Allow Same-Day Re-login"
              desc="Allow agents to login again after checkout."
              checked={settings.allowAgentRelogin}
              onClick={() => toggle("allowAgentRelogin")}
              icon={Lock}
            />

            <SettingRow
              title="Campaign Selection"
              desc="Agents choose assigned campaign after login."
              checked={settings.campaignSelection}
              onClick={() => toggle("campaignSelection")}
              icon={Users}
            />

            <SettingRow
              title="Attendance Automation"
              desc="Login = check-in / Logout = checkout."
              checked={settings.attendanceAutomation}
              onClick={() => toggle("attendanceAutomation")}
              icon={Clock3}
            />

            <SettingRow
              title="Call Recording"
              desc="Enable future Zoom recording integration."
              checked={settings.callRecording}
              onClick={() => toggle("callRecording")}
              icon={PhoneCall}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
              Notifications
            </p>

            <h3 className="mt-1 text-lg font-semibold text-white">
              Alerts & System Events
            </h3>
          </div>

          <div className="space-y-4">
            <SettingRow
              title="Login Notifications"
              desc="Notify admin when users login."
              checked={settings.loginNotifications}
              onClick={() => toggle("loginNotifications")}
              icon={Bell}
            />

            <SettingRow
              title="Email Alerts"
              desc="Future email notifications."
              checked={settings.emailAlerts}
              onClick={() => toggle("emailAlerts")}
              icon={Globe}
            />

            <SettingRow
              title="Maintenance Mode"
              desc="Temporarily restrict CRM access."
              checked={settings.maintenanceMode}
              onClick={() => toggle("maintenanceMode")}
              icon={AlertTriangle}
            />
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-2xl border border-yellow-300/15 bg-yellow-300/10 p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle
              size={18}
              className="text-yellow-300"
            />

            <h3 className="text-lg font-semibold text-white">
              Future Integrations
            </h3>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <p>• Zoom Phone integration</p>
            <p>• Google Maps lead import</p>
            <p>• AI transcripts</p>
            <p>• AI lead scoring</p>
            <p>• Supabase database</p>
          </div>
        </section>

        <section className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck
              size={18}
              className="text-cyan-300"
            />

            <h3 className="text-lg font-semibold text-white">
              System Status
            </h3>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <StatusBox
              title="CRM Version"
              value="V3"
            />

            <StatusBox
              title="Auth"
              value="LocalStorage"
            />

            <StatusBox
              title="Database"
              value="Pending"
            />

            <StatusBox
              title="Deployment"
              value="Live"
            />
          </div>

          <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-5 py-4 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15">
            <Save size={16} />
            Save System Settings
          </button>
        </section>
      </div>
    </AdminShell>
  );
}

function AdminCard({
  title,
  value,
  note,
  icon: Icon,
  tone,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className={`rounded-xl bg-white/5 p-3 ${tone}`}>
          <Icon size={20}/>
        </div>

        <span className="text-xs text-slate-500">
          {note}
        </span>
      </div>

      <p className="text-3xl font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-400">
        {title}
      </p>
    </div>
  );
}

function SettingRow({
  title,
  desc,
  checked,
  onClick,
  icon: Icon,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-300">
          <Icon size={17}/>
        </div>

        <div>
          <p className="font-medium text-white">
            {title}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {desc}
          </p>
        </div>
      </div>

      <button
        onClick={onClick}
        className={`relative h-6 w-12 rounded-full transition ${
          checked
            ? "bg-cyan-400"
            : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            checked
              ? "left-6"
              : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function StatusBox({
  title,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p className="mt-2 font-semibold text-cyan-300">
        {value}
      </p>
    </div>
  );
}