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
    xs: 'text-[11px] px-2 py-0.5 rounded-md gap-1 font-semibold',
    sm: 'text-xs px-2.5 py-1 rounded-md gap-1.5 font-medium',
    md: 'text-xs px-3.5 py-1.5 rounded-lg gap-2 font-semibold',
    lg: 'text-sm px-4.5 py-2.5 rounded-lg gap-2 font-semibold',
  }

  const variantStyles = {
    primary: 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] hover:bg-[var(--accent-hover)] shadow-xs font-semibold',
    secondary: 'bg-white text-[var(--text-main)] border-[var(--border-color)] hover:bg-[var(--bg-surface-sunken)] shadow-xs font-semibold',
    subtle: 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] border-[#C7D2FE] hover:bg-[#E0E7FF]',
    accent: 'bg-[#F59E0B] text-slate-900 border-[#D97706] hover:bg-[#D97706]',
    sky: 'bg-[#0284C7] text-white border-[#0284C7] hover:bg-[#0369A1]',
    ghost: 'bg-transparent text-[var(--text-main)] border-transparent hover:bg-[var(--bg-surface-sunken)]',
    danger: 'bg-[var(--danger)] text-white border-[var(--danger)] hover:opacity-90',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '', header, footer, ...props }) {
  return (
    <div
      className={`bg-white border border-[var(--border-color)] rounded-xl text-[var(--text-main)] shadow-[var(--shadow-card)] ${className}`}
      {...props}
    >
      {header && <div className="px-5 py-3.5 border-b border-[var(--border-color)] bg-[var(--bg-surface-sunken)]/60 rounded-t-xl">{header}</div>}
      <div className="p-5">{children}</div>
      {footer && <div className="px-5 py-3 border-t border-[var(--border-color)] bg-[var(--bg-surface-sunken)]/60 rounded-b-xl">{footer}</div>}
    </div>
  )
}

export function Badge({ children, variant = 'neutral', className = '' }) {
  const variantStyles = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    accent: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    ochre: 'bg-amber-50 text-amber-800 border-amber-200',
    sky: 'bg-sky-50 text-sky-800 border-sky-200',
    pink: 'bg-pink-50 text-pink-800 border-pink-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase border rounded-md font-mono ${variantStyles[variant] || variantStyles.neutral} ${className}`}
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
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-[var(--text-muted)]">
          <span>{label}</span>
          <span className="text-[var(--text-main)] font-semibold font-mono">{percentage}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
        className="w-full h-2 bg-slate-100 border border-[var(--border-color)] rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-[var(--accent-primary)] transition-all duration-300 rounded-full"
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
        <label htmlFor={inputId} className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 text-xs bg-white border border-[var(--border-color)] rounded-lg text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors disabled:opacity-50 disabled:bg-slate-50 ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-[11px] text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-[11px] text-[var(--text-muted)]">{helperText}</p>}
    </div>
  )
}
