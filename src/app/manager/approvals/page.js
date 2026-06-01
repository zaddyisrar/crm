"use client";

import ManagerShell from "@/components/manager/ManagerShell";
import { CheckCircle2, XCircle } from "lucide-react";

const demoLeads = [
  {
    id: 1,
    agent: "Israr",
    name: "John Smith",
    company: "Smith Roofing",
    phone: "+1 555 0199",
    status: "Pending",
  },
  {
    id: 2,
    agent: "Asim",
    name: "Michael Brown",
    company: "Brown Cleaning",
    phone: "+1 555 0144",
    status: "Pending",
  },
];

export default function ManagerApprovalsPage() {
  return (
    <ManagerShell>
      <div className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
          Lead Approvals
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          Pending Agent Leads
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Review agent-submitted leads and approve or reject them.
        </p>

        <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-white/10">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.2em] text-cyan-300">
              <tr>
                <th className="px-5 py-4">Agent</th>
                <th className="px-5 py-4">Lead Name</th>
                <th className="px-5 py-4">Company</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {demoLeads.map((lead) => (
                <tr key={lead.id} className="border-t border-white/10 text-slate-300">
                  <td className="px-5 py-4 font-bold text-white">{lead.agent}</td>
                  <td className="px-5 py-4">{lead.name}</td>
                  <td className="px-5 py-4">{lead.company}</td>
                  <td className="px-5 py-4">{lead.phone}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-300">
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300">
                        <CheckCircle2 size={15} />
                        Approve
                      </button>

                      <button className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-bold text-red-300">
                        <XCircle size={15} />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ManagerShell>
  );
}