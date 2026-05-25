"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, Lock, Shield, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState("agent");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    if (!userId.trim() || !password.trim()) return;

    localStorage.setItem("crmRole", role);
    localStorage.setItem("crmUserId", userId.trim());
    localStorage.removeItem("crmCampaign");

    if (role === "admin") {
      router.push("/admin");
      return;
    }

    router.push("/select-campaign");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#03060b] px-6 py-8 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:70px_70px]" />
      <div className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[120px]" />

      <div className="relative w-full max-w-[350px]">
        <div className="mb-3 flex justify-center">
          <Image
            src="/crm-logo.png"
            alt="CRM"
            width={240}
            height={80}
            priority
            className="h-auto w-[185px]"
          />
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-[2rem] border border-cyan-300/20 bg-white/[0.035] p-5 shadow-[0_0_60px_rgba(34,211,238,0.08)] backdrop-blur-xl"
        >
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
            <p className="mt-2 text-xs text-slate-400">
              Login to continue into CRM
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 rounded-2xl border border-cyan-300/15 bg-black/30 p-1">
            <button
              type="button"
              onClick={() => setRole("agent")}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold transition ${
                role === "agent"
                  ? "bg-cyan-400/15 text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.20)]"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              <User size={15} />
              AGENT
            </button>

            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold transition ${
                role === "admin"
                  ? "bg-cyan-400/15 text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.20)]"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              <Shield size={15} />
              ADMIN
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <label className="block rounded-2xl border border-cyan-300/15 bg-black/25 px-4 py-3">
              <span className="text-[11px] text-slate-400">
                {role === "admin" ? "Admin ID" : "Agent ID"}
              </span>

              <div className="mt-2 flex items-center gap-3">
                <User size={16} className="text-slate-500" />
                <input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={role === "admin" ? "Enter admin ID" : "Enter agent ID"}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                />
              </div>
            </label>

            <label className="block rounded-2xl border border-cyan-300/15 bg-black/25 px-4 py-3">
              <span className="text-[11px] text-slate-400">Password</span>

              <div className="mt-2 flex items-center gap-3">
                <Lock size={16} className="text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                />
                <Eye size={15} className="text-slate-500" />
              </div>
            </label>
          </div>

          <button
            type="submit"
            className="mt-5 w-full rounded-2xl border border-cyan-300/30 bg-cyan-400 py-3 text-xs font-black tracking-[0.25em] text-black shadow-[0_0_30px_rgba(34,211,238,0.30)] transition hover:bg-cyan-300"
          >
            LOGIN
          </button>

          <div className="mt-5 text-center text-[11px] text-slate-500">
            CRM by <span className="ml-1 text-cyan-300">LeadsRift</span>
          </div>
        </form>
      </div>
    </main>
  );
}