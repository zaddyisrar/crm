import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function PageShell({ title, subtitle, children }) {
  return (
    <main className="min-h-screen bg-[#03060b] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_35%),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_100%,60px_60px,60px_60px]" />
      <Sidebar />

      <section className="relative z-10 px-5 py-6 lg:ml-72 lg:px-8">
        <Topbar title={title} subtitle={subtitle} />
        {children}
      </section>
    </main>
  );
}