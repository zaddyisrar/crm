"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/crm/PageShell";
import SectionCard from "@/components/crm/SectionCard";
import DataTable from "@/components/crm/DataTable";
import ActionButton from "@/components/crm/ActionButton";
import { sheetsPost } from "@/lib/sheetsApi";
import { Plus, RefreshCcw } from "lucide-react";

export default function MeetingsPage() {
  const [leadRows, setLeadRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadMeetings(showLoader = false) {
    try {
      if (showLoader) setLoading(true);

      const response = await sheetsPost({ action: "getLeads" });
      setLeadRows(response.data || []);
    } catch (error) {
      console.error("Meetings sheet read failed:", error);
      setLeadRows([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    loadMeetings(true);

    const interval = setInterval(() => {
      loadMeetings(false);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const meetingRows = useMemo(() => {
    return leadRows.map((lead, index) => ({
      id: `${lead.AgentID || "agent"}-${lead.Phone || "phone"}-${index}`,
      client: lead.LeadName || "-",
      company: lead.Company || "-",
      date: lead.Date || "-",
      time: lead.Time || "-",
      assignedRep: lead.AgentName || lead.AgentID || "-",
      status:
        String(lead.ApprovalStatus || "").toLowerCase() === "approved"
          ? "Confirmed"
          : String(lead.ApprovalStatus || "").toLowerCase() === "rejected"
          ? "Rejected"
          : "Pending",
    }));
  }, [leadRows]);

  const upcomingMeetings = meetingRows.filter(
    (meeting) => meeting.status !== "Rejected"
  );

  const confirmedMeetings = meetingRows.filter(
    (meeting) => meeting.status === "Confirmed"
  );

  const pendingMeetings = meetingRows.filter(
    (meeting) => meeting.status === "Pending"
  );

  const rejectedMeetings = meetingRows.filter(
    (meeting) => meeting.status === "Rejected"
  );

  const columns = [
    { key: "client", label: "Client" },
    { key: "company", label: "Company" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "assignedRep", label: "Assigned Rep" },
    { key: "status", label: "Status" },
  ];

  return (
    <PageShell
      title="Meetings"
      subtitle="Lead opportunities based on approved and pending submissions."
    >
      <div className="mb-6 flex justify-end gap-3">
        <ActionButton variant="secondary" icon={RefreshCcw} onClick={() => loadMeetings(true)}>
          {loading ? "Refreshing..." : "Refresh"}
        </ActionButton>

        <ActionButton variant="primary" icon={Plus}>
          Schedule Meeting
        </ActionButton>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <SectionCard>
          <div className="text-center">
            <p className="mb-2 text-sm text-slate-400">Total Opportunities</p>
            <p className="text-3xl font-bold text-cyan-300">
              {loading ? "..." : meetingRows.length}
            </p>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="text-center">
            <p className="mb-2 text-sm text-slate-400">Pending</p>
            <p className="text-3xl font-bold text-blue-300">
              {loading ? "..." : pendingMeetings.length}
            </p>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="text-center">
            <p className="mb-2 text-sm text-slate-400">Confirmed</p>
            <p className="text-3xl font-bold text-green-300">
              {loading ? "..." : confirmedMeetings.length}
            </p>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="text-center">
            <p className="mb-2 text-sm text-slate-400">Rejected</p>
            <p className="text-3xl font-bold text-red-300">
              {loading ? "..." : rejectedMeetings.length}
            </p>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Lead Opportunities"
        subtitle={`${upcomingMeetings.length} active opportunities from Leads sheet`}
        className="mb-6"
      >
        <DataTable columns={columns} data={upcomingMeetings} showActions={false} />
      </SectionCard>

      {rejectedMeetings.length > 0 && (
        <SectionCard
          title="Rejected Leads"
          subtitle={`${rejectedMeetings.length} rejected submissions`}
        >
          <DataTable columns={columns} data={rejectedMeetings} showActions={false} />
        </SectionCard>
      )}
    </PageShell>
  );
}