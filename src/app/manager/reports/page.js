"use client";

import ManagerShell from "@/components/manager/ManagerShell";
import StatCard from "@/components/crm/StatCard";
import { CalendarCheck, Users, FileBarChart, Banknote } from "lucide-react";

export default function ManagerReportsPage() {
  return (
    <ManagerShell>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Present Today" value="0" subtitle="Attendance report" icon={CalendarCheck} />
        <StatCard title="Total Agents" value="0" subtitle="Agent report" icon={Users} />
        <StatCard title="Approved Leads" value="0" subtitle="Lead report" icon={FileBarChart} />
        <StatCard title="Salary Due" value="PKR 0" subtitle="Salary report" icon={Banknote} />
      </div>
    </ManagerShell>
  );
}