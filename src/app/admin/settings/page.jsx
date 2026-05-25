"use client";

import AdminShell from "@/components/admin/AdminShell";

export default function SettingsPage() {
  return (
    <AdminShell
      title="Settings"
      subtitle="System preferences and permissions."
    >
      <div className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6">
        Settings content here
      </div>
    </AdminShell>
  );
}