"use client";

import { users } from "@/data/users";
import { sheetsPost } from "@/lib/sheetsApi";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState("agent");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    const cleanUserId = userId.trim().toUpperCase();

    const foundUser = users.find(
      (user) =>
        user.id.toUpperCase() === cleanUserId &&
        user.password === password.trim() &&
        user.role === role
    );

    if (!foundUser) {
      setError("Invalid ID or Password");
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

          console.log("Check-in synced to Google Sheets");
        } catch (err) {
          console.error("Google Sheets check-in failed:", err);
        }
      }
    }

    localStorage.setItem("crmRole", foundUser.role);
    localStorage.setItem("crmUserId", foundUser.id);
    localStorage.setItem("crmUserName", foundUser.name);

    if (foundUser.role === "admin") {
      router.replace("/admin");
      return;
    }

    router.replace("/dashboard");
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
          className="rounded-[2rem] border border-cyan-300/20 bg-white/[0.035] p-5 backdrop-blur-xl"
        >
          <div className="text-center">
            <h1 className="text-2xl font-bold">Welcome Back</h1>

            <p className="mt-2 text-xs text-slate-400">
              Login to continue into CRM
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 rounded-2xl border border-cyan-300/15 bg-black/30 p-1">
            <button
              type="button"
              onClick={() => {
                setRole("agent");
                setError("");
              }}
              className={`rounded-xl py-3 text-xs ${
                role === "agent"
                  ? "bg-cyan-400/15 text-cyan-300"
                  : "text-slate-500"
              }`}
            >
              AGENT
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("admin");
                setError("");
              }}
              className={`rounded-xl py-3 text-xs ${
                role === "admin"
                  ? "bg-cyan-400/15 text-cyan-300"
                  : "text-slate-500"
              }`}
            >
              ADMIN
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <div className="mt-4 space-y-4">
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={role === "admin" ? "Admin ID" : "Agent ID"}
              className="w-full rounded-xl border border-cyan-300/15 bg-black/20 px-4 py-3 outline-none"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-cyan-300/15 bg-black/20 px-4 py-3 outline-none"
            />
          </div>

          <button
            type="submit"
            className="mt-5 w-full rounded-2xl bg-cyan-400 py-3 text-xs font-black text-black"
          >
            LOGIN
          </button>
        </form>
      </div>
    </main>
  );
}