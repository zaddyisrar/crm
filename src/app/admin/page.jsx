"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  Headphones,
  LogOut,
  Shield,
  Users,
  Plus,
  UserPlus,
  X,
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");

  const [agentModal, setAgentModal] = useState(false);
  const [campaignModal, setCampaignModal] = useState(false);

  const [agents, setAgents] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  const [agentForm, setAgentForm] = useState({
    name: "",
    id: "",
    password: "",
    campaign: "",
  });

  const [campaignName, setCampaignName] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("crmRole");
    const savedUser = localStorage.getItem("crmUserId");

    if (!role || role !== "admin") {
      router.push("/login");
      return;
    }

    setUserId(savedUser || "Admin");

    const savedAgents =
      JSON.parse(localStorage.getItem("crmAgents")) || [
        {
          name: "Hamza",
          id: "LR-HAMZA",
          status: "Calling",
          leads: 18,
          calls: 42,
          campaign: "Commercial Cleaning",
        },
        {
          name: "Ammar",
          id: "LR-AMMAR",
          status: "Break",
          leads: 11,
          calls: 31,
          campaign: "Roofing",
        },
      ];

    const savedCampaigns =
      JSON.parse(localStorage.getItem("crmCampaigns")) || [
        "Commercial Cleaning",
        "Roofing",
        "Solar",
      ];

    setAgents(savedAgents);
    setCampaigns(savedCampaigns);
  }, [router]);

  useEffect(() => {
    localStorage.setItem(
      "crmAgents",
      JSON.stringify(agents)
    );
  }, [agents]);

  useEffect(() => {
    localStorage.setItem(
      "crmCampaigns",
      JSON.stringify(campaigns)
    );
  }, [campaigns]);

  const stats = useMemo(() => {
    return [
      {
        label: "Active Agents",
        value: agents.length,
        icon: Users,
      },
      {
        label: "Leads Today",
        value: "42",
        icon: Activity,
      },
      {
        label: "Calls Logged",
        value: "118",
        icon: Headphones,
      },
      {
        label: "Meetings Booked",
        value: "09",
        icon: CheckCircle2,
      },
    ];
  }, [agents]);

  function logout() {
    localStorage.clear();
    router.push("/login");
  }

  function createAgent() {
    if (
      !agentForm.name ||
      !agentForm.id ||
      !agentForm.password ||
      !agentForm.campaign
    )
      return;

    setAgents([
      ...agents,
      {
        ...agentForm,
        status: "Available",
        leads: 0,
        calls: 0,
      },
    ]);

    setAgentForm({
      name: "",
      id: "",
      password: "",
      campaign: "",
    });

    setAgentModal(false);
  }

  function createCampaign() {
    if (!campaignName.trim()) return;

    setCampaigns([
      ...campaigns,
      campaignName,
    ]);

    setCampaignName("");

    setCampaignModal(false);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#03060b] text-white">

      <div className="fixed inset-0 bg-[linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.04)_1px,transparent_1px)] bg-[size:70px_70px]" />

      <div className="relative mx-auto max-w-7xl px-6 py-6">

        <header className="mb-6 flex items-center justify-between rounded-[2rem] border border-cyan-300/15 bg-white/[0.035] p-6">

          <Image
            src="/crm-logo.png"
            alt="CRM"
            width={200}
            height={80}
            className="w-[160px]"
          />

          <div className="flex gap-3">

            <button
              onClick={() =>
                setCampaignModal(true)
              }
              className="flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-xs font-bold text-cyan-300"
            >
              <Plus size={15}/>
              Campaign
            </button>

            <button
              onClick={() =>
                setAgentModal(true)
              }
              className="flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-xs font-black text-black"
            >
              <UserPlus size={15}/>
              Agent
            </button>

            <button
              onClick={logout}
              className="rounded-xl border border-cyan-300/15 px-5 py-3 text-sm"
            >
              <LogOut size={15}/>
            </button>

          </div>

        </header>

        <section className="mb-6 rounded-[2rem] border border-cyan-300/15 bg-white/[0.035] p-7">

          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
            <Shield size={15}/>
            Admin Control Center
          </p>

          <h1 className="mt-4 text-5xl font-black">
            Welcome, {userId}
          </h1>

          <p className="mt-3 text-slate-400">
            Manage campaigns, agents and CRM operations.
          </p>

        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-4">

          {stats.map((item)=>{

            const Icon=item.icon

            return(

            <div
            key={item.label}
            className="rounded-[1.7rem] border border-cyan-300/15 bg-white/[0.035] p-6"
            >

            <Icon
            className="text-cyan-300"
            size={22}
            />

            <p className="mt-6 text-5xl font-black">
              {item.value}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {item.label}
            </p>

            </div>

            )

          })}

        </section>


        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">

          <div className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.035] p-6">

            <h2 className="mb-6 text-2xl font-black">
              Live Agents
            </h2>

            <div className="overflow-hidden rounded-2xl border border-cyan-300/10">

              <table className="w-full">

                <thead className="bg-black/30">

                  <tr className="text-left text-xs uppercase text-slate-500">

                    <th className="px-5 py-4">
                      Agent
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Campaign
                    </th>

                    <th>
                      Calls
                    </th>

                  </tr>

                </thead>

                <tbody>

                {agents.map((agent)=>(

                <tr
                key={agent.id}
                className="border-t border-cyan-300/10"
                >

                <td className="px-5 py-5">

                <p className="font-bold">
                {agent.name}
                </p>

                <p className="text-xs text-slate-500">
                {agent.id}
                </p>

                </td>

                <td>

                <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                {agent.status}
                </span>

                </td>

                <td>{agent.campaign}</td>

                <td>{agent.calls}</td>

                </tr>

                ))}

                </tbody>

              </table>

            </div>

          </div>

          <div className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.035] p-6">

            <h2 className="mb-5 text-2xl font-black">
              Campaigns
            </h2>

            <div className="space-y-3">

            {campaigns.map((campaign)=>(

            <div
            key={campaign}
            className="rounded-2xl border border-cyan-300/10 bg-black/20 p-4"
            >

            {campaign}

            </div>

            ))}

            </div>

          </div>

        </section>

      </div>


      {agentModal && (

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

      <div className="w-full max-w-md rounded-[2rem] bg-[#061016] p-6">

      <div className="mb-5 flex justify-between">

      <h2 className="text-2xl font-black">
      Create Agent
      </h2>

      <button onClick={()=>setAgentModal(false)}>
      <X/>
      </button>

      </div>

      <div className="space-y-4">

      <input
      placeholder="Name"
      className="w-full rounded-xl bg-black/30 p-4"
      onChange={(e)=>setAgentForm({...agentForm,name:e.target.value})}
      />

      <input
      placeholder="ID"
      className="w-full rounded-xl bg-black/30 p-4"
      onChange={(e)=>setAgentForm({...agentForm,id:e.target.value})}
      />

      <input
      placeholder="Password"
      className="w-full rounded-xl bg-black/30 p-4"
      onChange={(e)=>setAgentForm({...agentForm,password:e.target.value})}
      />

      <select
      className="w-full rounded-xl bg-black/30 p-4"
      onChange={(e)=>setAgentForm({...agentForm,campaign:e.target.value})}
      >

      <option>Select Campaign</option>

      {campaigns.map((c)=>(

      <option key={c}>
      {c}
      </option>

      ))}

      </select>

      <button
      onClick={createAgent}
      className="w-full rounded-xl bg-cyan-400 py-4 font-black text-black"
      >

      CREATE AGENT

      </button>

      </div>

      </div>

      </div>

      )}


      {campaignModal && (

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

      <div className="w-full max-w-md rounded-[2rem] bg-[#061016] p-6">

      <div className="mb-5 flex justify-between">

      <h2 className="text-2xl font-black">
      Create Campaign
      </h2>

      <button onClick={()=>setCampaignModal(false)}>
      <X/>
      </button>

      </div>

      <input
      value={campaignName}
      onChange={(e)=>setCampaignName(e.target.value)}
      placeholder="Campaign Name"
      className="w-full rounded-xl bg-black/30 p-4"
      />

      <button
      onClick={createCampaign}
      className="mt-5 w-full rounded-xl bg-cyan-400 py-4 font-black text-black"
      >
      CREATE
      </button>

      </div>

      </div>

      )}

    </main>
  );
}