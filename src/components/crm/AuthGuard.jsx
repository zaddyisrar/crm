"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const ROLE_HOME = {
  agent: "/dashboard",
  manager: "/manager",
  admin: "/admin",
};

const ROLE_ALLOWED_PATHS = {
  agent: ["/dashboard", "/attendance", "/analytics"],
  manager: ["/manager"],
  admin: ["/admin"],
};

function isAllowedPath(role, pathname) {
  const allowedPaths = ROLE_ALLOWED_PATHS[role] || [];

  return allowedPaths.some((path) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  });
}

export default function AuthGuard({ children, allowedRoles = [] }) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("crmRole");
    const userId = localStorage.getItem("crmUserId");

    if (!role || !userId) {
      setAllowed(false);
      setChecking(false);
      router.replace("/login");
      return;
    }

    const normalizedRole = String(role).toLowerCase();

    if (allowedRoles.length && !allowedRoles.includes(normalizedRole)) {
      setAllowed(false);
      setChecking(false);
      router.replace(ROLE_HOME[normalizedRole] || "/login");
      return;
    }

    if (!isAllowedPath(normalizedRole, pathname)) {
      setAllowed(false);
      setChecking(false);
      router.replace(ROLE_HOME[normalizedRole] || "/login");
      return;
    }

    setAllowed(true);
    setChecking(false);
  }, [pathname, router, allowedRoles]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#03060b] text-white">
        <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.04] px-6 py-5 text-center shadow-[0_0_50px_rgba(34,211,238,0.12)]">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">
            CRM Security
          </p>
          <h1 className="mt-2 text-lg font-black text-white">
            Verifying Access...
          </h1>
        </div>
      </main>
    );
  }

  if (!allowed) return null;

  return children;
}