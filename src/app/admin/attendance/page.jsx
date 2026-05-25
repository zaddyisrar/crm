"use client";

import AdminShell from "@/components/admin/AdminShell";

export default function AttendancePage() {
  return (
    <AdminShell
      title="Attendance"
      subtitle="Track monthly attendance and agent work activity."
    >
      <div className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6">
        Attendance content here
      </div>
    </AdminShell>
  );
}