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
    'inline-flex items-center justify-center font-medium transition-colors border select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2'

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1 rounded-[5px] gap-1.5',
    md: 'text-xs px-3.5 py-1.5 rounded-[6px] gap-2 font-semibold',
    lg: 'text-sm px-4.5 py-2.5 rounded-[6px] gap-2 font-semibold',
  }

  const variantStyles = {
    primary: 'bg-[#2563eb] text-white border-[#2563eb] hover:bg-[#1d4ed8]',
    secondary: 'bg-white text-[#0f172a] border-[#cbd5e1] hover:bg-[#f8fafc]',
    subtle: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe] hover:bg-[#dbeafe]',
    ghost: 'bg-transparent text-[#334155] border-transparent hover:bg-[#f1f5f9] hover:text-[#0f172a]',
    danger: 'bg-[#dc2626] text-white border-[#dc2626] hover:bg-[#b91c1c]',
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
      className={`bg-white border border-[#e2e8f0] rounded-[6px] text-[#0f172a] shadow-xs ${className}`}
      {...props}
    >
      {header && <div className="px-5 py-3.5 border-b border-[#e2e8f0]">{header}</div>}
      <div className="p-5">{children}</div>
      {footer && <div className="px-5 py-3 border-t border-[#e2e8f0] bg-[#f8fafc]">{footer}</div>}
    </div>
  )
}

export function Badge({ children, variant = 'neutral', className = '' }) {
  const variantStyles = {
    neutral: 'bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]',
    accent: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]',
    success: 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]',
    warning: 'bg-[#fffbeb] text-[#92400e] border-[#fde68a]',
    danger: 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase border rounded-[4px] ${variantStyles[variant]} ${className}`}
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
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-[#475569]">
          <span>{label}</span>
          <span className="text-[#0f172a] font-semibold">{percentage}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
        className="w-full h-2 bg-[#e2e8f0] rounded-[3px] overflow-hidden"
      >
        <div
          className="h-full bg-[#2563eb] transition-all duration-300"
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
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#0f172a] mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full text-xs px-3 py-2 rounded-[5px] border bg-white text-[#0f172a] placeholder:text-[#94a3b8] transition-colors focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none disabled:bg-[#f1f5f9] disabled:cursor-not-allowed ${
          error ? 'border-[#dc2626]' : 'border-[#cbd5e1]'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-[11px] text-[#dc2626]">{error}</p>}
      {helperText && !error && <p className="mt-1 text-[11px] text-[#64748b]">{helperText}</p>}
    </div>
  )
}
