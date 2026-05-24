import PageShell from '@/components/crm/PageShell';
import SectionCard from '@/components/crm/SectionCard';
import DataTable from '@/components/crm/DataTable';
import { companies } from '@/data/crmData';
import { Plus } from 'lucide-react';
import ActionButton from '@/components/crm/ActionButton';

export default function CompaniesPage() {
  const columns = [
    { key: 'name', label: 'Company Name' },
    { key: 'industry', label: 'Industry' },
    { key: 'totalLeads', label: 'Total Leads' },
    { key: 'assignedRep', label: 'Assigned Rep' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <PageShell title="Companies" subtitle="View and manage all companies">
      {/* Header with Add Button */}
      <div className="mb-6 flex justify-end">
        <ActionButton variant="primary" icon={Plus}>
          Add Company
        </ActionButton>
      </div>

      {/* Companies Table */}
      <SectionCard title={`All Companies (${companies.length})`} subtitle="Complete company database">
        <DataTable columns={columns} data={companies} showActions={true} />
      </SectionCard>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <SectionCard>
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-2">Total Companies</p>
            <p className="text-3xl font-bold text-cyan-300">{companies.length}</p>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-2">Active Companies</p>
            <p className="text-3xl font-bold text-green-300">
              {companies.filter((c) => c.status === 'Active').length}
            </p>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-2">Total Leads</p>
            <p className="text-3xl font-bold text-blue-300">
              {companies.reduce((sum, c) => sum + c.totalLeads, 0)}
            </p>
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
