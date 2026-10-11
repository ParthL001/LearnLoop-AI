import { Menu } from 'lucide-react'

export default function Navbar({ onOpenMobileMenu, currentTitle }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#e3e3df] bg-[#ffffff] px-4 sm:px-6">
      {/* Title & mobile toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="rounded-[4px] border border-[#d4d4cf] p-1.5 text-[#494944] hover:bg-[#f2f2ef] lg:hidden"
        >
          <Menu size={16} />
        </button>

        <div>
          <h1 className="text-sm font-bold text-[#181816]">
            {currentTitle || 'Dashboard'}
          </h1>
        </div>
      </div>

      {/* Right side simple user status */}
      <div className="flex items-center gap-3 text-xs">
        <span className="hidden sm:inline-block text-[#797973]">
          Student Workspace
        </span>
        <div className="flex items-center gap-2 border-l border-[#e3e3df] pl-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-[#3730a3] text-white text-[11px] font-bold">
            A
          </div>
          <span className="font-semibold text-[#181816] hidden md:inline">Alex Rivera</span>
        </div>
      </div>
    </header>
  )
}
