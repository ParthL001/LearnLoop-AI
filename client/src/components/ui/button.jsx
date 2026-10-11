export function Button({
  className = '',
  variant = 'default',
  size = 'default',
  type = 'button',
  disabled = false,
  children,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center text-xs font-semibold select-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    default: 'bg-[#2563eb] text-white border border-[#2563eb] hover:bg-[#1d4ed8]',
    outline: 'bg-white text-[#0f172a] border border-[#cbd5e1] hover:bg-[#f8fafc]',
    secondary: 'bg-[#f1f5f9] text-[#0f172a] border border-[#e2e8f0] hover:bg-[#e2e8f0]',
    ghost: 'bg-transparent text-[#334155] hover:bg-[#f1f5f9] hover:text-[#0f172a]',
    destructive: 'bg-[#dc2626] text-white border border-[#dc2626] hover:bg-[#b91c1c]',
    subtle: 'bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] hover:bg-[#dbeafe]',
  }

  const sizes = {
    default: 'h-9 px-4 py-2 rounded-[4px] gap-2',
    sm: 'h-8 px-3 text-[11px] rounded-[4px] gap-1.5',
    lg: 'h-11 px-6 text-sm rounded-[6px] gap-2.5',
    icon: 'h-9 w-9 rounded-[4px]',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
