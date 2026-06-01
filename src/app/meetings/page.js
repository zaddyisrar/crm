"use client";

import PageShell from '@/components/crm/PageShell';
import SectionCard from '@/components/crm/SectionCard';
import DataTable from '@/components/crm/DataTable';
import ActionButton from '@/components/crm/ActionButton';
import { meetings } from '@/data/crmData';
import { Plus, Calendar } from 'lucide-react';

export default function MeetingsPage() {
  const upcomingMeetings = meetings.filter((m) => m.status !== 'Completed');
  const completedMeetings = meetings.filter((m) => m.status === 'Completed');

  const columns = [
    { key: 'client', label: 'Client' },
    { key: 'company', label: 'Company' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'assignedRep', label: 'Assigned Rep' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <PageShell title="Meetings" subtitle="Manage your scheduled meetings">
      {/* Header with Add Button */}
      <div className="mb-6 flex justify-end">
        <ActionButton variant="primary" icon={Plus}>
          Schedule Meeting
        </ActionButton>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SectionCard>
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-2">Total Meetings</p>
            <p className="text-3xl font-bold text-cyan-300">{meetings.length}</p>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-2">Upcoming</p>
            <p className="text-3xl font-bold text-blue-300">{upcomingMeetings.length}</p>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-2">Confirmed</p>
            <p className="text-3xl font-bold text-green-300">
              {meetings.filter((m) => m.status === 'Confirmed').length}
            </p>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-2">Completed</p>
            <p className="text-3xl font-bold text-emerald-300">
              {completedMeetings.length}
            </p>
          </div>
        </SectionCard>
      </div>

      {/* Upcoming Meetings */}
      <SectionCard
        title="Upcoming Meetings"
        subtitle={`${upcomingMeetings.length} meetings scheduled`}
        className="mb-6"
      >
        <DataTable columns={columns} data={upcomingMeetings} showActions={true} />
      </SectionCard>

      {/* Completed Meetings */}
      {completedMeetings.length > 0 && (
        <SectionCard
          title="Completed Meetings"
          subtitle={`${completedMeetings.length} meetings completed`}
        >
          <DataTable columns={columns} data={completedMeetings} showActions={false} />
        </SectionCard>
      )}
    </PageShell>
  );
}
