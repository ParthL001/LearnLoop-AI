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
    'inline-flex items-center justify-center font-medium transition-all duration-150 border select-none disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2'

  const sizeStyles = {
    xs: 'text-[11px] px-2 py-0.5 rounded-[4px] gap-1 font-semibold',
    sm: 'text-xs px-2.5 py-1 rounded-[4px] gap-1.5 font-medium',
    md: 'text-xs px-3.5 py-1.5 rounded-[6px] gap-2 font-semibold',
    lg: 'text-sm px-4.5 py-2.5 rounded-[6px] gap-2 font-semibold',
  }

  const variantStyles = {
    primary: 'bg-[#3D5F58] text-[#FFFFFF] border-[#3D5F58] hover:bg-[#2E4742] active:bg-[#233834]',
    secondary: 'bg-[#FFFFFF] text-[#231F20] border-[#D8D8CF] hover:bg-[#F2F2EB] hover:border-[#231F20]',
    subtle: 'bg-[#E2ECE9] text-[#2E4742] border-[#C2D7D2] hover:bg-[#D1E3DF]',
    accent: 'bg-[#F5B726] text-[#231F20] border-[#D99B16] hover:bg-[#E5A716]',
    sky: 'bg-[#8BB2DE] text-[#231F20] border-[#729ECF] hover:bg-[#729ECF]',
    ghost: 'bg-transparent text-[#231F20] border-transparent hover:bg-[#E5E5DC]',
    danger: 'bg-[#E97B77] text-[#FFFFFF] border-[#D66965] hover:bg-[#D66965]',
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
      className={`bg-[#FFFFFF] border border-[#D8D8CF] rounded-[8px] text-[#231F20] shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${className}`}
      {...props}
    >
      {header && <div className="px-5 py-3.5 border-b border-[#D8D8CF] bg-[#FAF9F5] rounded-t-[8px]">{header}</div>}
      <div className="p-5">{children}</div>
      {footer && <div className="px-5 py-3 border-t border-[#D8D8CF] bg-[#FAF9F5] rounded-b-[8px]">{footer}</div>}
    </div>
  )
}

export function Badge({ children, variant = 'neutral', className = '' }) {
  const variantStyles = {
    neutral: 'bg-[#F2F2EB] text-[#231F20] border-[#D8D8CF]',
    accent: 'bg-[#E2ECE9] text-[#2E4742] border-[#C2D7D2]',
    ochre: 'bg-[#FEF3C7] text-[#92400E] border-[#F5B726]',
    sky: 'bg-[#E0F2FE] text-[#0369A1] border-[#8BB2DE]',
    pink: 'bg-[#FCE7E7] text-[#991B1B] border-[#E97B77]',
    success: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
    warning: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
    danger: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase border rounded-[4px] font-mono ${variantStyles[variant] || variantStyles.neutral} ${className}`}
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
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-[#6B6864]">
          <span>{label}</span>
          <span className="text-[#231F20] font-semibold font-mono">{percentage}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
        className="w-full h-2 bg-[#E5E5DC] border border-[#D8D8CF] rounded-[3px] overflow-hidden"
      >
        <div
          className="h-full bg-[#3D5F58] transition-all duration-300 rounded-r-[2px]"
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
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#231F20] mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#D8D8CF] rounded-[6px] text-[#231F20] placeholder:text-[#A8A29E] focus:border-[#3D5F58] focus:outline-none focus:ring-1 focus:ring-[#3D5F58] transition-colors disabled:opacity-50 disabled:bg-[#F2F2EB] ${
          error ? 'border-[#E97B77] focus:border-[#E97B77] focus:ring-[#E97B77]' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-[11px] text-[#E97B77]">{error}</p>}
      {helperText && !error && <p className="mt-1 text-[11px] text-[#6B6864]">{helperText}</p>}
    </div>
  )
}
