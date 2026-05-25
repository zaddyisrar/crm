"use client";

import AdminShell from "@/components/admin/AdminShell";

export default function CampaignsPage() {
  return (
    <AdminShell
      title="Campaigns"
      subtitle="Create and manage campaign workspaces."
    >
      <div className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6">
        Campaign content here
      </div>
    </AdminShell>
  );
}