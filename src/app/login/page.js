"use client";

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
  Users,
  Moon,
  Sun,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState("agent");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedId = localStorage.getItem("crmRememberId");
    const savedRole = localStorage.getItem("crmRememberRole");
    const savedTheme = localStorage.getItem("crmLoginTheme");

    if (savedId) {
      setUserId(savedId);
      setRemember(true);
    }

    if (savedRole) {
      setRole(savedRole);
    }

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("crmLoginTheme", nextTheme);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanUserId = userId.trim().toUpperCase();
    const cleanPassword = password.trim();

    try {
      const loginResponse = await sheetsPost({
        action: "login",
        agentId: cleanUserId,
        password: cleanPassword,
        role,
      });

      const foundUser = loginResponse.user;

      if (!foundUser) {
        setError(loginResponse.message || "Invalid ID, password, or role.");
        setLoading(false);
        return;
      }

      const finalRole = String(foundUser.role || role).toLowerCase();
      const finalUserId = String(foundUser.agentId || cleanUserId).toUpperCase();
      const finalUserName = foundUser.agentName || "User";

      if (finalRole === "agent") {
        const attendanceResponse = await sheetsPost({
          action: "attendanceLogin",
          agentId: finalUserId,
          agentName: finalUserName,
          status: "Active",
        });

        if (!attendanceResponse.success) {
          setError(attendanceResponse.message || "Attendance login failed.");
          setLoading(false);
          return;
        }
      }

      if (remember) {
        localStorage.setItem("crmRememberId", finalUserId);
        localStorage.setItem("crmRememberRole", finalRole);
      } else {
        localStorage.removeItem("crmRememberId");
        localStorage.removeItem("crmRememberRole");
      }

      localStorage.setItem("crmRole", finalRole);
      localStorage.setItem("crmUserId", finalUserId);
      localStorage.setItem("crmUserName", finalUserName);

      if (finalRole === "admin") {
        router.push("/admin");
        return;
      }

      if (finalRole === "manager") {
        router.push("/manager");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Login failed. Please try again.");
      setLoading(false);
    }
  }

  const isLight = theme === "light";

  const roles = [
    { key: "agent", label: "Agent", icon: User },
    { key: "manager", label: "Manager", icon: Users },
    { key: "admin", label: "Admin", icon: ShieldCheck },
  ];

  return (
    <main
      className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${
        isLight ? "bg-[#f8fcff] text-slate-800" : "bg-[#020814] text-white"
      }`}
    >
      <div
        className={`absolute inset-0 ${
          isLight
            ? "bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.20),transparent_34%)]"
            : "bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_36%)]"
        }`}
      />

      <section className="relative z-10 flex h-screen items-center justify-center overflow-hidden px-5">
        <div className="w-full max-w-[330px] scale-[0.8] origin-center">
          <form
            onSubmit={handleLogin}
            className={`relative overflow-hidden rounded-[1.7rem] border px-5 py-5 backdrop-blur-2xl transition-all duration-500 sm:px-6 sm:py-6 ${
              isLight
                ? "border-cyan-300/55 bg-white/72 shadow-[0_22px_70px_rgba(15,23,42,0.12),0_0_55px_rgba(34,211,238,0.24)]"
                : "border-cyan-300/55 bg-[#06111f]/82 shadow-[0_28px_90px_rgba(0,0,0,0.56),0_0_60px_rgba(34,211,238,0.24)]"
            }`}
          >
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
            <div className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl" />

            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={toggleTheme}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] transition hover:scale-[1.03] ${
                  isLight
                    ? "border-cyan-300/50 bg-white/70 text-slate-700"
                    : "border-cyan-300/25 bg-white/[0.04] text-cyan-200"
                }`}
              >
                {isLight ? <Moon size={13} /> : <Sun size={13} />}
                {isLight ? "Dark" : "Light"}
              </button>
            </div>

            <div className="flex justify-center">
              <Image
                src="/crm-logo.png"
                alt="LeadsRift CRM"
                width={230}
                height={70}
                priority
                className="h-auto w-[150px]"
              />
            </div>

            <div className="mt-5 text-center">
              <h1 className="text-2xl font-black tracking-tight">
                <span className="text-cyan-400">Welcome</span>{" "}
                <span className={isLight ? "text-slate-700" : "text-white"}>
                  Back
                </span>
              </h1>

              <p
                className={`mt-2 text-xs font-medium ${
                  isLight ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Login to continue into CRM
              </p>
            </div>

            <div
              className={`mt-5 grid grid-cols-3 overflow-hidden rounded-2xl border ${
                isLight
                  ? "border-slate-200 bg-white/55 shadow-inner"
                  : "border-cyan-300/18 bg-black/20"
              }`}
            >
              {roles.map(({ key, label, icon: Icon }) => {
                const active = role === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setRole(key);
                      setError("");
                    }}
                    className={`group flex flex-col items-center justify-center gap-1 border-r py-3 text-[10px] font-black uppercase transition last:border-r-0 ${
                      isLight ? "border-slate-200" : "border-cyan-300/12"
                    } ${
                      active
                        ? "border-cyan-300/70 bg-cyan-300/10 text-cyan-400 shadow-[inset_0_0_25px_rgba(34,211,238,0.1)]"
                        : isLight
                        ? "text-slate-500 hover:text-cyan-500"
                        : "text-slate-400 hover:text-cyan-300"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={active ? "text-cyan-400" : "opacity-80"}
                    />
                    {label}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 p-3 text-center text-xs font-bold text-red-400">
                {error}
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div
                className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition focus-within:border-cyan-300 focus-within:shadow-[0_0_25px_rgba(34,211,238,0.14)] ${
                  isLight
                    ? "border-slate-200 bg-white/60"
                    : "border-cyan-300/18 bg-black/20"
                }`}
              >
                <User className="text-slate-500" size={18} />

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
                  className={`w-full bg-transparent text-sm font-medium outline-none ${
                    isLight
                      ? "text-slate-700 placeholder:text-slate-400"
                      : "text-white placeholder:text-slate-500"
                  }`}
                />
              </div>

              <div
                className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition focus-within:border-cyan-300 focus-within:shadow-[0_0_25px_rgba(34,211,238,0.14)] ${
                  isLight
                    ? "border-slate-200 bg-white/60"
                    : "border-cyan-300/18 bg-black/20"
                }`}
              >
                <Lock className="text-slate-500" size={18} />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className={`w-full bg-transparent text-sm font-medium outline-none ${
                    isLight
                      ? "text-slate-700 placeholder:text-slate-400"
                      : "text-white placeholder:text-slate-500"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 transition hover:text-cyan-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div
              className={`mt-4 flex items-center justify-between gap-3 text-xs ${
                isLight ? "text-slate-600" : "text-slate-300"
              }`}
            >
              <button
                type="button"
                onClick={() => setRemember(!remember)}
                className="flex items-center gap-2 font-medium"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs font-black ${
                    remember
                      ? "border-cyan-300 bg-cyan-300/15 text-cyan-400"
                      : isLight
                      ? "border-slate-300"
                      : "border-slate-500"
                  }`}
                >
                  {remember && "✓"}
                </span>
                Remember me
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-300 py-3.5 text-xs font-black uppercase tracking-wide text-black shadow-[0_0_35px_rgba(34,211,238,0.34)] transition hover:scale-[1.015] hover:shadow-[0_0_55px_rgba(34,211,238,0.48)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? "AUTHENTICATING..." : "LOGIN"}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-center">
            <div className="h-px w-28 bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
          </div>

          <p
            className={`mt-3 text-center text-[10px] font-medium uppercase tracking-[0.14em] ${
              isLight ? "text-slate-500" : "text-slate-400"
            }`}
          >
            V5.2.1 Powered by <span className="text-cyan-400">LeadsRift </span>
          </p>
        </div>
      </section>
    </main>
  );
}