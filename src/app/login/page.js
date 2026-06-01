"use client";

import { users } from "@/data/agents";
import { sheetsPost } from "@/lib/sheetsApi";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  ShieldCheck,
  Zap,
  Crosshair,
} from "lucide-react";

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState("agent");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedId = localStorage.getItem("crmRememberId");
    const savedRole = localStorage.getItem("crmRememberRole");

    if (savedId) {
      setUserId(savedId);
      setRemember(true);
    }

    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    const cleanUserId = userId.trim().toUpperCase();
    const cleanPassword = password.trim();

    const foundUser = users.find(
      (item) =>
        item.id.toUpperCase() === cleanUserId &&
        item.password === cleanPassword &&
        item.role === role
    );

    if (!foundUser) {
      setError("Invalid ID, password, or role.");
      return;
    }

    const today = getTodayKey();

    if (foundUser.role === "agent") {
      const checkedOutDate = localStorage.getItem(
        `crmCheckedOutDate:${cleanUserId}`
      );

      if (checkedOutDate === today) {
        setError("You already checked out today.");
        return;
      }

      const previousCheckDate = localStorage.getItem(
        `crmCheckInDate:${cleanUserId}`
      );

      if (previousCheckDate !== today) {
        localStorage.removeItem(`crmCheckInTime:${cleanUserId}`);
        localStorage.removeItem(`crmCheckOutTime:${cleanUserId}`);
      }

      if (!localStorage.getItem(`crmCheckInTime:${cleanUserId}`)) {
        const checkInTime = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        localStorage.setItem(`crmCheckInTime:${cleanUserId}`, checkInTime);
        localStorage.setItem(`crmCheckInDate:${cleanUserId}`, today);

        try {
          await sheetsPost({
            action: "checkIn",
            agentId: foundUser.id,
            name: foundUser.name,
            date: today,
            checkIn: checkInTime,
          });
        } catch (err) {
          console.error("Google Sheets check-in failed:", err);
        }
      }
    }

    if (remember) {
      localStorage.setItem("crmRememberId", cleanUserId);
      localStorage.setItem("crmRememberRole", role);
    } else {
      localStorage.removeItem("crmRememberId");
      localStorage.removeItem("crmRememberRole");
    }

    localStorage.setItem("crmRole", foundUser.role);
    localStorage.setItem("crmUserId", foundUser.id);
    localStorage.setItem("crmUserName", foundUser.name);

    if (foundUser.role === "admin") return router.push("/admin");
    if (foundUser.role === "manager") return router.push("/manager");

    router.push("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02070c] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.045)_1px,transparent_1px)] bg-[size:70px_70px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_45%,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_78%_45%,rgba(34,211,238,0.08),transparent_34%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(34,211,238,0.75)_1px,transparent_1px)] bg-[size:165px_165px] opacity-35" />

      <div className="absolute bottom-[-130px] left-[-60px] h-[300px] w-[650px] rounded-[50%] border border-cyan-300/60 bg-cyan-400/5 shadow-[0_0_70px_rgba(34,211,238,0.32)]" />

      <div className="absolute bottom-0 left-[42%] top-0 hidden w-px bg-cyan-300/35 shadow-[0_0_30px_rgba(34,211,238,0.7)] lg:block" />

      <div className="relative grid min-h-screen lg:grid-cols-[47%_53%]">
        <section className="hidden flex-col justify-center -mt-16 px-12 lg:flex">
          <div className="max-w-[430px]">
            <Image
              src="/crm-logo.png"
              alt="LeadsRift CRM"
              width={560}
              height={130}
              priority
              className="h-auto w-[450px]"
            />

            <p className="mt-7 text-[13px] font-medium uppercase tracking-[0.45em] text-slate-300">
              Outbound Growth Operating System
            </p>

            <div className="mt-7 h-[2px] w-16 bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.9)]" />

            <p className="mt-7 max-w-[340px] text-lg leading-relaxed text-slate-300">
              Powering outbound teams to find, connect and convert more leads
              into customers.
            </p>

            <div className="mt-20 flex items-center gap-5 text-sm font-bold text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-cyan-300" size={21} />
                Secure
              </div>

              <div className="h-6 w-px bg-slate-500" />

              <div className="flex items-center gap-2">
                <Zap className="text-cyan-300" size={21} />
                Fast
              </div>

              <div className="h-6 w-px bg-slate-500" />

              <div className="flex items-center gap-2">
                <Crosshair className="text-cyan-300" size={21} />
                Focused
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center -mt-6 px-5 py-8 lg:px-12">
          <div className="w-full max-w-[430px]">
            <div className="mb-7 flex justify-center lg:hidden">
              <Image
                src="/crm-logo.png"
                alt="LeadsRift CRM"
                width={420}
                height={100}
                priority
                className="h-auto w-[310px]"
              />
            </div>

            <form
              onSubmit={handleLogin}
              className="rounded-[2rem] border border-cyan-300/30 bg-white/[0.035] px-7 py-8 shadow-[0_0_55px_rgba(34,211,238,0.12)] backdrop-blur-2xl"
            >
              <div>
                <h1 className="text-center text-3xl font-black">
                  Welcome Back
                </h1>

                <p className="mt-3 text-center text-base text-slate-400">
                  Login to continue into CRM
                </p>
              </div>

              <div className="mt-6 grid grid-cols-3 rounded-2xl border border-cyan-300/15 bg-black/30 p-1">
                {["agent", "manager", "admin"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setRole(item);
                      setError("");
                    }}
                    className={`rounded-xl py-3 text-xs font-black uppercase transition ${
                      role === item
                        ? "bg-cyan-400/15 text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.35)]"
                        : "text-slate-400 hover:text-cyan-300"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 p-3 text-center text-xs font-bold text-red-300">
                  {error}
                </div>
              )}

              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3 rounded-2xl border border-cyan-300/20 bg-black/30 px-4 py-3.5">
                  <User className="text-slate-400" size={20} />

                  <input
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder={
                      role === "admin"
                        ? "Admin ID"
                        : role === "manager"
                        ? "Manager ID"
                        : "Agent ID"
                    }
                    className="w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-cyan-300/20 bg-black/30 px-4 py-3.5">
                  <Lock className="text-slate-400" size={20} />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-cyan-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => setRemember(!remember)}
                  className="flex items-center gap-2 text-slate-300"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded border text-xs font-black ${
                      remember
                        ? "border-cyan-300 bg-cyan-400/20 text-cyan-300"
                        : "border-slate-400"
                    }`}
                  >
                    {remember && "✓"}
                  </span>
                  Remember me
                </button>

                <button
                  type="button"
                  className="font-bold text-cyan-300 hover:text-cyan-200"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-300 py-4 text-sm font-black text-black shadow-[0_0_35px_rgba(34,211,238,0.35)] transition hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(34,211,238,0.5)]"
              >
                LOGIN
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}