"use client";

import AdminShell from "@/components/admin/AdminShell";

export default function AnalyticsPage() {
  return (
    <AdminShell
      title="Analytics"
      subtitle="Performance reports and CRM insights."
    >
      <div className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6">
        Analytics content here
      </div>
    </AdminShell>
  );
}