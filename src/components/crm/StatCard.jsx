export default function StatCard({
  label,
  value,
  note,
  icon: Icon,
  accent = "cyan",
}) {
  const accents = {
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
    purple: "border-violet-400/20 bg-violet-400/10 text-violet-200",
    green: "border-green-400/20 bg-green-400/10 text-green-200",
    yellow: "border-yellow-400/20 bg-yellow-400/10 text-yellow-200",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#071018]/80 p-5 shadow-[0_0_45px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <h3 className="mt-3 text-3xl font-semibold text-white">{value}</h3>
          <p className="mt-3 text-sm text-slate-400">{note}</p>
        </div>

        {Icon && (
          <div className={`rounded-2xl border p-3 ${accents[accent]}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}