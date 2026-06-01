export default function SectionCard({ title, subtitle, children }) {
  return (
    <div className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6 backdrop-blur-xl">
      {(title || subtitle) && (
        <div className="mb-5">
          {title && (
            <h2 className="text-xl font-black text-white">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {children}
    </div>
  );
}