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
    default: 'bg-[#3B82F6] text-white border border-[#3B82F6] hover:bg-[#2563EB]',
    outline: 'bg-transparent text-[#F8FAFC] border border-[#303846] hover:bg-[#1B2028]',
    secondary: 'bg-[#1B2028] text-[#F8FAFC] border border-[#303846] hover:bg-[#202733]',
    ghost: 'bg-transparent text-[#A8B3C4] hover:bg-[#1B2028] hover:text-[#F8FAFC]',
    destructive: 'bg-[#EF4444] text-white border border-[#EF4444] hover:bg-[#DC2626]',
    subtle: 'bg-[#152746] text-[#93C5FD] border border-[#1E3A8A] hover:bg-[#1E3A8A]',
  }

  const sizes = {
    default: 'h-9 px-4 py-2 rounded-[6px] gap-2',
    sm: 'h-8 px-3 text-[11px] rounded-[6px] gap-1.5',
    lg: 'h-11 px-6 text-sm rounded-[8px] gap-2.5',
    icon: 'h-9 w-9 rounded-[6px]',
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
