"use client";

export default function ActionButton({
  children,
  icon: Icon,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
}) {
  const styles =
    variant === "danger"
      ? "border-red-400/20 bg-red-400/10 text-red-300 hover:bg-red-400/15"
      : variant === "secondary"
      ? "border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-300/30 hover:text-cyan-300"
      : "border-cyan-300/20 bg-cyan-400 text-black hover:bg-cyan-300";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition ${styles} ${className}`}
    >
      {Icon && <Icon size={17} />}
      {children}
    </button>
  );
}