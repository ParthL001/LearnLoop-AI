export function FieldGroup({ className = '', children, ...props }) {
  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function Field({ className = '', children, ...props }) {
  return (
    <div className={`space-y-1.5 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function FieldLabel({ className = '', children, htmlFor, ...props }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-xs font-semibold text-[#181816] ${className}`}
      {...props}
    >
      {children}
    </label>
  )
}

export function FieldDescription({ className = '', children, ...props }) {
  return (
    <p className={`text-[11px] text-[#797973] leading-normal ${className}`} {...props}>
      {children}
    </p>
  )
}
