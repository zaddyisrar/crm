export default function StatCard({ label, value, note, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-cyan-400/10 bg-white/[0.035] p-5 shadow-[0_0_45px_rgba(34,211,238,0.04)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <h3 className="mt-3 text-3xl font-semibold text-white">{value}</h3>
          <p className="mt-2 text-xs text-cyan-200/70">{note}</p>
        </div>

        {Icon && (
          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-3 text-cyan-200">
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}