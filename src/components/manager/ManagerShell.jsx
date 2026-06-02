"use client";

import ManagerSidebar from "./ManagerSidebar";
import ManagerTopbar from "./ManagerTopbar";

export default function ManagerShell({ children }) {
  return (
    <div className="min-h-screen overflow-hidden bg-[#03060b] text-white">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(34,211,238,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.045)_1px,transparent_1px)] bg-[size:70px_70px]" />

      <div className="fixed left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[150px]" />

      <ManagerSidebar />

      <main className="relative p-6 lg:ml-72">
        <div className="mx-auto max-w-[1600px]">
          <ManagerTopbar />

          {children}
        </div>
      </main>
    </div>
  );
}