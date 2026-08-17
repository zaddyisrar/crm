"use client";

import ClientSidebar from "@/components/client/ClientSidebar";
import { sheetsPost } from "@/lib/sheetsApi";
import {
  useEffect,
  useState,
} from "react";

import {
  UserRound,
  Building2,
  Mail,
  Phone,
  Globe2,
  MapPin,
  Clock3,
  CalendarDays,
  Save,
  BriefcaseBusiness,
  Target,
  Video,
  CheckCircle2,
  User,
  FileText,
  ChevronDown,
  Loader2,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                               DEFAULT DATA                                 */
/* -------------------------------------------------------------------------- */

const DEFAULT_PROFILE = {
  companyName: "",
  website: "",
  companyPhone: "",
  companyEmail: "",
  address: "",
  timezone: "America/New_York",

  contactName: "",
  position: "",
  directPhone: "",
  contactEmail: "",

  appointmentType: "Phone Call",
  appointmentDuration: "30",
  minimumNotice: "24 Hours",

  targetLocations: "",
  targetIndustries: "",
  qualificationRequirements: "",
  doNotTarget: "",
  specialNotes: "",
};

const DEFAULT_AVAILABILITY = [
  {
    day: "Monday",
    enabled: true,
    start: "09:00",
    end: "17:00",
  },
  {
    day: "Tuesday",
    enabled: true,
    start: "09:00",
    end: "17:00",
  },
  {
    day: "Wednesday",
    enabled: true,
    start: "09:00",
    end: "17:00",
  },
  {
    day: "Thursday",
    enabled: true,
    start: "09:00",
    end: "17:00",
  },
  {
    day: "Friday",
    enabled: true,
    start: "09:00",
    end: "17:00",
  },
  {
    day: "Saturday",
    enabled: false,
    start: "09:00",
    end: "17:00",
  },
  {
    day: "Sunday",
    enabled: false,
    start: "09:00",
    end: "17:00",
  },
];

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}) {
  return (
    <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/10 text-cyan-300">
        <Icon size={16} />
      </div>

      <div>
        <h2 className="text-sm font-black text-white">
          {title}
        </h2>

        <p className="mt-0.5 text-[9px] text-slate-600">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
        {Icon && (
          <Icon
            size={11}
            className="text-cyan-400"
          />
        )}

        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/[0.07] bg-black/20 px-3.5 py-3 text-xs font-medium text-slate-200 outline-none transition placeholder:text-slate-700 focus:border-cyan-300/30"
      />
    </div>
  );
}

function SelectField({
  label,
  icon: Icon,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
        {Icon && (
          <Icon
            size={11}
            className="text-cyan-400"
          />
        )}

        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="w-full appearance-none rounded-xl border border-white/[0.07] bg-[#071018] px-3.5 py-3 pr-9 text-xs font-medium text-slate-200 outline-none transition focus:border-cyan-300/30"
        >
          {options.map(
            (option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            )
          )}
        </select>

        <ChevronDown
          size={13}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
      </div>
    </div>
  );
}

function TextAreaField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder = "",
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
        {Icon && (
          <Icon
            size={11}
            className="text-cyan-400"
          />
        )}

        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-xl border border-white/[0.07] bg-black/20 px-3.5 py-3 text-xs font-medium leading-5 text-slate-200 outline-none transition placeholder:text-slate-700 focus:border-cyan-300/30"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              PROFILE PAGE                                  */
/* -------------------------------------------------------------------------- */

export default function ClientProfilePage() {
  const [clientId, setClientId] =
    useState("");

  const [profile, setProfile] =
    useState(DEFAULT_PROFILE);

  const [
    availability,
    setAvailability,
  ] = useState(
    DEFAULT_AVAILABILITY
  );

  const [loading, setLoading] =
    useState(true);

  const [saved, setSaved] =
    useState(false);

  /* ---------------------------------------------------------------------- */
  /*                             LOAD CLIENT                                */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    async function loadProfile() {
      try {
        const storedClientId =
          localStorage.getItem(
            "crmClientId"
          ) ||
          localStorage.getItem(
            "crmUserId"
          );

        if (!storedClientId) {
          setLoading(false);
          return;
        }

        setClientId(
          storedClientId
        );

        /*
        |--------------------------------------------------------------------------
        | LOAD LOCALLY SAVED PROFILE
        |--------------------------------------------------------------------------
        */

        const savedProfile =
          localStorage.getItem(
            `crmClientProfile:${storedClientId}`
          );

        const savedAvailability =
          localStorage.getItem(
            `crmClientAvailability:${storedClientId}`
          );

        if (savedProfile) {
          try {
            setProfile({
              ...DEFAULT_PROFILE,
              ...JSON.parse(
                savedProfile
              ),
            });
          } catch {}
        }

        if (
          savedAvailability
        ) {
          try {
            setAvailability(
              JSON.parse(
                savedAvailability
              )
            );
          } catch {}
        }

        /*
        |--------------------------------------------------------------------------
        | GET REAL CLIENT COMPANY
        |--------------------------------------------------------------------------
        |
        | Uses the endpoint that is already working for the dashboard.
        |
        */

        const response =
          await sheetsPost({
            action:
              "getClientLeads",
            clientId:
              storedClientId,
          });

        const client =
          response?.client;

        if (client) {
          setProfile(
            (current) => ({
              ...current,

              companyName:
                current.companyName ||
                client.company ||
                "",

              contactName:
                current.contactName ||
                client.clientName ||
                "",
            })
          );
        }
      } catch (error) {
        console.error(
          "Profile client load failed:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                             UPDATE FIELD                               */
  /* ---------------------------------------------------------------------- */

  function updateProfile(
    field,
    value
  ) {
    setProfile(
      (current) => ({
        ...current,
        [field]: value,
      })
    );

    setSaved(false);
  }

  /* ---------------------------------------------------------------------- */
  /*                           AVAILABILITY                                 */
  /* ---------------------------------------------------------------------- */

  function updateAvailability(
    index,
    field,
    value
  ) {
    setAvailability(
      (current) =>
        current.map(
          (
            item,
            itemIndex
          ) =>
            itemIndex ===
            index
              ? {
                  ...item,
                  [field]:
                    value,
                }
              : item
        )
    );

    setSaved(false);
  }

  /* ---------------------------------------------------------------------- */
  /*                               SAVE                                    */
  /* ---------------------------------------------------------------------- */

  function handleSave() {
    if (!clientId) return;

    localStorage.setItem(
      `crmClientProfile:${clientId}`,
      JSON.stringify(profile)
    );

    localStorage.setItem(
      `crmClientAvailability:${clientId}`,
      JSON.stringify(
        availability
      )
    );

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  /* ---------------------------------------------------------------------- */
  /*                                UI                                     */
  /* ---------------------------------------------------------------------- */

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#03060b] text-white">
      {/* Background */}

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_28%),linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:100%_100%,64px_64px,64px_64px]" />

      <ClientSidebar />

      <section className="relative z-10 px-5 py-6 lg:ml-72 lg:px-8 xl:px-10">
        {/* -------------------------------------------------------------- */}
        {/* HEADER                                                         */}
        {/* -------------------------------------------------------------- */}

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-cyan-400">
              <UserRound
                size={15}
              />

              Client Profile
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              Profile & Availability
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Keep your business,
              contact and scheduling
              information up to date.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-[10px] font-bold text-emerald-300">
                <CheckCircle2
                  size={14}
                />

                Saved
              </div>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-black transition hover:bg-cyan-200"
            >
              <Save size={14} />

              Save
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-10 flex items-center justify-center py-24">
            <Loader2
              size={24}
              className="animate-spin text-cyan-300"
            />
          </div>
        ) : (
          <>
            {/* ---------------------------------------------------------- */}
            {/* BUSINESS                                                  */}
            {/* ---------------------------------------------------------- */}

            <div className="mt-7 overflow-hidden rounded-2xl border border-cyan-300/10 bg-[#071018]/70">
              <SectionHeader
                icon={Building2}
                title="Business Information"
                subtitle="Basic information about your company."
              />

              <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                <Field
                  label="Company Name"
                  icon={Building2}
                  value={
                    profile.companyName
                  }
                  onChange={(
                    value
                  ) =>
                    updateProfile(
                      "companyName",
                      value
                    )
                  }
                />

                <Field
                  label="Website"
                  icon={Globe2}
                  value={
                    profile.website
                  }
                  onChange={(
                    value
                  ) =>
                    updateProfile(
                      "website",
                      value
                    )
                  }
                  placeholder="https://..."
                />

                <Field
                  label="Company Phone"
                  icon={Phone}
                  value={
                    profile.companyPhone
                  }
                  onChange={(
                    value
                  ) =>
                    updateProfile(
                      "companyPhone",
                      value
                    )
                  }
                />

                <Field
                  label="Company Email"
                  icon={Mail}
                  type="email"
                  value={
                    profile.companyEmail
                  }
                  onChange={(
                    value
                  ) =>
                    updateProfile(
                      "companyEmail",
                      value
                    )
                  }
                />

                <SelectField
                  label="Timezone"
                  icon={Clock3}
                  value={
                    profile.timezone
                  }
                  onChange={(
                    value
                  ) =>
                    updateProfile(
                      "timezone",
                      value
                    )
                  }
                  options={[
                    "America/New_York",
                    "America/Chicago",
                    "America/Denver",
                    "America/Los_Angeles",
                    "America/Toronto",
                    "Europe/London",
                    "Asia/Karachi",
                  ]}
                />

                <div className="md:col-span-2 xl:col-span-3">
                  <Field
                    label="Business Address"
                    icon={MapPin}
                    value={
                      profile.address
                    }
                    onChange={(
                      value
                    ) =>
                      updateProfile(
                        "address",
                        value
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------------- */}
            {/* CONTACT + APPOINTMENTS                                     */}
            {/* ---------------------------------------------------------- */}

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {/* Contact */}

              <div className="overflow-hidden rounded-2xl border border-cyan-300/10 bg-[#071018]/70">
                <SectionHeader
                  icon={User}
                  title="Primary Contact"
                  subtitle="Main person we coordinate with."
                />

                <div className="grid gap-4 p-5 md:grid-cols-2">
                  <Field
                    label="Contact Name"
                    icon={User}
                    value={
                      profile.contactName
                    }
                    onChange={(
                      value
                    ) =>
                      updateProfile(
                        "contactName",
                        value
                      )
                    }
                  />

                  <Field
                    label="Position"
                    icon={
                      BriefcaseBusiness
                    }
                    value={
                      profile.position
                    }
                    onChange={(
                      value
                    ) =>
                      updateProfile(
                        "position",
                        value
                      )
                    }
                  />

                  <Field
                    label="Direct Phone"
                    icon={Phone}
                    value={
                      profile.directPhone
                    }
                    onChange={(
                      value
                    ) =>
                      updateProfile(
                        "directPhone",
                        value
                      )
                    }
                  />

                  <Field
                    label="Email"
                    icon={Mail}
                    type="email"
                    value={
                      profile.contactEmail
                    }
                    onChange={(
                      value
                    ) =>
                      updateProfile(
                        "contactEmail",
                        value
                      )
                    }
                  />
                </div>
              </div>

              {/* Appointment Preferences */}

              <div className="overflow-hidden rounded-2xl border border-cyan-300/10 bg-[#071018]/70">
                <SectionHeader
                  icon={CalendarDays}
                  title="Appointment Preferences"
                  subtitle="How leads should be scheduled."
                />

                <div className="grid gap-4 p-5 md:grid-cols-2">
                  <SelectField
                    label="Meeting Type"
                    icon={Video}
                    value={
                      profile.appointmentType
                    }
                    onChange={(
                      value
                    ) =>
                      updateProfile(
                        "appointmentType",
                        value
                      )
                    }
                    options={[
                      "Phone Call",
                      "Zoom",
                      "Google Meet",
                      "Microsoft Teams",
                      "In-Person",
                    ]}
                  />

                  <SelectField
                    label="Duration"
                    icon={Clock3}
                    value={
                      profile.appointmentDuration
                    }
                    onChange={(
                      value
                    ) =>
                      updateProfile(
                        "appointmentDuration",
                        value
                      )
                    }
                    options={[
                      "15",
                      "30",
                      "45",
                      "60",
                    ]}
                  />

                  <div className="md:col-span-2">
                    <SelectField
                      label="Minimum Notice"
                      icon={Clock3}
                      value={
                        profile.minimumNotice
                      }
                      onChange={(
                        value
                      ) =>
                        updateProfile(
                          "minimumNotice",
                          value
                        )
                      }
                      options={[
                        "Same Day",
                        "4 Hours",
                        "12 Hours",
                        "24 Hours",
                        "48 Hours",
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------------- */}
            {/* AVAILABILITY                                               */}
            {/* ---------------------------------------------------------- */}

            <div className="mt-4 overflow-hidden rounded-2xl border border-cyan-300/10 bg-[#071018]/70">
              <SectionHeader
                icon={CalendarDays}
                title="Weekly Availability"
                subtitle={`Appointment availability in ${profile.timezone}.`}
              />

              <div className="grid gap-2 p-5">
                {availability.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={item.day}
                      className={`grid gap-3 rounded-xl border px-4 py-3 md:grid-cols-[130px_80px_1fr] md:items-center ${
                        item.enabled
                          ? "border-cyan-300/10 bg-cyan-300/[0.025]"
                          : "border-white/[0.04] bg-black/15"
                      }`}
                    >
                      <p
                        className={`text-xs font-bold ${
                          item.enabled
                            ? "text-white"
                            : "text-slate-600"
                        }`}
                      >
                        {
                          item.day
                        }
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          updateAvailability(
                            index,
                            "enabled",
                            !item.enabled
                          )
                        }
                        className={`relative h-6 w-11 rounded-full transition ${
                          item.enabled
                            ? "bg-cyan-300"
                            : "bg-slate-800"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                            item.enabled
                              ? "left-6"
                              : "left-1"
                          }`}
                        />
                      </button>

                      {item.enabled ? (
                        <div className="flex items-center gap-3">
                          <input
                            type="time"
                            value={
                              item.start
                            }
                            onChange={(
                              event
                            ) =>
                              updateAvailability(
                                index,
                                "start",
                                event
                                  .target
                                  .value
                              )
                            }
                            className="rounded-xl border border-white/[0.07] bg-black/25 px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-300/30"
                          />

                          <span className="text-[9px] text-slate-600">
                            to
                          </span>

                          <input
                            type="time"
                            value={
                              item.end
                            }
                            onChange={(
                              event
                            ) =>
                              updateAvailability(
                                index,
                                "end",
                                event
                                  .target
                                  .value
                              )
                            }
                            className="rounded-xl border border-white/[0.07] bg-black/25 px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-300/30"
                          />
                        </div>
                      ) : (
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-700">
                          Unavailable
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* ---------------------------------------------------------- */}
            {/* CAMPAIGN NOTES                                             */}
            {/* ---------------------------------------------------------- */}

            <div className="mt-4 overflow-hidden rounded-2xl border border-cyan-300/10 bg-[#071018]/70">
              <SectionHeader
                icon={Target}
                title="Campaign Instructions"
                subtitle="Guidance for the LeadsRift outreach team."
              />

              <div className="grid gap-4 p-5 xl:grid-cols-2">
                <Field
                  label="Target Locations"
                  icon={MapPin}
                  value={
                    profile.targetLocations
                  }
                  onChange={(
                    value
                  ) =>
                    updateProfile(
                      "targetLocations",
                      value
                    )
                  }
                  placeholder="New Jersey, New York..."
                />

                <Field
                  label="Target Industries"
                  icon={
                    BriefcaseBusiness
                  }
                  value={
                    profile.targetIndustries
                  }
                  onChange={(
                    value
                  ) =>
                    updateProfile(
                      "targetIndustries",
                      value
                    )
                  }
                  placeholder="Offices, Medical, Warehouses..."
                />

                <TextAreaField
                  label="Qualification Requirements"
                  icon={
                    CheckCircle2
                  }
                  value={
                    profile.qualificationRequirements
                  }
                  onChange={(
                    value
                  ) =>
                    updateProfile(
                      "qualificationRequirements",
                      value
                    )
                  }
                  placeholder="What makes a qualified lead?"
                />

                <TextAreaField
                  label="Do Not Target"
                  icon={Target}
                  value={
                    profile.doNotTarget
                  }
                  onChange={(
                    value
                  ) =>
                    updateProfile(
                      "doNotTarget",
                      value
                    )
                  }
                  placeholder="Industries or businesses to avoid..."
                />

                <div className="xl:col-span-2">
                  <TextAreaField
                    label="Special Notes"
                    icon={FileText}
                    value={
                      profile.specialNotes
                    }
                    onChange={(
                      value
                    ) =>
                      updateProfile(
                        "specialNotes",
                        value
                      )
                    }
                    placeholder="Anything else the outreach team should know..."
                  />
                </div>
              </div>
            </div>

            {/* Bottom Save */}

            <div className="mt-5 flex justify-end border-t border-white/[0.05] pt-5">
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-6 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-black transition hover:bg-cyan-200"
              >
                <Save size={14} />

                Save Profile
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}