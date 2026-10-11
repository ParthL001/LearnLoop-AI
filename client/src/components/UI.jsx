export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors border select-none disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2'

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1 rounded-[5px] gap-1.5',
    md: 'text-xs px-3.5 py-1.5 rounded-[6px] gap-2 font-semibold',
    lg: 'text-sm px-4.5 py-2.5 rounded-[6px] gap-2 font-semibold',
  }

  const variantStyles = {
    primary: 'bg-[#3B82F6] text-[#F8FAFC] border-[#3B82F6] hover:bg-[#2563EB]',
    secondary: 'bg-[#1B2028] text-[#F8FAFC] border-[#303846] hover:bg-[#202733] hover:border-[#475569]',
    subtle: 'bg-[#152746] text-[#60A5FA] border-[#1E3A8A] hover:bg-[#1E3A8A]/60',
    ghost: 'bg-transparent text-[#A8B3C4] border-transparent hover:bg-[#1B2028] hover:text-[#F8FAFC]',
    danger: 'bg-[#EF4444] text-white border-[#EF4444] hover:bg-[#DC2626]',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '', header, footer, ...props }) {
  return (
    <div
      className={`bg-[#14171C] border border-[#303846] rounded-[8px] text-[#F8FAFC] ${className}`}
      {...props}
    >
      {header && <div className="px-5 py-3.5 border-b border-[#303846]">{header}</div>}
      <div className="p-5">{children}</div>
      {footer && <div className="px-5 py-3 border-t border-[#303846] bg-[#080A0D]/60 rounded-b-[8px]">{footer}</div>}
    </div>
  )
}

export function Badge({ children, variant = 'neutral', className = '' }) {
  const variantStyles = {
    neutral: 'bg-[#1B2028] text-[#A8B3C4] border-[#303846]',
    accent: 'bg-[#152746] text-[#60A5FA] border-[#1E3A8A]',
    success: 'bg-[#052E16] text-[#4ADE80] border-[#166534]',
    warning: 'bg-[#451A03] text-[#FCD34D] border-[#78350F]',
    danger: 'bg-[#450A0A] text-[#F87171] border-[#7F1D1D]',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase border rounded-[4px] ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export function ProgressBar({ value = 0, max = 100, label, className = '' }) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)))

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-[#A8B3C4]">
          <span>{label}</span>
          <span className="text-[#F8FAFC] font-semibold">{percentage}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
        className="w-full h-2 bg-[#1B2028] border border-[#303846] rounded-[3px] overflow-hidden"
      >
        <div
          className="h-full bg-[#3B82F6] transition-all duration-300 rounded-r-[2px]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export function Input({ label, error, helperText, className = '', id, ...props }) {
  const inputId = id || props.name || Math.random().toString(36).substring(2, 9)

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#F8FAFC] mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 text-xs bg-[#14171C] border border-[#303846] rounded-[6px] text-[#F8FAFC] placeholder:text-[#7F8A9B] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] transition-colors disabled:opacity-50 disabled:bg-[#080A0D] ${
          error ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-[11px] text-[#F87171]">{error}</p>}
      {helperText && !error && <p className="mt-1 text-[11px] text-[#7F8A9B]">{helperText}</p>}
    </div>
  )
}
