import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Menu, LogOut, Search, BookOpen,
  Sparkles, Compass, Code2, Layout
} from 'lucide-react'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@/components/ui/command'
import Logo from './Logo'

export default function Navbar({ onOpenMobileMenu, currentTitle, user, onLogout }) {
  const [openCommand, setOpenCommand] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpenCommand((open) => !open)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('cognara_user')
    if (onLogout) onLogout()
    navigate('/login')
  }

  const handleSelectRoute = (path) => {
    setOpenCommand(false)
    setSearchQuery('')
    navigate(path)
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'Learner'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <>
      <header className="topbar">
        {/* Left Section: Mobile Drawer Toggle & Page Context */}
        <div className="flex items-center gap-2.5 shrink-0 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Toggle navigation menu"
            className="rounded-lg border border-[var(--border-color)] p-2 text-[var(--text-main)] hover:bg-[var(--bg-surface-sunken)] lg:hidden transition shrink-0"
          >
            <Menu size={18} />
          </button>

          <span className="font-heading text-sm sm:text-base font-bold text-[var(--text-main)] tracking-tight whitespace-nowrap">
            {currentTitle || 'Dashboard'}
          </span>
        </div>

        {/* Center Section: Global Command Search */}
        <div className="flex-1 max-w-sm sm:max-w-md mx-3 sm:mx-6">
          <button
            type="button"
            onClick={() => setOpenCommand(true)}
            className="search w-full cursor-pointer hover:border-[var(--accent-primary)] transition"
          >
            <Search size={15} className="text-[var(--accent-primary)] shrink-0" />
            <span className="text-xs text-[var(--text-muted)] truncate flex-1 text-left font-sans">
              Search topics, code exercises, concepts...
            </span>
            <kbd className="kbd">Ctrl K</kbd>
          </button>
        </div>

        {/* Right Section: Quick Navigation & Student Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/explore"
            className="btn btn-secondary btn-sm hidden md:inline-flex"
          >
            <Compass size={14} className="text-[var(--accent-primary)]" />
            <span>Explore</span>
          </Link>

          <Link
            to="/tutor"
            className="btn btn-primary btn-sm inline-flex shadow-xs"
          >
            <Sparkles size={13} className="text-[#FCD34D]" />
            <span className="hidden sm:inline">AI Tutor</span>
          </Link>

          {/* User Profile Chip */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] text-white text-xs font-bold flex items-center justify-center font-mono shadow-xs shrink-0">
                {initials}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-[var(--text-main)] leading-tight">
                  {displayName}
                </span>
                <span className="font-mono text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                  Student
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-1.5 rounded-md border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--danger)] hover:border-[var(--danger)] hover:bg-[#FFF1F2] transition"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Global Command Search Dialog */}
      <CommandDialog open={openCommand} onOpenChange={setOpenCommand}>
        <CommandInput
          value={searchQuery}
          onValueChange={setSearchQuery}
          placeholder="Search curriculum topics, misconception detector, tools..."
        />

        <CommandList>
          <CommandEmpty>No matching topics found.</CommandEmpty>

          <CommandGroup heading="Curriculum & Practice">
            <CommandItem onSelect={() => handleSelectRoute('/python-practice')}>
              <div className="flex items-center gap-2.5">
                <Code2 size={15} className="text-[var(--accent-primary)] shrink-0" />
                <div>
                  <span className="font-semibold text-[var(--text-main)]">Python Misconception Detector</span>
                  <span className="text-[11px] text-[var(--text-muted)] ml-2 hidden sm:inline">
                    Diagnose mental models & reasoning
                  </span>
                </div>
              </div>
              <CommandShortcut>Practice</CommandShortcut>
            </CommandItem>

            <CommandItem onSelect={() => handleSelectRoute('/css-practice')}>
              <div className="flex items-center gap-2.5">
                <Layout size={15} className="text-[var(--accent-primary)] shrink-0" />
                <div>
                  <span className="font-semibold text-[var(--text-main)]">CSS Practice Lab</span>
                  <span className="text-[11px] text-[var(--text-muted)] ml-2 hidden sm:inline">
                    Box model, specificity & flexbox
                  </span>
                </div>
              </div>
              <CommandShortcut>Lab</CommandShortcut>
            </CommandItem>

            <CommandItem onSelect={() => handleSelectRoute('/explore')}>
              <div className="flex items-center gap-2.5">
                <Compass size={15} className="text-[var(--accent-primary)] shrink-0" />
                <div>
                  <span className="font-semibold text-[var(--text-main)]">Explore Python & C++ Tracks</span>
                </div>
              </div>
              <CommandShortcut>Curriculum</CommandShortcut>
            </CommandItem>

            <CommandItem onSelect={() => handleSelectRoute('/tutor')}>
              <div className="flex items-center gap-2.5">
                <Sparkles size={15} className="text-[#F59E0B] shrink-0" />
                <div>
                  <span className="font-semibold text-[var(--text-main)]">AI Tutor</span>
                  <span className="text-[11px] text-[var(--text-muted)] ml-2 hidden sm:inline">
                    Local Qwen3:4b dialog
                  </span>
                </div>
              </div>
              <CommandShortcut>Tutor</CommandShortcut>
            </CommandItem>

            <CommandItem onSelect={() => handleSelectRoute('/progress')}>
              <div className="flex items-center gap-2.5">
                <BookOpen size={15} className="text-[var(--accent-primary)] shrink-0" />
                <div>
                  <span className="font-semibold text-[var(--text-main)]">My Learning Progress</span>
                </div>
              </div>
              <CommandShortcut>Progress</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
