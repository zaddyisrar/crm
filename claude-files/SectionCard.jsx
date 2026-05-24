export default function SectionCard({ title, subtitle, children, className = '' }) {
  return (
    <div
      className={`bg-gradient-to-br from-slate-900/50 to-slate-900/20 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-md shadow-lg hover:border-cyan-500/40 transition-all duration-300 ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-6 pb-4 border-b border-cyan-500/10">
          {title && <h3 className="text-xl font-bold text-cyan-300 mb-1">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
