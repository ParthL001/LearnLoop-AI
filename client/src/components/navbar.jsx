import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Menu, Home, LayoutDashboard, Info, Mail, LogOut,
  Search, BookOpen, Target, Sparkles, Compass, BarChart2
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
import { useApp } from '@/context/AppContext'
import Logo from './Logo'

export default function Navbar({ onOpenMobileMenu, currentTitle, user, onLogout }) {
  const [openCommand, setOpenCommand] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { topics } = useApp()

  // Listen for Ctrl+K or Cmd+K
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

  // Filter topics based on search
  const filteredTopics = (topics || []).filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <header className="sticky top-0 z-30 flex h-15 items-center justify-between border-b border-[#D8D8CF] bg-[#FFFFFF] px-4 sm:px-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        {/* Left side: mobile toggle & current title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Toggle navigation menu"
            className="rounded-[4px] border border-[#D8D8CF] p-1.5 text-[#231F20] hover:bg-[#F2F2EB] lg:hidden transition-colors"
          >
            <Menu size={16} />
          </button>

          <div className="flex items-center gap-2.5">
            <Logo className="h-5 w-auto lg:hidden shrink-0" />
            <h1 className="font-heading text-lg font-bold text-[#231F20] tracking-tight">
              {currentTitle || 'Dashboard'}
            </h1>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xs sm:max-w-sm mx-3">
          <button
            type="button"
            onClick={() => setOpenCommand(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[#6B6864] bg-[#F2F2EB] border border-[#D8D8CF] rounded-[6px] hover:bg-[#FFFFFF] hover:text-[#231F20] hover:border-[#3D5F58] transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search size={14} className="shrink-0 text-[#3D5F58]" />
              <span className="truncate">Search concepts, practice, lessons...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#231F20] bg-[#E5E5DC] border border-[#D8D8CF] rounded-[3px] shrink-0 ml-2">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right: Quick actions and learner status */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <nav className="flex items-center gap-1 mr-1">
            <Link
              to="/explore"
              className="px-2.5 py-1 text-xs font-semibold text-[#231F20] hover:text-[#3D5F58] hover:bg-[#F2F2EB] rounded-[4px] transition-colors hidden md:inline-flex items-center gap-1.5"
            >
              <Compass size={13} className="text-[#3D5F58]" />
              <span>Explore</span>
            </Link>

            <Link
              to="/tutor"
              className="px-2.5 py-1 text-xs font-semibold text-[#FFFFFF] bg-[#3D5F58] border border-[#3D5F58] rounded-[4px] hover:bg-[#2E4742] transition-colors inline-flex items-center gap-1.5"
            >
              <Sparkles size={13} className="text-[#F5B726]" />
              <span>AI Tutor</span>
            </Link>
          </nav>

          {/* User badge & logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#D8D8CF]">
            {user && (
              <span className="text-xs text-[#231F20] hidden xl:inline-block font-semibold">
                {user.name || user.email?.split('@')[0] || 'Learner'}
              </span>
            )}

            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-1.5 rounded-[4px] border border-[#D8D8CF] text-[#6B6864] hover:text-[#E97B77] hover:border-[#E97B77] hover:bg-[#FEF2F2] transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Global Command Search Dialog */}
      <CommandDialog open={openCommand} onOpenChange={setOpenCommand}>
        <CommandInput
          value={searchQuery}
          onValueChange={setSearchQuery}
          placeholder="Search learning concepts, practice questions, modules..."
        />

        <CommandList>
          {filteredTopics.length === 0 && searchQuery ? (
            <CommandEmpty>No matching topics found for &quot;{searchQuery}&quot;</CommandEmpty>
          ) : null}

          {/* Core Curriculum Routes */}
          <CommandGroup heading="Curriculum Concepts">
            {filteredTopics.map((topic) => (
              <CommandItem
                key={topic.id}
                onSelect={() => handleSelectRoute(`/lessons/${topic.id}`)}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen size={14} className="text-[#3B82F6] shrink-0" />
                  <div>
                    <span className="font-semibold text-[#F8FAFC]">{topic.title}</span>
                    <span className="text-[11px] text-[#7F8A9B] ml-2 hidden sm:inline">
                      {topic.subject} · {topic.mastery || 0}% Mastery
                    </span>
                  </div>
                </div>
                <CommandShortcut>Lesson</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          {/* Quick Navigation Pages */}
          <CommandGroup heading="Platform Navigation">
            <CommandItem onSelect={() => handleSelectRoute('/dashboard')}>
              <div className="flex items-center gap-2.5">
                <LayoutDashboard size={14} className="text-[#A8B3C4]" />
                <span>Dashboard</span>
              </div>
              <CommandShortcut>Home</CommandShortcut>
            </CommandItem>

            <CommandItem onSelect={() => handleSelectRoute('/tutor')}>
              <div className="flex items-center gap-2.5">
                <Sparkles size={14} className="text-[#3B82F6]" />
                <span>AI Tutor (Interactive Socratic Guide)</span>
              </div>
              <CommandShortcut>Tutor</CommandShortcut>
            </CommandItem>

            <CommandItem onSelect={() => handleSelectRoute('/practice')}>
              <div className="flex items-center gap-2.5">
                <Target size={14} className="text-[#4ADE80]" />
                <span>Targeted Practice Probes</span>
              </div>
              <CommandShortcut>Practice</CommandShortcut>
            </CommandItem>

            <CommandItem onSelect={() => handleSelectRoute('/progress')}>
              <div className="flex items-center gap-2.5">
                <BarChart2 size={14} className="text-[#FCD34D]" />
                <span>Progress & Mastery Calibration</span>
              </div>
              <CommandShortcut>Stats</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
