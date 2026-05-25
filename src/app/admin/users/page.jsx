"use client";

import { useMemo, useState } from "react";
import {
  Users,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  Briefcase,
  Headphones,
  MoreHorizontal,
  X,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";

const initialUsers = [
  {
    id: 1,
    name: "Hamza",
    loginId: "LR-HAMZA",
    password: "123456",
    role: "Agent",
    campaign: "Commercial Cleaning",
    status: "Active",
  },
  {
    id: 2,
    name: "Ammar",
    loginId: "LR-AMMAR",
    password: "123456",
    role: "Agent",
    campaign: "Roofing",
    status: "Active",
  },
  {
    id: 3,
    name: "Sameen",
    loginId: "LR-SAMEEN",
    password: "123456",
    role: "Agent",
    campaign: "Solar",
    status: "Active",
  },
  {
    id: 4,
    name: "Asim",
    loginId: "LR-ASIM",
    password: "123456",
    role: "Closer",
    campaign: "Commercial Cleaning",
    status: "Inactive",
  },
];

const roles = ["Agent", "Manager", "Closer", "Admin"];
const campaigns = [
  "Commercial Cleaning",
  "Roofing",
  "Solar",
  "Real Estate",
  "SaaS",
  "Not Assigned",
];

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    loginId: "",
    password: "",
    role: "Agent",
    campaign: "Commercial Cleaning",
    status: "Active",
  });

  const filteredUsers = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search) ||
        user.loginId.toLowerCase().includes(search) ||
        user.role.toLowerCase().includes(search) ||
        user.campaign.toLowerCase().includes(search);

      const matchesRole = roleFilter === "All" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const agentCount = users.filter((x) => x.role === "Agent").length;
  const managerCount = users.filter((x) => x.role === "Manager").length;
  const closerCount = users.filter((x) => x.role === "Closer").length;
  const activeCount = users.filter((x) => x.status === "Active").length;

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      loginId:
        name === "name"
          ? `LR-${value.trim().replace(/\s+/g, "-").toUpperCase()}`
          : prev.loginId,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const newUser = {
      id: Date.now(),
      ...form,
    };

    setUsers((prev) => [newUser, ...prev]);

    setForm({
      name: "",
      loginId: "",
      password: "",
      role: "Agent",
      campaign: "Commercial Cleaning",
      status: "Active",
    });

    setIsModalOpen(false);
  }

  return (
    <AdminShell
      title="Users"
      subtitle="Create agents, managers, closers, and manage campaign access."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStat
          label="Total Users"
          value={users.length}
          note="All CRM users"
          icon={Users}
          tone="text-cyan-300"
        />
        <AdminStat
          label="Agents"
          value={agentCount}
          note="Calling team"
          icon={Headphones}
          tone="text-green-300"
        />
        <AdminStat
          label="Managers"
          value={managerCount}
          note="Team control"
          icon={Briefcase}
          tone="text-purple-300"
        />
        <AdminStat
          label="Active Users"
          value={activeCount}
          note="Can login"
          icon={UserCheck}
          tone="text-yellow-300"
        />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
              User Management
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              CRM Accounts
            </h3>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15"
          >
            <Plus size={17} />
            Create User
          </button>
        </div>

        <div className="mb-5 grid gap-3 xl:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search by name, login ID, role, campaign..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-300/35"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-300/35"
          >
            <option>All</option>
            {roles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-white/[0.03] text-slate-400">
              <tr>
                <th className="px-4 py-4 font-medium">User</th>
                <th className="px-4 py-4 font-medium">Login ID</th>
                <th className="px-4 py-4 font-medium">Password</th>
                <th className="px-4 py-4 font-medium">Role</th>
                <th className="px-4 py-4 font-medium">Campaign</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="text-slate-300 transition hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300/10 text-xs font-semibold text-cyan-300">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          CRM user
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-cyan-300">{user.loginId}</td>
                  <td className="px-4 py-4 text-slate-500">{user.password}</td>

                  <td className="px-4 py-4">
                    <RolePill role={user.role} />
                  </td>

                  <td className="px-4 py-4">{user.campaign}</td>

                  <td className="px-4 py-4">
                    <StatusPill status={user.status} />
                  </td>

                  <td className="px-4 py-4 text-right">
                    <button className="rounded-lg border border-white/10 bg-black/20 p-2 text-slate-400 hover:text-white">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 rounded-2xl border border-yellow-300/15 bg-yellow-300/10 p-4">
          <div className="flex gap-3">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-yellow-300"
            />
            <div>
              <p className="text-sm font-medium text-yellow-200">
                Temporary local user management
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                This UI is ready for Supabase later. For now, users created here
                are only stored in local component state until database
                integration.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-cyan-300/15 bg-[#071018] p-6 shadow-[0_0_80px_rgba(34,211,238,0.08)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white">
                  Create User
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Add login credentials, role, and assigned campaign.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-white/10 p-2 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <Field
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Hamza"
                required
              />

              <Field
                label="Login ID"
                name="loginId"
                value={form.loginId}
                onChange={handleChange}
                placeholder="LR-HAMZA"
                required
              />

              <Field
                label="Password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="123456"
                required
              />

              <SelectField
                label="Role"
                name="role"
                value={form.role}
                onChange={handleChange}
                options={roles}
              />

              <SelectField
                label="Assigned Campaign"
                name="campaign"
                value={form.campaign}
                onChange={handleChange}
                options={campaigns}
              />

              <SelectField
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                options={["Active", "Inactive"]}
              />

              <div className="mt-2 flex justify-end gap-3 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-slate-300 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 text-sm font-medium text-cyan-100 hover:bg-cyan-300/15"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function AdminStat({ label, value, note, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#071018]/80 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className={`rounded-xl bg-white/5 p-3 ${tone}`}>
          <Icon size={20} />
        </div>
        <span className="text-xs text-slate-500">{note}</span>
      </div>

      <p className="text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  );
}

function Field({ label, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm text-slate-300">{label}</label>
      <input
        {...props}
        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/35"
      />
    </div>
  );
}

function SelectField({ label, options, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm text-slate-300">{label}</label>
      <select
        {...props}
        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/35"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function RolePill({ role }) {
  const styles = {
    Agent: "border-cyan-300/20 bg-cyan-300/10 text-cyan-300",
    Manager: "border-purple-300/20 bg-purple-300/10 text-purple-300",
    Closer: "border-green-300/20 bg-green-300/10 text-green-300",
    Admin: "border-yellow-300/20 bg-yellow-300/10 text-yellow-300",
  };

  return (
    <span
      className={`rounded-lg border px-3 py-1 text-xs ${
        styles[role] || "border-white/10 bg-white/5 text-slate-300"
      }`}
    >
      {role}
    </span>
  );
}

function StatusPill({ status }) {
  const styles = {
    Active: "border-emerald-300/20 bg-emerald-300/10 text-emerald-300",
    Inactive: "border-red-300/20 bg-red-300/10 text-red-300",
  };

  return (
    <span
      className={`rounded-lg border px-3 py-1 text-xs ${
        styles[status] || "border-white/10 bg-white/5 text-slate-300"
      }`}
    >
      {status}
    </span>
  );
}