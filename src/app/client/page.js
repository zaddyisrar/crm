"use client";

import ClientSidebar from "@/components/client/ClientSidebar";
import { sheetsPost } from "@/lib/sheetsApi";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  LogOut,
  CalendarDays,
  Users,
  CheckCircle2,
  Search,
  Phone,
  Mail,
  MapPin,
  Building2,
  User,
  StickyNote,
  X,
  Clock3,
  Eye,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function getReadableDate() {
  return new Date().toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function formatDate(value) {
  if (!value) return "-";

  const raw = String(value).trim();

  /*
    Backend normally returns:
    YYYY-MM-DD
  */

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(raw)
  ) {
    const parsed = new Date(
      `${raw}T00:00:00`
    );

    return parsed.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  const parsed = new Date(raw);

  if (
    Number.isNaN(parsed.getTime())
  ) {
    return raw;
  }

  return parsed.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function getCurrentMonthKey() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  return `${year}-${month}`;
}

/* -------------------------------------------------------------------------- */
/*                            NORMALIZE BACKEND LEAD                          */
/* -------------------------------------------------------------------------- */

function normalizeLead(
  lead,
  index
) {
  return {
    id: `${lead.AgentID || "lead"}-${
      lead.Phone || index
    }-${lead.Date || index}`,

    date:
      lead.Date ||
      lead.date ||
      "",

    time:
      lead.Time ||
      lead.time ||
      "",

    agentId:
      lead.AgentID ||
      lead.agentId ||
      "",

    agentName:
      lead.AgentName ||
      lead.agentName ||
      "",

    leadName:
      lead.LeadName ||
      lead.leadName ||
      lead.Name ||
      lead.name ||
      "Unnamed Lead",

    company:
      lead.Company ||
      lead.company ||
      "",

    phone:
      lead.Phone ||
      lead.phone ||
      "",

    email:
      lead.Email ||
      lead.email ||
      "",

    address:
      lead.Address ||
      lead.address ||
      "",

    note:
      lead.Note ||
      lead.note ||
      "",

    status:
      lead.ApprovalStatus ||
      lead.approvalStatus ||
      lead.Status ||
      lead.status ||
      "Pending",

    approvedBy:
      lead.ApprovedBy ||
      lead.approvedBy ||
      "",

    approvedAt:
      lead.ApprovedAt ||
      lead.approvedAt ||
      "",
  };
}

/* -------------------------------------------------------------------------- */
/*                              STATUS BADGE                                  */
/* -------------------------------------------------------------------------- */

function StatusBadge({
  status,
}) {
  const normalized = String(
    status || ""
  )
    .trim()
    .toLowerCase();

  if (normalized === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-300">
        <CheckCircle2 size={11} />
        Approved
      </span>
    );
  }

  if (normalized === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-red-300">
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-yellow-200">
      <Clock3 size={11} />
      Pending
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                STAT CARD                                   */
/* -------------------------------------------------------------------------- */

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "cyan",
}) {
  const tones = {
    cyan: {
      border:
        "border-cyan-300/10",

      icon:
        "border-cyan-300/15 bg-cyan-300/10 text-cyan-300",
    },

    blue: {
      border:
        "border-blue-300/10",

      icon:
        "border-blue-400/15 bg-blue-400/10 text-blue-300",
    },

    emerald: {
      border:
        "border-emerald-300/10",

      icon:
        "border-emerald-400/15 bg-emerald-400/10 text-emerald-300",
    },
  };

  const selected =
    tones[tone] ||
    tones.cyan;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-[#071018]/75 px-5 py-5 backdrop-blur-xl ${selected.border}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight text-white">
            {value}
          </p>

          <p className="mt-1 text-[10px] text-slate-600">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${selected.icon}`}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              DETAIL ITEM                                   */
/* -------------------------------------------------------------------------- */

function DetailItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
      <div className="flex items-center gap-2">
        <Icon
          size={12}
          className="text-cyan-400"
        />

        <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-600">
          {label}
        </p>
      </div>

      <p className="mt-2 break-words text-xs font-semibold leading-5 text-slate-300">
        {value || "-"}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           CLIENT DASHBOARD                                 */
/* -------------------------------------------------------------------------- */

export default function ClientDashboardPage() {
  const router = useRouter();

  const [client, setClient] =
    useState({
      clientId: "",
      clientName: "",
      company: "",
      status: "",
    });

  const [leads, setLeads] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [
    selectedLead,
    setSelectedLead,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [error, setError] =
    useState("");

  /* ---------------------------------------------------------------------- */
  /*                           LOAD CLIENT LEADS                            */
  /* ---------------------------------------------------------------------- */

  async function loadClientLeads({
    silent = false,
  } = {}) {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const role =
        localStorage.getItem(
          "crmRole"
        );

      const clientId =
        localStorage.getItem(
          "crmClientId"
        ) ||
        localStorage.getItem(
          "crmUserId"
        );

      /*
      |--------------------------------------------------------------------------
      | CLIENT SESSION CHECK
      |--------------------------------------------------------------------------
      */

      if (
        role !== "client" ||
        !clientId
      ) {
        router.replace("/login");

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | GET ONLY THIS CLIENT'S LEADS
      |--------------------------------------------------------------------------
      */

      const response =
        await sheetsPost({
          action:
            "getClientLeads",

          clientId,
        });

      const backendClient =
        response?.client || {};

      const backendLeads =
        Array.isArray(
          response?.data
        )
          ? response.data
          : [];

      setClient({
        clientId:
          backendClient.clientId ||
          clientId,

        clientName:
          backendClient.clientName ||
          localStorage.getItem(
            "crmUserName"
          ) ||
          "Client",

        company:
          backendClient.company ||
          "",

        status:
          backendClient.status ||
          "Active",
      });

      setLeads(
        backendLeads.map(
          normalizeLead
        )
      );
    } catch (err) {
      console.error(
        "Failed to load client leads:",
        err
      );

      setError(
        err?.message ||
          "Unable to load your leads."
      );
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                             INITIAL LOAD                               */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    loadClientLeads();
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                                SEARCH                                  */
  /* ---------------------------------------------------------------------- */

  const filteredLeads =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      if (!query) {
        return leads;
      }

      return leads.filter(
        (lead) =>
          [
            lead.leadName,
            lead.company,
            lead.phone,
            lead.email,
            lead.address,
            lead.note,
            lead.status,
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(query)
          )
      );
    }, [leads, search]);

  /* ---------------------------------------------------------------------- */
  /*                                 STATS                                  */
  /* ---------------------------------------------------------------------- */

  const currentMonth =
    getCurrentMonthKey();

  const totalLeads =
    leads.length;

  const thisMonthCount =
    leads.filter((lead) =>
      String(
        lead.date || ""
      ).startsWith(currentMonth)
    ).length;

  const approvedCount =
    leads.filter(
      (lead) =>
        String(
          lead.status || ""
        )
          .trim()
          .toLowerCase() ===
        "approved"
    ).length;

  /* ---------------------------------------------------------------------- */
  /*                                LOGOUT                                  */
  /* ---------------------------------------------------------------------- */

  function handleMobileLogout() {
    localStorage.removeItem(
      "crmRole"
    );

    localStorage.removeItem(
      "crmUserId"
    );

    localStorage.removeItem(
      "crmUserName"
    );

    localStorage.removeItem(
      "crmClientId"
    );

    router.replace("/login");
  }

  /* ---------------------------------------------------------------------- */
  /*                                  UI                                    */
  /* ---------------------------------------------------------------------- */

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#03060b] text-white">
      {/* Background Grid */}

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_28%),linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:100%_100%,64px_64px,64px_64px]" />

      {/* Shared Sidebar */}

      <ClientSidebar />

      {/* Main Content */}

      <section className="relative z-10 px-5 py-6 lg:ml-72 lg:px-8 xl:px-10">
        {/* -------------------------------------------------------------- */}
        {/* HEADER                                                         */}
        {/* -------------------------------------------------------------- */}

        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-400">
              Client Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl xl:text-[42px]">
              Welcome Back,{" "}
              {client.company ||
                client.clientName ||
                "Client"}{" "}
              👋
            </h1>

            <p className="mt-2 text-sm text-slate-400 md:text-base">
              Here&apos;s an overview
              of the leads generated
              for your business.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Date */}

            <div className="flex items-center gap-3 rounded-2xl border border-cyan-300/10 bg-[#071018]/75 px-5 py-3 text-sm text-slate-300 backdrop-blur-xl">
              <CalendarDays
                size={16}
                className="text-cyan-300"
              />

              {getReadableDate()}
            </div>

            {/* Mobile Logout */}

            <button
              type="button"
              onClick={
                handleMobileLogout
              }
              className="flex items-center gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-3 py-3 text-xs font-bold text-red-300 transition hover:bg-red-400/10 lg:hidden"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* STATS                                                          */}
        {/* -------------------------------------------------------------- */}

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Leads"
            value={
              loading
                ? "..."
                : totalLeads
            }
            subtitle="All leads generated"
            icon={Users}
            tone="cyan"
          />

          <StatCard
            title="This Month"
            value={
              loading
                ? "..."
                : thisMonthCount
            }
            subtitle="Leads generated this month"
            icon={CalendarDays}
            tone="blue"
          />

          <StatCard
            title="Approved"
            value={
              loading
                ? "..."
                : approvedCount
            }
            subtitle="Approved leads"
            icon={CheckCircle2}
            tone="emerald"
          />
        </div>

        {/* -------------------------------------------------------------- */}
        {/* ERROR                                                          */}
        {/* -------------------------------------------------------------- */}

        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.07] px-4 py-4">
            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0 text-red-300"
            />

            <div>
              <p className="text-xs font-bold text-red-300">
                Unable to load leads
              </p>

              <p className="mt-1 text-[10px] text-red-300/70">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------- */}
        {/* LEADS                                                          */}
        {/* -------------------------------------------------------------- */}

        <div className="mt-4 overflow-hidden rounded-2xl border border-cyan-300/10 bg-[#071018]/70 backdrop-blur-xl">
          {/* Leads Header */}

          <div className="flex flex-col gap-4 border-b border-white/[0.055] px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/10 text-cyan-300">
                <Users size={15} />
              </div>

              <div>
                <h2 className="text-sm font-black text-white">
                  Your Leads
                </h2>

                <p className="mt-0.5 text-[9px] text-slate-600">
                  {loading
                    ? "Loading leads..."
                    : `${filteredLeads.length} lead${
                        filteredLeads.length ===
                        1
                          ? ""
                          : "s"
                      } displayed`}
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
              {/* Search */}

              <div className="relative w-full sm:w-[280px]">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search leads..."
                  className="w-full rounded-xl border border-white/[0.08] bg-black/25 py-2.5 pl-9 pr-3 text-[10px] text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/30"
                />
              </div>

              {/* Refresh */}

              <button
                type="button"
                onClick={() =>
                  loadClientLeads({
                    silent: true,
                  })
                }
                disabled={
                  loading || refreshing
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] px-4 py-2.5 text-[10px] font-black text-cyan-300 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={13}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>
            </div>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* LOADING                                                   */}
          {/* ---------------------------------------------------------- */}

          {loading && (
            <div className="flex min-h-[300px] flex-col items-center justify-center">
              <RefreshCw
                size={24}
                className="animate-spin text-cyan-300"
              />

              <p className="mt-3 text-xs font-bold text-slate-400">
                Loading your leads...
              </p>
            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {/* DESKTOP TABLE                                             */}
          {/* ---------------------------------------------------------- */}

          {!loading &&
            filteredLeads.length >
              0 && (
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-white/[0.05] bg-black/10">
                      {[
                        "Lead",
                        "Phone",
                        "Email",
                        "Date",
                        "Status",
                        "",
                      ].map(
                        (heading) => (
                          <th
                            key={
                              heading
                            }
                            className="px-5 py-3 text-left text-[8px] font-black uppercase tracking-[0.18em] text-slate-600"
                          >
                            {
                              heading
                            }
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLeads.map(
                      (lead) => (
                        <tr
                          key={
                            lead.id
                          }
                          className="border-b border-white/[0.045] transition last:border-b-0 hover:bg-cyan-300/[0.025]"
                        >
                          {/* Lead */}

                          <td className="px-5 py-4">
                            <p className="text-xs font-bold text-white">
                              {
                                lead.leadName
                              }
                            </p>

                            {lead.address && (
                              <p className="mt-1 max-w-[220px] truncate text-[9px] text-slate-600">
                                {
                                  lead.address
                                }
                              </p>
                            )}
                          </td>

                          {/* Phone */}

                          <td className="px-5 py-4">
                            {lead.phone ? (
                              <a
                                href={`tel:${lead.phone}`}
                                className="text-[10px] font-medium text-slate-300 transition hover:text-cyan-300"
                              >
                                {
                                  lead.phone
                                }
                              </a>
                            ) : (
                              <span className="text-[10px] text-slate-600">
                                -
                              </span>
                            )}
                          </td>

                          {/* Email */}

                          <td className="px-5 py-4">
                            {lead.email ? (
                              <a
                                href={`mailto:${lead.email}`}
                                className="block max-w-[220px] truncate text-[10px] text-slate-400 transition hover:text-cyan-300"
                              >
                                {
                                  lead.email
                                }
                              </a>
                            ) : (
                              <span className="text-[10px] text-slate-600">
                                -
                              </span>
                            )}
                          </td>

                          {/* Date */}

                          <td className="px-5 py-4">
                            <p className="text-[10px] text-slate-300">
                              {formatDate(
                                lead.date
                              )}
                            </p>

                            {lead.time && (
                              <p className="mt-1 text-[8px] text-slate-600">
                                {
                                  lead.time
                                }
                              </p>
                            )}
                          </td>

                          {/* Status */}

                          <td className="px-5 py-4">
                            <StatusBadge
                              status={
                                lead.status
                              }
                            />
                          </td>

                          {/* View */}

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedLead(
                                  lead
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-2 text-[9px] font-black text-cyan-300 transition hover:bg-cyan-300/10"
                            >
                              <Eye
                                size={
                                  11
                                }
                              />

                              View
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}

          {/* ---------------------------------------------------------- */}
          {/* MOBILE CARDS                                              */}
          {/* ---------------------------------------------------------- */}

          {!loading &&
            filteredLeads.length >
              0 && (
              <div className="grid gap-3 p-4 lg:hidden">
                {filteredLeads.map(
                  (lead) => (
                    <button
                      type="button"
                      key={
                        lead.id
                      }
                      onClick={() =>
                        setSelectedLead(
                          lead
                        )
                      }
                      className="rounded-xl border border-white/[0.06] bg-black/15 p-4 text-left transition hover:border-cyan-300/20"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-white">
                            {
                              lead.leadName
                            }
                          </p>

                          <p className="mt-1 text-[10px] text-slate-500">
                            {lead.phone ||
                              "No phone"}
                          </p>
                        </div>

                        <StatusBadge
                          status={
                            lead.status
                          }
                        />
                      </div>

                      <div className="mt-4 flex items-center justify-between text-[9px] text-slate-600">
                        <span className="max-w-[190px] truncate">
                          {lead.email ||
                            "No email"}
                        </span>

                        <span>
                          {formatDate(
                            lead.date
                          )}
                        </span>
                      </div>
                    </button>
                  )
                )}
              </div>
            )}

          {/* ---------------------------------------------------------- */}
          {/* EMPTY STATE                                               */}
          {/* ---------------------------------------------------------- */}

          {!loading &&
            filteredLeads.length ===
              0 && (
              <div className="px-5 py-16 text-center">
                <Users
                  size={28}
                  className="mx-auto text-slate-700"
                />

                <p className="mt-3 text-sm font-bold text-slate-400">
                  {search
                    ? "No matching leads found"
                    : "No leads yet"}
                </p>

                <p className="mt-1 text-[10px] text-slate-600">
                  {search
                    ? "Try a different search."
                    : "Your generated leads will appear here automatically."}
                </p>
              </div>
            )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* LEAD DETAILS MODAL                                               */}
      {/* ---------------------------------------------------------------- */}

      {selectedLead && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5 backdrop-blur-md"
          onClick={() =>
            setSelectedLead(null)
          }
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-cyan-300/15 bg-[#071018] shadow-[0_30px_100px_rgba(0,0,0,0.7),0_0_60px_rgba(34,211,238,0.08)]"
          >
            {/* Modal Header */}

            <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] p-5">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-400">
                  Lead Details
                </p>

                <h2 className="mt-2 text-xl font-black text-white">
                  {
                    selectedLead.leadName
                  }
                </h2>

                <p className="mt-1 text-[10px] text-slate-500">
                  {formatDate(
                    selectedLead.date
                  )}{" "}
                  {selectedLead.time
                    ? `• ${selectedLead.time}`
                    : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedLead(
                    null
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-black/20 text-slate-400 transition hover:border-red-400/20 hover:text-red-300"
              >
                <X size={15} />
              </button>
            </div>

            {/* Status */}

            <div className="px-5 pt-5">
              <StatusBadge
                status={
                  selectedLead.status
                }
              />
            </div>

            {/* Lead Information */}

            <div className="grid gap-3 p-5 sm:grid-cols-2">
              <DetailItem
                icon={User}
                label="Contact"
                value={
                  selectedLead.leadName
                }
              />

              <DetailItem
                icon={Building2}
                label="Company"
                value={
                  selectedLead.company
                }
              />

              <DetailItem
                icon={Phone}
                label="Phone"
                value={
                  selectedLead.phone
                }
              />

              <DetailItem
                icon={Mail}
                label="Email"
                value={
                  selectedLead.email
                }
              />

              <div className="sm:col-span-2">
                <DetailItem
                  icon={MapPin}
                  label="Address"
                  value={
                    selectedLead.address
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <DetailItem
                  icon={StickyNote}
                  label="Notes"
                  value={
                    selectedLead.note
                  }
                />
              </div>
            </div>

            {/* Footer */}

            <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-4">
              <p className="text-[9px] text-slate-600">
                {client.company ||
                  "CRM BY LEADSRIFT"}
              </p>

              <button
                type="button"
                onClick={() =>
                  setSelectedLead(
                    null
                  )
                }
                className="rounded-xl bg-cyan-300 px-5 py-2.5 text-[10px] font-black uppercase tracking-wide text-black transition hover:bg-cyan-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}