export default function ActionButton({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-500/50',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/20',
    ghost: 'text-cyan-300 hover:bg-cyan-500/10 border border-transparent',
    danger: 'bg-red-900/30 hover:bg-red-800/40 text-red-300 border border-red-500/30'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
