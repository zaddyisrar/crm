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
  Moon,
  Sun,
  BookOpen,
  X,
  UserRound,
  Users,
  ShieldCheck,
  BriefcaseBusiness,
  ChevronRight,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                              LOGIN ROLES                                   */
/* -------------------------------------------------------------------------- */

const LEGACY_ROLES = [
  "agent",
  "manager",
  "admin",
  "client",
];

/* -------------------------------------------------------------------------- */
/*                              AUTHENTICATION                                */
/* -------------------------------------------------------------------------- */

async function authenticateUser(
  userId,
  password
) {
  let firstError = null;

  /*
    First try role-less login.

    If the current Apps Script still
    requires a role, fallback silently.
  */

  try {
    const response =
      await sheetsPost({
        action: "login",
        agentId: userId,
        password,
      });

    if (response?.user) {
      return response;
    }
  } catch (error) {
    firstError = error;
  }

  /*
    Client IDs normally begin CL-,
    so check client first for those IDs.
  */

  const fallbackRoles =
    userId.startsWith("CL-")
      ? [
          "client",
          "agent",
          "manager",
          "admin",
        ]
      : LEGACY_ROLES;

  let lastError = firstError;

  for (const role of fallbackRoles) {
    try {
      const response =
        await sheetsPost({
          action: "login",
          agentId: userId,
          password,
          role,
        });

      if (response?.user) {
        return response;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*                                NORMALIZERS                                 */
/* -------------------------------------------------------------------------- */

function normalizeRole(user) {
  return String(
    user?.role ||
      user?.Role ||
      user?.userRole ||
      user?.UserRole ||
      ""
  )
    .trim()
    .toLowerCase();
}

function normalizeUserId(
  user,
  fallbackId
) {
  return String(
    user?.agentId ||
      user?.AgentID ||
      user?.userId ||
      user?.UserID ||
      fallbackId
  )
    .trim()
    .toUpperCase();
}

function normalizeUserName(user) {
  return (
    user?.agentName ||
    user?.AgentName ||
    user?.userName ||
    user?.UserName ||
    user?.name ||
    user?.Name ||
    "User"
  );
}

/* -------------------------------------------------------------------------- */
/*                                REDIRECTS                                   */
/* -------------------------------------------------------------------------- */

function getDestination(role) {
  if (role === "admin") {
    return "/admin";
  }

  if (role === "manager") {
    return "/manager";
  }

  if (role === "agent") {
    return "/dashboard";
  }

  if (role === "client") {
    return "/client";
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*                              GUIDE DATA                                    */
/* -------------------------------------------------------------------------- */

const CRM_GUIDE = [
  {
    role: "Agent",
    icon: UserRound,
    description:
      "Manage daily outreach and submit qualified leads.",
    items: [
      "Select the client you are working for",
      "Add and submit new leads",
      "Track your lead activity",
      "Manage work status and attendance",
    ],
  },

  {
    role: "Manager",
    icon: Users,
    description:
      "Manage the team and review lead performance.",
    items: [
      "Monitor agents and activity",
      "Review submitted leads",
      "Approve or reject leads",
      "Track commissions and reports",
    ],
  },

  {
    role: "Admin",
    icon: ShieldCheck,
    description:
      "Control CRM accounts, clients and operations.",
    items: [
      "Manage agents and managers",
      "Manage client accounts",
      "Review attendance and payroll",
      "Access overall CRM analytics",
    ],
  },

  {
    role: "Client",
    icon: BriefcaseBusiness,
    description:
      "View leads generated specifically for your business.",
    items: [
      "See your total generated leads",
      "Track approved and pending leads",
      "Open complete lead details",
      "Manage profile and availability",
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*                             GUIDE CARD                                     */
/* -------------------------------------------------------------------------- */

function GuideCard({
  role,
  icon: Icon,
  description,
  items,
  isLight,
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        isLight
          ? "border-slate-200 bg-white/70"
          : "border-white/[0.07] bg-black/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            isLight
              ? "border-cyan-300/40 bg-cyan-50 text-cyan-600"
              : "border-cyan-300/15 bg-cyan-300/10 text-cyan-300"
          }`}
        >
          <Icon size={17} />
        </div>

        <div>
          <h3
            className={`text-sm font-black ${
              isLight
                ? "text-slate-800"
                : "text-white"
            }`}
          >
            {role}
          </h3>

          <p
            className={`mt-1 text-[10px] leading-4 ${
              isLight
                ? "text-slate-500"
                : "text-slate-500"
            }`}
          >
            {description}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-start gap-2"
          >
            <CheckCircle2
              size={11}
              className="mt-0.5 shrink-0 text-cyan-400"
            />

            <p
              className={`text-[10px] leading-4 ${
                isLight
                  ? "text-slate-600"
                  : "text-slate-400"
              }`}
            >
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                LOGIN PAGE                                  */
/* -------------------------------------------------------------------------- */

export default function LoginPage() {
  const router = useRouter();

  const [userId, setUserId] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [remember, setRemember] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [theme, setTheme] =
    useState("dark");

  const [
    guideOpen,
    setGuideOpen,
  ] = useState(false);

  /* ---------------------------------------------------------------------- */
  /*                             LOAD SETTINGS                              */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const savedId =
      localStorage.getItem(
        "crmRememberId"
      );

    const savedTheme =
      localStorage.getItem(
        "crmLoginTheme"
      );

    localStorage.removeItem(
      "crmRememberRole"
    );

    if (savedId) {
      setUserId(savedId);
      setRemember(true);
    }

    if (
      savedTheme === "light" ||
      savedTheme === "dark"
    ) {
      setTheme(savedTheme);
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                               THEME                                    */
  /* ---------------------------------------------------------------------- */

  function toggleTheme() {
    const nextTheme =
      theme === "dark"
        ? "light"
        : "dark";

    setTheme(nextTheme);

    localStorage.setItem(
      "crmLoginTheme",
      nextTheme
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                                LOGIN                                   */
  /* ---------------------------------------------------------------------- */

  async function handleLogin(e) {
    e.preventDefault();

    if (loading) return;

    setError("");

    const cleanUserId = userId
      .trim()
      .toUpperCase();

    const cleanPassword =
      password.trim();

    if (!cleanUserId) {
      setError(
        "Please enter your CRM ID."
      );

      return;
    }

    if (!cleanPassword) {
      setError(
        "Please enter your password."
      );

      return;
    }

    setLoading(true);

    try {
      const loginResponse =
        await authenticateUser(
          cleanUserId,
          cleanPassword
        );

      const foundUser =
        loginResponse?.user;

      if (!foundUser) {
        setError(
          "Invalid CRM ID or password."
        );

        setLoading(false);

        return;
      }

      const finalRole =
        normalizeRole(foundUser);

      const finalUserId =
        normalizeUserId(
          foundUser,
          cleanUserId
        );

      const finalUserName =
        normalizeUserName(
          foundUser
        );

      const destination =
        getDestination(finalRole);

      if (!destination) {
        console.error(
          "Invalid CRM role:",
          finalRole
        );

        setError(
          "Your account does not have a valid CRM role."
        );

        setLoading(false);

        return;
      }

      /* -------------------------------------------------------------- */
      /* AGENT ATTENDANCE ONLY                                          */
      /* -------------------------------------------------------------- */

      if (finalRole === "agent") {
        const attendanceResponse =
          await sheetsPost({
            action:
              "attendanceLogin",

            agentId:
              finalUserId,

            agentName:
              finalUserName,

            status: "Active",
          });

        if (
          !attendanceResponse?.success
        ) {
          setError(
            attendanceResponse?.message ||
              "Attendance login failed."
          );

          setLoading(false);

          return;
        }

        localStorage.setItem(
          `crmCurrentStatus:${finalUserId}`,
          "Active"
        );
      }

      /* -------------------------------------------------------------- */
      /* REMEMBER ID                                                    */
      /* -------------------------------------------------------------- */

      if (remember) {
        localStorage.setItem(
          "crmRememberId",
          finalUserId
        );
      } else {
        localStorage.removeItem(
          "crmRememberId"
        );
      }

      localStorage.removeItem(
        "crmRememberRole"
      );

      /* -------------------------------------------------------------- */
      /* SESSION                                                        */
      /* -------------------------------------------------------------- */

      localStorage.setItem(
        "crmRole",
        finalRole
      );

      localStorage.setItem(
        "crmUserId",
        finalUserId
      );

      localStorage.setItem(
        "crmUserName",
        finalUserName
      );

      if (finalRole === "client") {
        localStorage.setItem(
          "crmClientId",
          finalUserId
        );
      } else {
        localStorage.removeItem(
          "crmClientId"
        );
      }

      /* -------------------------------------------------------------- */
      /* REDIRECT                                                       */
      /* -------------------------------------------------------------- */

      router.replace(destination);
    } catch (err) {
      console.error(
        "Login failed:",
        err
      );

      const message =
        err?.message || "";

      if (
        message
          .toLowerCase()
          .includes("invalid")
      ) {
        setError(
          "Invalid CRM ID or password."
        );
      } else {
        setError(
          message ||
            "Login failed. Please try again."
        );
      }

      setLoading(false);
    }
  }

  const isLight =
    theme === "light";

  /* ---------------------------------------------------------------------- */
  /*                                  UI                                    */
  /* ---------------------------------------------------------------------- */

  return (
    <main
      className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${
        isLight
          ? "bg-[#f8fcff] text-slate-800"
          : "bg-[#020814] text-white"
      }`}
    >
      {/* Background Glow */}

      <div
        className={`absolute inset-0 ${
          isLight
            ? "bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.20),transparent_34%)]"
            : "bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_36%)]"
        }`}
      />

      {/* Login */}

      <section className="relative z-10 flex h-screen items-center justify-center overflow-hidden px-5">
        <div className="w-full max-w-[330px] origin-center scale-[0.85]">
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

            {/* Theme */}

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
                {isLight ? (
                  <Moon size={13} />
                ) : (
                  <Sun size={13} />
                )}

                {isLight
                  ? "Dark"
                  : "Light"}
              </button>
            </div>

            {/* Logo */}

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

            {/* Heading */}

            <div className="mt-5 text-center">
              <h1 className="text-2xl font-black tracking-tight">
                <span className="text-cyan-400">
                  Welcome
                </span>{" "}

                <span
                  className={
                    isLight
                      ? "text-slate-700"
                      : "text-white"
                  }
                >
                  Back
                </span>
              </h1>

              <p
                className={`mt-2 text-xs font-medium ${
                  isLight
                    ? "text-slate-500"
                    : "text-slate-400"
                }`}
              >
                Login to continue into CRM
              </p>
            </div>

            {/* Error */}

            {error && (
              <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 p-3 text-center text-xs font-bold text-red-400">
                {error}
              </div>
            )}

            {/* Inputs */}

            <div className="mt-5 space-y-3">
              {/* CRM ID */}

              <div
                className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition focus-within:border-cyan-300 ${
                  isLight
                    ? "border-slate-200 bg-white/60"
                    : "border-cyan-300/18 bg-black/20"
                }`}
              >
                <User
                  className="text-slate-500"
                  size={18}
                />

                <input
                  value={userId}
                  onChange={(e) => {
                    setUserId(
                      e.target.value
                    );

                    setError("");
                  }}
                  placeholder="CRM ID"
                  autoComplete="username"
                  disabled={loading}
                  className={`w-full bg-transparent text-sm font-medium outline-none ${
                    isLight
                      ? "text-slate-700 placeholder:text-slate-400"
                      : "text-white placeholder:text-slate-500"
                  }`}
                />
              </div>

              {/* Password */}

              <div
                className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition focus-within:border-cyan-300 ${
                  isLight
                    ? "border-slate-200 bg-white/60"
                    : "border-cyan-300/18 bg-black/20"
                }`}
              >
                <Lock
                  className="text-slate-500"
                  size={18}
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(
                      e.target.value
                    );

                    setError("");
                  }}
                  placeholder="Password"
                  autoComplete="current-password"
                  disabled={loading}
                  className={`w-full bg-transparent text-sm font-medium outline-none ${
                    isLight
                      ? "text-slate-700 placeholder:text-slate-400"
                      : "text-white placeholder:text-slate-500"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  disabled={loading}
                  className="text-slate-500 transition hover:text-cyan-400"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember */}

            <div
              className={`mt-4 flex items-center justify-between gap-3 text-xs ${
                isLight
                  ? "text-slate-600"
                  : "text-slate-300"
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  setRemember(
                    !remember
                  )
                }
                disabled={loading}
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

              {/* CRM GUIDE */}

              <button
                type="button"
                onClick={() =>
                  setGuideOpen(true)
                }
                className="flex items-center gap-1.5 font-bold text-cyan-400 transition hover:text-cyan-300"
              >
                <BookOpen size={13} />

                CRM Guide
              </button>
            </div>

            {/* Login Button */}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-300 py-3.5 text-xs font-black uppercase tracking-wide text-black shadow-[0_0_35px_rgba(34,211,238,0.34)] transition hover:scale-[1.015] hover:shadow-[0_0_55px_rgba(34,211,238,0.48)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading
                ? "AUTHENTICATING..."
                : "LOGIN"}
            </button>
          </form>

          {/* Footer */}

          <div className="mt-5 flex items-center justify-center">
            <div className="h-px w-28 bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
          </div>

          <p
            className={`mt-3 text-center text-[10px] font-medium uppercase tracking-[0.14em] ${
              isLight
                ? "text-slate-500"
                : "text-slate-400"
            }`}
          >
            V5.2.1 Powered by{" "}
            <span className="text-cyan-400">
              LeadsRift
            </span>
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* CRM GUIDE MODAL                                                  */}
      {/* ---------------------------------------------------------------- */}

      {guideOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          onClick={() =>
            setGuideOpen(false)
          }
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            className={`max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[1.8rem] border shadow-[0_35px_120px_rgba(0,0,0,0.7)] ${
              isLight
                ? "border-cyan-300/40 bg-[#f8fcff]"
                : "border-cyan-300/15 bg-[#06111f]"
            }`}
          >
            {/* Guide Header */}

            <div
              className={`sticky top-0 z-10 flex items-start justify-between gap-4 border-b px-5 py-5 backdrop-blur-xl ${
                isLight
                  ? "border-slate-200 bg-[#f8fcff]/95"
                  : "border-white/[0.07] bg-[#06111f]/95"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300">
                  <LayoutDashboard
                    size={19}
                  />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">
                    CRM Guide
                  </p>

                  <h2
                    className={`mt-1 text-xl font-black ${
                      isLight
                        ? "text-slate-800"
                        : "text-white"
                    }`}
                  >
                    Welcome to LeadsRift CRM
                  </h2>

                  <p
                    className={`mt-1 max-w-xl text-[10px] leading-5 ${
                      isLight
                        ? "text-slate-500"
                        : "text-slate-500"
                    }`}
                  >
                    Your dashboard automatically changes
                    based on your assigned CRM role.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setGuideOpen(false)
                }
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-500 hover:text-red-500"
                    : "border-white/[0.07] bg-black/20 text-slate-400 hover:text-red-300"
                }`}
              >
                <X size={15} />
              </button>
            </div>

            {/* Guide Body */}

            <div className="p-5">
              {/* How Login Works */}

              <div
                className={`mb-5 rounded-2xl border p-4 ${
                  isLight
                    ? "border-cyan-200 bg-cyan-50/60"
                    : "border-cyan-300/10 bg-cyan-300/[0.035]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lock
                    size={13}
                    className="text-cyan-400"
                  />

                  <p className="text-[9px] font-black uppercase tracking-[0.17em] text-cyan-400">
                    How Login Works
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-bold">
                  <span
                    className={
                      isLight
                        ? "text-slate-600"
                        : "text-slate-400"
                    }
                  >
                    Enter CRM ID + Password
                  </span>

                  <ChevronRight
                    size={12}
                    className="text-cyan-400"
                  />

                  <span
                    className={
                      isLight
                        ? "text-slate-600"
                        : "text-slate-400"
                    }
                  >
                    CRM detects your role
                  </span>

                  <ChevronRight
                    size={12}
                    className="text-cyan-400"
                  />

                  <span className="text-cyan-400">
                    Correct dashboard opens
                  </span>
                </div>
              </div>

              {/* Roles */}

              <div className="grid gap-3 md:grid-cols-2">
                {CRM_GUIDE.map(
                  (guide) => (
                    <GuideCard
                      key={guide.role}
                      {...guide}
                      isLight={
                        isLight
                      }
                    />
                  )
                )}
              </div>

              {/* Help */}

              <div
                className={`mt-5 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                  isLight
                    ? "border-slate-200 bg-white"
                    : "border-white/[0.06] bg-black/20"
                }`}
              >
                <div>
                  <p
                    className={`text-xs font-black ${
                      isLight
                        ? "text-slate-700"
                        : "text-white"
                    }`}
                  >
                    Need access assistance?
                  </p>

                  <p
                    className={`mt-1 text-[10px] ${
                      isLight
                        ? "text-slate-500"
                        : "text-slate-500"
                    }`}
                  >
                    Contact your CRM administrator if
                    you don&apos;t know your CRM ID or
                    assigned role.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setGuideOpen(false)
                  }
                  className="shrink-0 rounded-xl bg-cyan-300 px-5 py-2.5 text-[10px] font-black uppercase tracking-wide text-black transition hover:bg-cyan-200"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}