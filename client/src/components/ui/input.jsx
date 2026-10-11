export function Input({ className = '', type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={`flex h-9 w-full rounded-[5px] border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none transition-colors disabled:cursor-not-allowed disabled:bg-[#f1f5f9] ${className}`}
      {...props}
    />
  )
}
