"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Users,
  Clock3,
  Building2,
  PhoneCall,
  Mail,
  Activity,
  X,
  Search,
  CheckCircle2,
} from "lucide-react";

import PageShell from "@/components/crm/PageShell";
import { sheetsPost } from "@/lib/sheetsApi";

function formatAgentName(value) {
  if (!value) return "Agent";

  return value
    .replace(/^LR-/i, "")
    .replace(/[-_]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getTimeNow() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getWorkDuration(checkInTime) {
  if (!checkInTime) return "0h 0m";

  const now = new Date();
  const checkIn = new Date();

  const [time, modifier] = checkInTime.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  checkIn.setHours(hours);
  checkIn.setMinutes(minutes);
  checkIn.setSeconds(0);

  if (checkIn > now) {
    checkIn.setDate(checkIn.getDate() - 1);
  }

  const diff = now - checkIn;
  const totalMinutes = Math.floor(diff / 1000 / 60);

  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return `${hrs}h ${mins}m`;
}

const clientOptions = [
  { id: 1, name: "Operations Team", company: "Nova Building Maintenance", phone: "+1 555 100 1001", email: "contact@novabuildingmaintenance.com", status: "New" },
  { id: 2, name: "Sales Team", company: "Deepi Clean", phone: "+1 555 100 1002", email: "info@deepiclean.com", status: "New" },
  { id: 3, name: "Management", company: "Seagull Cleaning Services", phone: "+1 555 100 1003", email: "hello@seagullcleaningservices.com", status: "New" },
  { id: 4, name: "Operations Team", company: "Capital Facilities", phone: "+1 555 100 1004", email: "contact@capitalfacilities.com", status: "New" },
  { id: 5, name: "Sales Team", company: "Roli Cleaners", phone: "+1 555 100 1005", email: "info@rolicleaners.com", status: "New" },
  { id: 6, name: "Reception", company: "A1 Sunshine Cleaning", phone: "+1 555 100 1006", email: "contact@a1sunshinecleaning.com", status: "New" },
  { id: 7, name: "Management", company: "Multycerv Janitorial Services", phone: "+1 555 100 1007", email: "hello@multycervjanitorialservices.com", status: "New" },
  { id: 8, name: "Office Team", company: "Jaguar Cleaning Services Corp.", phone: "+1 555 100 1008", email: "contact@jaguarcleaningservices.com", status: "New" },
  { id: 9, name: "Admin", company: "Premium Maintenance Services Ltd.", phone: "+1 555 100 1009", email: "info@premiummaintenanceservices.com", status: "New" },
  { id: 10, name: "Support", company: "Dailycleans Commercial & Residential", phone: "+1 555 100 1010", email: "contact@dailycleans.com", status: "New" },
  { id: 11, name: "Reception", company: "Herewego", phone: "+1 555 100 1011", email: "hello@herewego.com", status: "New" },
  { id: 12, name: "Management", company: "Boston Cleaning Co., Inc.", phone: "+1 555 100 1012", email: "contact@bostoncleaningco.com", status: "New" },
  { id: 13, name: "Sales Team", company: "Shining Diamond by LS Cleaning Services", phone: "+1 555 100 1013", email: "info@shiningdiamondls.com", status: "New" },
  { id: 14, name: "Operations", company: "I & G Cleaning Services", phone: "+1 555 100 1014", email: "contact@igcleaningservices.com", status: "New" },
  { id: 15, name: "Admin", company: "Optimal Cleaning Services Ltd.", phone: "+1 555 100 1015", email: "hello@optimalcleaningservices.com", status: "New" },
  { id: 16, name: "Support Team", company: "Tetra Maintenance", phone: "+1 555 100 1016", email: "contact@tetramaintenance.com", status: "New" },
];

export default function DashboardPage() {
  const [agentId, setAgentId] = useState("");
  const [agentName, setAgentName] = useState("Agent");
  const [checkInTime, setCheckInTime] = useState("");
  const [workHours, setWorkHours] = useState("0h 0m");

  const [selectedClient, setSelectedClient] = useState(clientOptions[0]);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });

  useEffect(() => {
    const userId = localStorage.getItem("crmUserId");
    const userName = localStorage.getItem("crmUserName");

    if (!userId) return;

    setAgentId(userId);
    setAgentName(userName || formatAgentName(userId));

    const savedCheckIn = localStorage.getItem(`crmCheckInTime:${userId}`);

    if (savedCheckIn) {
      setCheckInTime(savedCheckIn);
      setWorkHours(getWorkDuration(savedCheckIn));
    }

    const savedLeads = localStorage.getItem(`crmLeads:${userId}`);

    if (savedLeads) {
      try {
        setLeads(JSON.parse(savedLeads));
      } catch {
        setLeads([]);
      }
    }
  }, []);

  useEffect(() => {
    if (!checkInTime) return;

    const timer = setInterval(() => {
      setWorkHours(getWorkDuration(checkInTime));
    }, 60000);

    return () => clearInterval(timer);
  }, [checkInTime]);

  function saveLeadsForAgent(nextLeads) {
    setLeads(nextLeads);

    if (agentId) {
      localStorage.setItem(`crmLeads:${agentId}`, JSON.stringify(nextLeads));
    }
  }

  const filteredClients = clientOptions.filter((client) => {
    const search = clientSearch.toLowerCase();

    return (
      client.name.toLowerCase().includes(search) ||
      client.company.toLowerCase().includes(search) ||
      client.phone.toLowerCase().includes(search) ||
      client.email.toLowerCase().includes(search)
    );
  });

  const recentActivity = useMemo(
    () => [
      {
        time: checkInTime || "Today",
        text: `${agentName} checked in`,
      },
      {
        time: "Now",
        text: `Working on ${selectedClient.company}`,
      },
      ...leads.slice(0, 2).map((lead) => ({
        time: lead.time,
        text: `Added lead: ${lead.company}`,
      })),
    ],
    [agentName, checkInTime, leads, selectedClient]
  );

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.company || !form.phone) return;

    const newLead = {
      id: Date.now(),
      agentId,
      date: getTodayKey(),
      time: getTimeNow(),
      clientSource: selectedClient.company,
      ...form,
    };

    const nextLeads = [newLead, ...leads];

    saveLeadsForAgent(nextLeads);

    try {
      await sheetsPost({
        action: "addLead",
        agentId: newLead.agentId,
        name: newLead.name,
        company: newLead.company,
        phone: newLead.phone,
        email: newLead.email,
        address: newLead.address,
        note: newLead.note,
        date: newLead.date,
        time: newLead.time,
      });

      console.log("Lead synced to Google Sheets");
    } catch (err) {
      console.error("Google Sheets lead sync failed:", err);
    }

    setForm({
      name: "",
      company: "",
      phone: "",
      email: "",
      address: "",
      note: "",
    });
  }

  function selectClient(client) {
    setSelectedClient(client);
    setIsClientModalOpen(false);
    setClientSearch("");
  }

  return (
    <PageShell title={`Hello, Good Morning ${agentName}`} subtitle="">
      <div className="mb-2.5 flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#071018]/80 px-3 py-2.5 backdrop-blur-xl xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/70">
            Agent Workspace
          </p>
          <h2 className="mt-0.5 truncate text-sm font-semibold text-white">
            {selectedClient.company}
          </h2>
          <p className="text-[10px] text-slate-500">
            Current client selected for calling workflow.
          </p>
        </div>

        <button
          onClick={() => setIsClientModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-[11px] font-medium text-cyan-100 hover:bg-cyan-300/15"
        >
          <Plus size={13} />
          Select Client
        </button>
      </div>

      <div className="grid gap-2.5 md:grid-cols-3">
        <DashboardCard
          label="Current Client"
          value={selectedClient.company}
          note={selectedClient.name}
          icon={Building2}
          tone="text-cyan-300"
        />

        <DashboardCard
          label="Leads Today"
          value={leads.filter((lead) => lead.date === getTodayKey()).length}
          note="Saved lead entries"
          icon={Users}
          tone="text-green-300"
        />

        <DashboardCard
          label="Work Hours"
          value={workHours}
          note={checkInTime ? `Checked in at ${checkInTime}` : "After login"}
          icon={Clock3}
          tone="text-yellow-300"
        />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1.2fr_0.55fr]">
        <section className="rounded-2xl border border-white/10 bg-[#071018]/80 px-3 py-2.5 backdrop-blur-xl">
          <div className="mb-2">
            <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/70">
              Manual Entry
            </p>
            <h2 className="text-sm font-semibold text-white">Add Lead Data</h2>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-2 md:grid-cols-3">
            <Field label="Client Name" name="name" value={form.name} onChange={handleChange} placeholder="John Carter" required />
            <Field label="Company" name="company" value={form.company} onChange={handleChange} placeholder={selectedClient.company} required />
            <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 555 000 1234" required />
            <Field label="Email" name="email" value={form.email} onChange={handleChange} placeholder="john@company.com" />
            <Field label="Address" name="address" value={form.address} onChange={handleChange} placeholder="Street, city, state" />
            <Field label="Note" name="note" value={form.note} onChange={handleChange} placeholder="Short call note" />

            <div className="md:col-span-3">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-[11px] font-medium text-cyan-100 transition hover:bg-cyan-300/15"
              >
                <Plus size={13} />
                Save Lead
              </button>
            </div>
          </form>

          <div className="mt-2.5 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full min-w-[760px] text-left text-[10px]">
              <thead className="bg-white/[0.03] text-slate-400">
                <tr>
                  <th className="px-2 py-2 font-medium">Client</th>
                  <th className="px-2 py-2 font-medium">Company</th>
                  <th className="px-2 py-2 font-medium">Phone</th>
                  <th className="px-2 py-2 font-medium">Address</th>
                  <th className="px-2 py-2 font-medium">Note</th>
                  <th className="px-2 py-2 font-medium">Time</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-3 py-4 text-center text-[11px] text-slate-500">
                      No leads added yet.
                    </td>
                  </tr>
                ) : (
                  leads.slice(0, 3).map((lead) => (
                    <tr key={lead.id} className="text-slate-300">
                      <td className="px-2 py-2 text-white">{lead.name}</td>
                      <td className="px-2 py-2">{lead.company}</td>
                      <td className="px-2 py-2 text-cyan-300">{lead.phone}</td>
                      <td className="px-2 py-2">{lead.address || "-"}</td>
                      <td className="max-w-[150px] truncate px-2 py-2">{lead.note || "-"}</td>
                      <td className="px-2 py-2 text-slate-500">{lead.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#071018]/80 px-3 py-2.5 backdrop-blur-xl">
          <div className="mb-2.5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/70">
                Live Log
              </p>
              <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
            </div>

            <span className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-300">
              Online
            </span>
          </div>

          <div className="space-y-1.5">
            {recentActivity.map((item, index) => (
              <div key={`${item.text}-${index}`} className="flex items-start gap-2 border-b border-white/10 pb-1.5 last:border-b-0">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 text-cyan-300">
                  <Activity size={10} />
                </div>

                <div>
                  <p className="text-[10px] text-slate-400">{item.time}</p>
                  <p className="text-[10px] text-slate-200">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2.5 rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-2.5">
            <p className="text-[11px] font-medium text-cyan-200">
              Selected Client
            </p>

            <div className="mt-1.5 space-y-1 text-[10px] text-slate-300">
              <p className="flex items-center gap-1.5">
                <Building2 size={11} className="text-cyan-300" />
                {selectedClient.company}
              </p>
              <p className="flex items-center gap-1.5">
                <PhoneCall size={11} className="text-cyan-300" />
                {selectedClient.phone}
              </p>
              <p className="flex items-center gap-1.5">
                <Mail size={11} className="text-cyan-300" />
                {selectedClient.email}
              </p>
            </div>
          </div>
        </section>
      </div>

      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl border border-cyan-300/15 bg-[#071018] p-5 shadow-[0_0_80px_rgba(34,211,238,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">Select Client</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Choose from commercial cleaning client list.
                </p>
              </div>

              <button
                onClick={() => setIsClientModalOpen(false)}
                className="rounded-xl border border-white/10 p-2 text-slate-400 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <div className="relative mb-4">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

              <input
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Search client, company, phone, or email..."
                className="w-full rounded-xl border border-white/10 bg-black/25 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/35"
              />
            </div>

            <div className="grid max-h-[430px] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => selectClient(client)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedClient.id === client.id
                      ? "border-cyan-300/30 bg-cyan-300/10"
                      : "border-white/10 bg-black/20 hover:border-cyan-300/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">{client.company}</p>
                      <p className="mt-1 text-xs text-slate-400">{client.name}</p>
                    </div>

                    {selectedClient.id === client.id ? (
                      <span className="flex items-center gap-1 rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-[11px] text-emerald-300">
                        <CheckCircle2 size={12} />
                        Selected
                      </span>
                    ) : (
                      <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] text-slate-400">
                        {client.status}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-1 text-[11px] text-slate-500">
                    <p>{client.phone}</p>
                    <p>{client.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function DashboardCard({ label, value, note, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#071018]/80 px-3 py-2.5 backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-between">
        <div className={`rounded-xl bg-white/5 p-2 ${tone}`}>
          <Icon size={15} />
        </div>

        <span className="max-w-[160px] truncate text-[10px] text-slate-500">
          {note}
        </span>
      </div>

      <p className="truncate text-base font-black text-white">{value}</p>
      <p className="text-[11px] text-slate-400">{label}</p>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="mb-0.5 block text-[10px] text-slate-300">
        {label}
      </label>

      <input
        {...props}
        className="w-full rounded-lg border border-white/10 bg-black/25 px-2.5 py-1.5 text-[11px] text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/35"
      />
    </div>
  );
}