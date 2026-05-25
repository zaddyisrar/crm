"use client";

import { useState } from "react";
import {
  PhoneCall,
  Users,
  RotateCcw,
  CalendarCheck,
  MessageCircle,
  CalendarClock,
  ArrowRight,
  Building2,
  Mail,
  MapPin,
  Clock3,
  CheckCircle2,
  X,
  Headphones,
  FileText,
  Zap,
} from "lucide-react";

import PageShell from "@/components/crm/PageShell";
import StatCard from "@/components/crm/StatCard";

const leadQueue = [
  {
    id: 1,
    prospect: "John Carter",
    company: "CleanPro Solutions",
    phone: "+1 555 000 1234",
    email: "john@cleanpro.com",
    source: "Google Maps",
    status: "New",
    campaign: "Commercial Cleaning",
    notes: "Office cleaning prospect. Call during business hours.",
  },
  {
    id: 2,
    prospect: "Sarah Mitchell",
    company: "Bright Spaces LLC",
    phone: "+1 555 000 4567",
    email: "sarah@brightspaces.com",
    source: "Website",
    status: "Follow Up",
    campaign: "Commercial Cleaning",
    notes: "Asked for pricing details. Follow up today.",
  },
  {
    id: 3,
    prospect: "David Anderson",
    company: "RoofGuard Pros",
    phone: "+1 555 000 7788",
    email: "david@roofguard.com",
    source: "Imported Lead",
    status: "Interested",
    campaign: "Roofing",
    notes: "Interested but wants decision maker involved.",
  },
];

const callHistory = [
  {
    prospect: "ABC Cleaning",
    result: "Interested",
    duration: "08:42",
    time: "10:15 AM",
  },
  {
    prospect: "Fresh Touch Services",
    result: "No Answer",
    duration: "00:32",
    time: "09:48 AM",
  },
  {
    prospect: "Sparkle Home Care",
    result: "Follow Up",
    duration: "04:11",
    time: "09:22 AM",
  },
];

export default function CallsPage() {
  const [selectedLead, setSelectedLead] = useState(leadQueue[0]);
  const [outcome, setOutcome] = useState("Interested");
  const [notes, setNotes] = useState("");

  const callStats = [
    {
      label: "Calls Completed",
      value: "18",
      note: "+8% today",
      icon: PhoneCall,
      accent: "cyan",
    },
    {
      label: "Interested",
      value: "7",
      note: "Hot prospects",
      icon: Users,
      accent: "green",
    },
    {
      label: "Callbacks",
      value: "3",
      note: "Pending today",
      icon: RotateCcw,
      accent: "purple",
    },
    {
      label: "Booked",
      value: "2",
      note: "+25% today",
      icon: CalendarCheck,
      accent: "yellow",
    },
  ];

  return (
    <PageShell
      title="Calls"
      subtitle="Dialer workspace for calling leads and logging outcomes."
    >
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {callStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            note={stat.note}
            icon={stat.icon}
            accent={stat.accent}
          />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.2fr_0.95fr]">
        <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
                Queue
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">
                Leads To Call
              </h3>
            </div>
            <span className="rounded-lg bg-cyan-300/10 px-3 py-1 text-sm text-cyan-300">
              {leadQueue.length}
            </span>
          </div>

          <div className="space-y-3">
            {leadQueue.map((lead) => (
              <button
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selectedLead.id === lead.id
                    ? "border-cyan-300/30 bg-cyan-300/10"
                    : "border-white/10 bg-black/20 hover:border-cyan-300/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{lead.prospect}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {lead.company}
                    </p>
                  </div>

                  <StatusPill status={lead.status} />
                </div>

                <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <PhoneCall size={13} />
                  {lead.phone}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-cyan-300/15 bg-[#071018]/90 p-5 shadow-[0_0_35px_rgba(34,211,238,0.06)] backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
                Current Lead
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">
                Calling Workspace
              </h3>
            </div>

            <span className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-400">
              Zoom: Future Ready
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300">
                <Building2 size={28} />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white">
                  {selectedLead.prospect}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {selectedLead.company}
                </p>

                <div className="mt-4 grid gap-2 text-sm text-slate-300">
                  <p className="flex items-center gap-2">
                    <PhoneCall size={15} className="text-cyan-300" />
                    {selectedLead.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail size={15} className="text-cyan-300" />
                    {selectedLead.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={15} className="text-cyan-300" />
                    {selectedLead.source}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-[#071018]/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Lead Notes
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {selectedLead.notes}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <button className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-4 text-sm font-medium text-cyan-100 hover:bg-cyan-300/15">
              <PhoneCall size={18} />
              Call Now
            </button>

            <button className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm font-medium text-emerald-300 hover:bg-emerald-400/15">
              <MessageCircle size={18} />
              WhatsApp
            </button>

            <button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-sm font-medium text-slate-300 hover:border-cyan-300/30 hover:text-cyan-200">
              <CalendarClock size={18} />
              Schedule Follow-up
            </button>

            <button className="flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-4 text-sm font-medium text-red-300 hover:bg-red-400/15">
              <X size={18} />
              Not Interested
            </button>
          </div>

          <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-medium text-cyan-300 hover:border-cyan-300/30">
            Next Lead
            <ArrowRight size={18} />
          </button>
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-2">
              <Headphones size={18} className="text-cyan-300" />
              <h3 className="text-lg font-semibold text-white">
                Call Outcome
              </h3>
            </div>

            <label className="mb-2 block text-sm text-slate-300">
              Result
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/35"
            >
              <option>Interested</option>
              <option>Not Interested</option>
              <option>No Answer</option>
              <option>Follow Up</option>
              <option>Booked</option>
              <option>Wrong Number</option>
            </select>

            <label className="mb-2 mt-4 block text-sm text-slate-300">
              Agent Notes
            </label>
            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write call notes here..."
              className="w-full resize-none rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/35"
            />

            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm font-medium text-cyan-100 hover:bg-cyan-300/15">
              <CheckCircle2 size={17} />
              Save Outcome
            </button>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-2">
              <Zap size={18} className="text-cyan-300" />
              <h3 className="text-lg font-semibold text-white">
                Zoom Integration
              </h3>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-medium text-white">
                Not connected yet
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Future: Call Now will trigger Zoom Phone, attach call
                recordings, and sync transcripts.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-2">
              <FileText size={18} className="text-cyan-300" />
              <h3 className="text-lg font-semibold text-white">
                Call History
              </h3>
            </div>

            <div className="space-y-4">
              {callHistory.map((call) => (
                <div
                  key={`${call.prospect}-${call.time}`}
                  className="border-b border-white/10 pb-4 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white">{call.prospect}</p>
                    <span className="text-xs text-slate-500">{call.time}</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-slate-400">{call.result}</span>
                    <span className="flex items-center gap-1 text-cyan-300">
                      <Clock3 size={14} />
                      {call.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}

function StatusPill({ status }) {
  const styles = {
    New: "border-cyan-300/20 bg-cyan-300/10 text-cyan-200",
    Interested: "border-yellow-300/20 bg-yellow-300/10 text-yellow-200",
    "Follow Up": "border-purple-300/20 bg-purple-300/10 text-purple-200",
  };

  return (
    <span
      className={`rounded-lg border px-2.5 py-1 text-[11px] ${
        styles[status] || "border-white/10 bg-white/5 text-slate-300"
      }`}
    >
      {status}
    </span>
  );
}