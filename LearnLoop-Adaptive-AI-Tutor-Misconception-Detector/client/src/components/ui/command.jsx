import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

export function CommandDialog({ open, onOpenChange, children }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-xs">
      <div
        role="presentation"
        className="fixed inset-0"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-xl overflow-hidden rounded-[8px] border border-[#303846] bg-[#14171C] text-[#F8FAFC] shadow-2xl">
        {children}
      </div>
    </div>
  )
}

export function CommandInput({ value, onValueChange, placeholder = 'Search topics or lessons...', onClose }) {
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="flex h-11 items-center border-b border-[#303846] px-3.5 bg-[#14171C]">
      <Search size={16} className="shrink-0 text-[#7F8A9B] mr-2.5" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-xs text-[#F8FAFC] placeholder:text-[#7F8A9B] outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onValueChange('')}
          className="p-1 text-[#7F8A9B] hover:text-[#F8FAFC] mr-1"
        >
          <X size={14} />
        </button>
      )}
      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-[#A8B3C4] bg-[#1B2028] border border-[#303846] rounded-[3px]">
        ESC
      </kbd>
    </div>
  )
}

export function CommandList({ children, className = '' }) {
  return (
    <div className={`max-h-80 overflow-y-auto p-2 space-y-2 ${className}`}>
      {children}
    </div>
  )
}

export function CommandEmpty({ children = 'No matching topics found.' }) {
  return (
    <div className="py-8 text-center text-xs text-[#7F8A9B]">
      {children}
    </div>
  )
}

export function CommandGroup({ heading, children }) {
  return (
    <div className="px-1 py-1">
      {heading && (
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7F8A9B]">
          {heading}
        </div>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

export function CommandItem({ onSelect, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-[5px] text-[#F8FAFC] hover:bg-[#1B2028] transition-colors focus-visible:bg-[#152746] focus-visible:text-[#3B82F6] ${className}`}
    >
      {children}
    </button>
  )
}

export function CommandShortcut({ children }) {
  return (
    <span className="text-[10px] tracking-widest text-[#7F8A9B] uppercase font-medium">
      {children}
    </span>
  )
}
