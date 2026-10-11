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
    default: 'bg-[#3730a3] text-white border border-[#3730a3] hover:bg-[#312e81]',
    outline: 'bg-white text-[#181816] border border-[#d4d4cf] hover:bg-[#f2f2ef]',
    secondary: 'bg-[#f2f2ef] text-[#181816] border border-[#e3e3df] hover:bg-[#e8e8e4]',
    ghost: 'bg-transparent text-[#494944] hover:bg-[#f2f2ef] hover:text-[#181816]',
    destructive: 'bg-[#991b1b] text-white border border-[#991b1b] hover:bg-[#7f1d1d]',
    subtle: 'bg-[#eef2ff] text-[#3730a3] border border-[#c7d2fe] hover:bg-[#e0e7ff]',
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
