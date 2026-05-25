"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Building2, Check, LogOut } from "lucide-react";

const campaigns = [
  "Commercial Cleaning",
  "Roofing",
  "Solar",
  "Real Estate",
  "SaaS",
  "Cold Outreach",
];

export default function SelectCampaignPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("");

  useEffect(() => {
    const savedRole = localStorage.getItem("crmRole");
    const savedUserId = localStorage.getItem("crmUserId");

    if (!savedRole || !savedUserId) {
      router.push("/login");
      return;
    }

    setRole(savedRole);
    setUserId(savedUserId);
  }, [router]);

  function handleContinue() {
    if (!selectedCampaign) return;

    localStorage.setItem("crmCampaign", selectedCampaign);

    if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  }

  function handleLogout() {
    localStorage.removeItem("crmRole");
    localStorage.removeItem("crmUserId");
    localStorage.removeItem("crmCampaign");
    router.push("/login");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#03060b] px-6 py-8 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:70px_70px]" />
      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[130px]" />

      <div className="relative w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Image
            src="/crm-logo.png"
            alt="CRM by LeadsRift"
            width={220}
            height={80}
            priority
            className="h-auto w-[190px]"
          />

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-cyan-300/15 bg-white/[0.035] px-4 py-2 text-xs font-semibold text-slate-400 transition hover:border-cyan-300/30 hover:text-white"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>

        <section className="rounded-[2rem] border border-cyan-300/20 bg-white/[0.035] p-7 shadow-[0_0_70px_rgba(34,211,238,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-3 border-b border-cyan-300/10 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                Campaign Selection
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight">
                Welcome, {userId || "Agent"}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Choose the campaign you want to work on today.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-300/15 bg-black/25 px-4 py-3 text-right">
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                Role
              </p>
              <p className="mt-1 text-sm font-bold uppercase text-cyan-300">
                {role || "Agent"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {campaigns.map((campaign) => {
              const active = selectedCampaign === campaign;

              return (
                <button
                  key={campaign}
                  type="button"
                  onClick={() => setSelectedCampaign(campaign)}
                  className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition ${
                    active
                      ? "border-cyan-300/60 bg-cyan-400/10 shadow-[0_0_35px_rgba(34,211,238,0.18)]"
                      : "border-cyan-300/15 bg-black/25 hover:border-cyan-300/35 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl transition group-hover:bg-cyan-400/20" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/15 bg-black/35 text-cyan-300">
                      <Building2 size={18} />
                    </div>

                    {active && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-300 text-black">
                        <Check size={16} />
                      </div>
                    )}
                  </div>

                  <h2 className="relative mt-5 text-base font-bold">
                    {campaign}
                  </h2>

                  <p className="relative mt-2 text-xs leading-5 text-slate-500">
                    Load dashboard data, leads, calls and tasks for this campaign.
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-7 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Campaign can be changed after logout.
            </p>

            <button
              onClick={handleContinue}
              disabled={!selectedCampaign}
              className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-black tracking-[0.22em] transition ${
                selectedCampaign
                  ? "bg-cyan-400 text-black shadow-[0_0_30px_rgba(34,211,238,0.30)] hover:bg-cyan-300"
                  : "cursor-not-allowed border border-cyan-300/10 bg-white/[0.03] text-slate-600"
              }`}
            >
              CONTINUE
              <ArrowRight size={15} />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}