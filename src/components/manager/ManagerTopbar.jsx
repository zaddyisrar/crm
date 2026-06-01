"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function getTodayDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ManagerTopbar() {
  const [managerName, setManagerName] = useState("Manager");

  useEffect(() => {
    const storedName = localStorage.getItem("crmUserName");
    if (storedName) setManagerName(storedName);
  }, []);

  return (
    <div className="mb-6 rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-5 backdrop-blur-xl">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/crm-logo.png"
            alt="CRM"
            width={180}
            height={60}
            priority
            className="h-auto w-[145px]"
          />

          <div className="hidden h-10 w-px bg-cyan-300/20 lg:block" />

          <div>
            <h1 className="text-2xl font-black text-white">
              {getGreeting()}, {managerName}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manager Control Center
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-2xl border border-cyan-300/15 bg-black/20 px-4 py-3 text-sm text-slate-300">
            {getTodayDate()}
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-300">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
            Active
          </div>
        </div>
      </div>
    </div>
  );
}