import { useState, useEffect, useRef } from 'react'
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/40 backdrop-blur-xs">
      <div
        role="presentation"
        className="fixed inset-0"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-xl overflow-hidden rounded-[6px] border border-[#cbd5e1] bg-white text-[#0f172a] shadow-xl">
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
    <div className="flex h-11 items-center border-b border-[#e2e8f0] px-3.5 bg-white">
      <Search size={16} className="shrink-0 text-[#64748b] mr-2.5" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-xs text-[#0f172a] placeholder:text-[#94a3b8] outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onValueChange('')}
          className="p-1 text-[#64748b] hover:text-[#0f172a] mr-1"
        >
          <X size={14} />
        </button>
      )}
      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-[#64748b] bg-[#f1f5f9] border border-[#cbd5e1] rounded-[3px]">
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
    <div className="py-8 text-center text-xs text-[#64748b]">
      {children}
    </div>
  )
}

export function CommandGroup({ heading, children }) {
  return (
    <div className="px-1 py-1">
      {heading && (
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
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
      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-[4px] text-[#0f172a] hover:bg-[#f1f5f9] transition-colors focus-visible:bg-[#eff6ff] focus-visible:text-[#1d4ed8] ${className}`}
    >
      {children}
    </button>
  )
}

export function CommandShortcut({ children }) {
  return (
    <span className="ml-auto text-[10px] text-[#64748b] bg-[#f1f5f9] border border-[#cbd5e1] px-1.5 py-0.5 rounded-[3px]">
      {children}
    </span>
  )
}
