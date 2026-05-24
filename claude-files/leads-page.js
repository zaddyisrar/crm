'use client';

import PageShell from '@/components/crm/PageShell';
import SectionCard from '@/components/crm/SectionCard';
import DataTable from '@/components/crm/DataTable';
import ActionButton from '@/components/crm/ActionButton';
import { leads } from '@/data/crmData';
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'company', label: 'Company' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' },
    { key: 'assignedTo', label: 'Assigned To' }
  ];

  return (
    <PageShell title="Leads" subtitle="Manage and track all your leads">
      {/* Header with Search and Add Button */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search by name, company, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2 rounded-lg bg-slate-800/50 border border-cyan-500/20 text-slate-200 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
          />
        </div>
        <ActionButton variant="primary" icon={Plus}>
          Add Lead
        </ActionButton>
      </div>

      {/* Leads Table */}
      <SectionCard title={`All Leads (${filteredLeads.length})`} subtitle="Complete list of your leads">
        <DataTable columns={columns} data={filteredLeads} showActions={true} />
      </SectionCard>
    </PageShell>
  );
}
