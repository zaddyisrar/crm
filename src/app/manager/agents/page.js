"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, KeyRound } from "lucide-react";
import ManagerShell from "@/components/manager/ManagerShell";
import { users } from "@/data/agents";

export default function ManagerAgentsPage() {
  const [agents, setAgents] = useState(
    users.filter(
      (user) => user.role === "agent" || user.role === "manager"
    )
  );

  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  const [form, setForm] = useState({
    id: "",
    name: "",
    password: "",
    role: "agent",
    salary: 50000,
    status: "active",
  });

  function openCreateModal() {
    setEditingAgent(null);

    setForm({
      id: "",
      name: "",
      password: "",
      role: "agent",
      salary: 50000,
      status: "active",
    });

    setShowModal(true);
  }

  function openEditModal(agent) {
    setEditingAgent(agent);

    setForm({
      id: agent.id || "",
      name: agent.name || "",
      password: agent.password || "",
      role: agent.role || "agent",
      salary: agent.salary || 50000,
      status: agent.status || "active",
    });

    setShowModal(true);
  }

  function saveAgent() {
    if (!form.id || !form.name || !form.password) {
      alert("Agent ID, Name and Password are required.");
      return;
    }

    if (editingAgent) {
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === editingAgent.id ? form : agent
        )
      );
    } else {
      const alreadyExists = agents.some(
        (agent) => agent.id === form.id
      );

      if (alreadyExists) {
        alert("This Agent ID already exists.");
        return;
      }

      setAgents((prev) => [...prev, form]);
    }

    setShowModal(false);
  }

  function deleteAgent(id) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    setAgents((prev) =>
      prev.filter((agent) => agent.id !== id)
    );
  }

  function resetPassword(id) {
    const newPassword = prompt("Enter new password:");

    if (!newPassword) return;

    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === id
          ? { ...agent, password: newPassword }
          : agent
      )
    );
  }

  return (
    <ManagerShell>
      <div className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
              Manager Panel
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              Agent Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create, edit, delete and manage LeadsRift users.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-black transition hover:bg-cyan-300"
          >
            <Plus size={18} />
            Create Agent
          </button>
        </div>

        <div className="overflow-x-auto rounded-[1.5rem] border border-white/10">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.2em] text-cyan-300">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Password</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Salary</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {agents.map((agent) => (
                <tr
                  key={agent.id}
                  className="border-t border-white/10 text-slate-300"
                >
                  <td className="px-5 py-4 font-bold text-white">
                    {agent.name}
                  </td>

                  <td className="px-5 py-4">
                    {agent.id}
                  </td>

                  <td className="px-5 py-4">
                    {agent.password}
                  </td>

                  <td className="px-5 py-4 capitalize">
                    {agent.role}
                  </td>

                  <td className="px-5 py-4">
                    PKR{" "}
                    {Number(
                      agent.salary || 0
                    ).toLocaleString()}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                      {agent.status || "active"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          openEditModal(agent)
                        }
                        className="rounded-xl border border-white/10 p-2 text-slate-300 hover:border-cyan-300/40 hover:text-cyan-300"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() =>
                          resetPassword(agent.id)
                        }
                        className="rounded-xl border border-white/10 p-2 text-slate-300 hover:border-yellow-300/40 hover:text-yellow-300"
                        title="Reset Password"
                      >
                        <KeyRound size={16} />
                      </button>

                      <button
                        onClick={() =>
                          deleteAgent(agent.id)
                        }
                        className="rounded-xl border border-white/10 p-2 text-slate-300 hover:border-red-400/40 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] border border-cyan-300/20 bg-[#06101a] p-6">
            <h3 className="text-2xl font-black text-white">
              {editingAgent
                ? "Edit Agent"
                : "Create Agent"}
            </h3>

            <div className="mt-6 grid gap-4">
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="Full Name"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white"
              />

              <input
                value={form.id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    id: e.target.value,
                  })
                }
                placeholder="User ID"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white"
              />

              <input
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                placeholder="Password"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white"
              />

              <input
                type="number"
                value={form.salary}
                onChange={(e) =>
                  setForm({
                    ...form,
                    salary: Number(e.target.value),
                  })
                }
                placeholder="Salary"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white"
              />

              <select
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value,
                  })
                }
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white"
              >
                <option value="agent">Agent</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-slate-300"
              >
                Cancel
              </button>

              <button
                onClick={saveAgent}
                className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-black"
              >
                Save User
              </button>
            </div>
          </div>
        </div>
      )}
    </ManagerShell>
  );
}