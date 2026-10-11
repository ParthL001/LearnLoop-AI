export function Input({ className = '', type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={`flex h-9 w-full rounded-[6px] border border-[#303846] bg-[#1B2028] px-3 py-1.5 text-xs text-[#F8FAFC] placeholder:text-[#7F8A9B] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] outline-none transition-colors disabled:cursor-not-allowed disabled:bg-[#14171C] disabled:text-[#7F8A9B] ${className}`}
      {...props}
    />
  )
}
