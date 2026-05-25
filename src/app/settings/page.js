"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Save,
  ShieldCheck,
  PhoneCall,
  Lock,
  Mail,
  Headphones,
} from "lucide-react";

import PageShell from "@/components/crm/PageShell";
import SectionCard from "@/components/crm/SectionCard";
import ActionButton from "@/components/crm/ActionButton";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    fullName: "Muhammad Israr",
    email: "muhammad.israr@leadsrift.com",
    loginId: "LR-MUHAMMAD",
    role: "Agent",
    campaign: "Commercial Cleaning",
    notifications: {
      leadAssigned: true,
      meetingReminder: true,
      followUpReminder: true,
      dailySummary: true,
    },
    dialer: {
      autoOpenNotes: true,
      confirmBeforeNextLead: true,
      soundAlerts: true,
    },
  });

  function handleToggle(section, key) {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key],
      },
    }));
  }

  function handleInputChange(field, value) {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleSave() {
    console.log("Agent settings saved:", settings);
  }

  return (
    <PageShell
      title="Settings"
      subtitle="Manage your agent profile, alerts, and calling preferences."
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard title="Agent Profile" subtitle="Your account information">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-2xl font-bold text-cyan-200">
              MI
            </div>

            <div className="grid flex-1 gap-4 md:grid-cols-2">
              <Field
                label="Full Name"
                value={settings.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
              />

              <Field
                label="Email"
                type="email"
                value={settings.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />

              <ReadOnlyField label="Login ID" value={settings.loginId} />
              <ReadOnlyField label="Role" value={settings.role} />
              <ReadOnlyField
                label="Assigned Campaign"
                value={settings.campaign}
                className="md:col-span-2"
              />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-yellow-300/15 bg-yellow-300/10 p-4">
            <div className="flex gap-3">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-yellow-300"
              />
              <div>
                <p className="text-sm font-medium text-yellow-200">
                  Role and campaign are admin-controlled
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Agents cannot change their role or assigned campaign from this
                  panel. These settings will be managed from the admin side.
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Security" subtitle="Account access and password">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-300">
                <Lock size={19} />
              </div>

              <div>
                <h3 className="font-semibold text-white">Password Security</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Password changes will be connected when the database/auth
                  system is added. For now, login is handled through the local
                  CRM auth flow.
                </p>
              </div>
            </div>

            <button className="mt-5 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-400">
              Change Password — Coming Soon
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-300">
                <Mail size={19} />
              </div>

              <div>
                <h3 className="font-semibold text-white">Account Email</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Your email is used for internal CRM identity and future
                  notifications.
                </p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <SectionCard title="Notifications" subtitle="Control your CRM alerts">
          <div className="space-y-4">
            <ToggleRow
              title="New Lead Assigned"
              description="Notify me when a new lead is assigned."
              checked={settings.notifications.leadAssigned}
              onChange={() => handleToggle("notifications", "leadAssigned")}
              icon={User}
            />

            <ToggleRow
              title="Meeting Reminders"
              description="Remind me before scheduled meetings."
              checked={settings.notifications.meetingReminder}
              onChange={() => handleToggle("notifications", "meetingReminder")}
              icon={Bell}
            />

            <ToggleRow
              title="Follow-up Reminders"
              description="Notify me when a follow-up is due."
              checked={settings.notifications.followUpReminder}
              onChange={() => handleToggle("notifications", "followUpReminder")}
              icon={PhoneCall}
            />

            <ToggleRow
              title="Daily Summary"
              description="Show daily activity summary."
              checked={settings.notifications.dailySummary}
              onChange={() => handleToggle("notifications", "dailySummary")}
              icon={Mail}
            />
          </div>
        </SectionCard>

        <SectionCard title="Dialer Preferences" subtitle="Calling workspace behavior">
          <div className="space-y-4">
            <ToggleRow
              title="Auto Open Notes"
              description="Open notes panel when a lead is selected."
              checked={settings.dialer.autoOpenNotes}
              onChange={() => handleToggle("dialer", "autoOpenNotes")}
              icon={Headphones}
            />

            <ToggleRow
              title="Confirm Before Next Lead"
              description="Ask confirmation before moving to next lead."
              checked={settings.dialer.confirmBeforeNextLead}
              onChange={() =>
                handleToggle("dialer", "confirmBeforeNextLead")
              }
              icon={ShieldCheck}
            />

            <ToggleRow
              title="Sound Alerts"
              description="Play alert sounds for reminders."
              checked={settings.dialer.soundAlerts}
              onChange={() => handleToggle("dialer", "soundAlerts")}
              icon={Bell}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <ActionButton variant="secondary">Cancel</ActionButton>
        <ActionButton variant="primary" icon={Save} onClick={handleSave}>
          Save Changes
        </ActionButton>
      </div>
    </PageShell>
  );
}

function Field({ label, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <input
        {...props}
        className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/35"
      />
    </div>
  );
}

function ReadOnlyField({ label, value, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <div className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-400">
        {value}
      </div>
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-cyan-300/20">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-300">
          <Icon size={17} />
        </div>

        <div>
          <p className="font-medium text-slate-200">{title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-12 shrink-0 rounded-full border transition ${
          checked
            ? "border-cyan-400/40 bg-cyan-400/30"
            : "border-white/10 bg-slate-800"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-6" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}