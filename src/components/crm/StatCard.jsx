export default function StatCard({ title, value, icon: Icon, subtitle }) {
  return (
    <div className="rounded-[1.5rem] border border-cyan-300/15 bg-white/[0.03] p-5 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-black text-white">
            {value}
          </h3>

          {subtitle && (
            <p className="mt-2 text-sm text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/10 p-3 text-cyan-300">
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}