export function Input({ className = '', type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={`flex h-9 w-full rounded-[4px] border border-[#d4d4cf] bg-white px-3 py-1.5 text-xs text-[#181816] placeholder:text-[#999992] focus:border-[#3730a3] focus:ring-1 focus:ring-[#3730a3] outline-none transition-colors disabled:cursor-not-allowed disabled:bg-[#f2f2ef] ${className}`}
      {...props}
    />
  )
}
