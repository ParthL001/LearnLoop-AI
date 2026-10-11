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
      <div className="relative z-50 w-full max-w-xl overflow-hidden rounded-[6px] border border-[#d4d4cf] bg-white text-[#181816] shadow-xl">
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
    <div className="flex h-11 items-center border-b border-[#e3e3df] px-3.5 bg-white">
      <Search size={16} className="shrink-0 text-[#797973] mr-2.5" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-xs text-[#181816] placeholder:text-[#999992] outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onValueChange('')}
          className="p-1 text-[#797973] hover:text-[#181816] mr-1"
        >
          <X size={14} />
        </button>
      )}
      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-[#797973] bg-[#f2f2ef] border border-[#d4d4cf] rounded-[3px]">
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
    <div className="py-8 text-center text-xs text-[#797973]">
      {children}
    </div>
  )
}

export function CommandGroup({ heading, children }) {
  return (
    <div className="px-1 py-1">
      {heading && (
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#797973]">
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
      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-[4px] text-[#181816] hover:bg-[#f2f2ef] transition-colors focus-visible:bg-[#eef2ff] focus-visible:text-[#3730a3] ${className}`}
    >
      {children}
    </button>
  )
}

export function CommandShortcut({ children }) {
  return (
    <span className="ml-auto text-[10px] text-[#797973] bg-[#f2f2ef] border border-[#d4d4cf] px-1.5 py-0.5 rounded-[3px]">
      {children}
    </span>
  )
}
