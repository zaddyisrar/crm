"use client";

import AdminSidebar from "./AdminSidebar";

export default function AdminShell({
  children,
  title,
  subtitle,
}) {
  return (
    <div className="min-h-screen overflow-hidden bg-[#03060b] text-white">
      
      <div className="fixed inset-0 bg-[linear-gradient(rgba(34,211,238,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.045)_1px,transparent_1px)] bg-[size:70px_70px]" />

      <div className="fixed left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[150px]" />

      <AdminSidebar />

      <main className="relative lg:ml-72 p-6">
        <div className="mx-auto max-w-[1600px]">

          {(title || subtitle) && (
            <div className="mb-6 rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-7 backdrop-blur-xl">
              
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
                Admin Control Center
              </p>

              {title && (
                <h1 className="mt-3 text-4xl font-black">
                  {title}
                </h1>
              )}

              {subtitle && (
                <p className="mt-2 text-sm text-slate-500">
                  {subtitle}
                </p>
              )}

            </div>
          )}

          {children}

        </div>
      </main>

    </div>
  );
}