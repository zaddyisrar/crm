import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AutoLogout from "./AutoLogout";
import AuthGuard from "./AuthGuard";

export default function PageShell({ title, subtitle, children }) {
  return (
    <AuthGuard allowedRoles={["agent"]}>
      <main className="min-h-screen overflow-x-hidden bg-[#03060b] text-white">
        <AutoLogout />

        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.13),transparent_32%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.08),transparent_28%),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:100%_100%,100%_100%,64px_64px,64px_64px]" />

        <Sidebar />

        <section className="relative z-10 px-5 py-6 lg:ml-72 lg:px-8 xl:px-10">
          <Topbar title={title} subtitle={subtitle} />
          {children}
        </section>
      </main>
    </AuthGuard>
  );
}