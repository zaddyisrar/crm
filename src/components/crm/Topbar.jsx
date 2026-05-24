export default function Topbar({ title = "Dashboard", subtitle = "Welcome back." }) {
  return (
    <header className="mb-8 flex flex-col justify-between gap-4 border-b border-cyan-400/10 pb-6 md:flex-row md:items-center">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/70">
          Agent Panel
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
      </div>

      <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] px-5 py-3 text-sm text-cyan-100">
        Muhammad Israr · Active
      </div>
    </header>
  );
}