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
    sm: 'text-xs px-2.5 py-1 rounded-[4px] gap-1.5',
    md: 'text-xs px-3.5 py-1.5 rounded-[6px] gap-2 font-semibold',
    lg: 'text-sm px-4.5 py-2.5 rounded-[6px] gap-2 font-semibold',
  }

  const variantStyles = {
    primary: 'bg-[#3730a3] text-white border-[#3730a3] hover:bg-[#312e81]',
    secondary: 'bg-white text-[#181816] border-[#d4d4cf] hover:bg-[#f2f2ef]',
    subtle: 'bg-[#eef2ff] text-[#3730a3] border-[#c7d2fe] hover:bg-[#e0e7ff]',
    ghost: 'bg-transparent text-[#494944] border-transparent hover:bg-[#f2f2ef] hover:text-[#181816]',
    danger: 'bg-[#991b1b] text-white border-[#991b1b] hover:bg-[#7f1d1d]',
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
      className={`bg-white border border-[#e3e3df] rounded-[6px] text-[#181816] ${className}`}
      {...props}
    >
      {header && <div className="px-5 py-4 border-b border-[#e3e3df]">{header}</div>}
      <div className="p-5">{children}</div>
      {footer && <div className="px-5 py-3 border-t border-[#e3e3df] bg-[#fbfbfa]">{footer}</div>}
    </div>
  )
}

export function Badge({ children, variant = 'neutral', className = '' }) {
  const variantStyles = {
    neutral: 'bg-[#f2f2ef] text-[#494944] border-[#e3e3df]',
    accent: 'bg-[#eef2ff] text-[#3730a3] border-[#c7d2fe]',
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
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-[#494944]">
          <span>{label}</span>
          <span className="text-[#181816] font-semibold">{percentage}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
        className="w-full h-2 bg-[#e8e8e4] rounded-[2px] overflow-hidden"
      >
        <div
          className="h-full bg-[#3730a3] transition-all duration-300"
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
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#181816] mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full text-xs px-3 py-2 rounded-[4px] border bg-white text-[#181816] placeholder:text-[#999992] transition-colors focus:border-[#3730a3] focus:ring-1 focus:ring-[#3730a3] outline-none disabled:bg-[#f2f2ef] disabled:cursor-not-allowed ${
          error ? 'border-[#dc2626]' : 'border-[#d4d4cf]'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-[11px] text-[#dc2626]">{error}</p>}
      {helperText && !error && <p className="mt-1 text-[11px] text-[#797973]">{helperText}</p>}
    </div>
  )
}
