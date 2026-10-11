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
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#e3e3df] bg-[#ffffff] px-4 sm:px-6">
        {/* Left side: mobile toggle & current title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Toggle navigation menu"
            className="rounded-[4px] border border-[#d4d4cf] p-1.5 text-[#494944] hover:bg-[#f2f2ef] lg:hidden"
          >
            <Menu size={16} />
          </button>

          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-[#181816]">
              {currentTitle || 'Dashboard'}
            </h1>
          </div>
        </div>

        {/* Center: shadcn Command Search Bar */}
        <div className="flex-1 max-w-xs sm:max-w-sm mx-3">
          <button
            type="button"
            onClick={() => setOpenCommand(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[#797973] bg-[#f9f9f7] border border-[#d4d4cf] rounded-[4px] hover:bg-[#f2f2ef] hover:text-[#181816] transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search size={14} className="shrink-0 text-[#797973]" />
              <span className="truncate">Search topics, lessons, practice...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-[#797973] bg-white border border-[#d4d4cf] rounded-[3px] shrink-0 ml-2">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right: Header navigation links */}
        <div className="flex items-center gap-1 sm:gap-2">
          <nav className="flex items-center gap-1 sm:gap-1.5 mr-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#494944] rounded-[4px] hover:bg-[#f2f2ef] hover:text-[#181816] transition-colors"
            >
              <Home size={14} />
              <span className="hidden sm:inline">Home</span>
            </Link>

            <button
              type="button"
              onClick={onOpenMobileMenu}
              title="Open Dashboard Navigation"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#3730a3] bg-[#eef2ff] border border-[#c7d2fe] rounded-[4px] hover:bg-[#e0e7ff] transition-colors"
            >
              <LayoutDashboard size={14} />
              <span>Dashboard</span>
            </button>

            <Link
              to="/about"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#494944] rounded-[4px] hover:bg-[#f2f2ef] hover:text-[#181816] transition-colors"
            >
              <Info size={14} />
              <span className="hidden md:inline">About</span>
            </Link>

            <Link
              to="/contact"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#494944] rounded-[4px] hover:bg-[#f2f2ef] hover:text-[#181816] transition-colors"
            >
              <Mail size={14} />
              <span className="hidden md:inline">Contact Us</span>
            </Link>
          </nav>

          {/* User Status and Logout */}
          <div className="flex items-center gap-2 border-l border-[#e3e3df] pl-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-[#3730a3] text-white text-[11px] font-bold">
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-xs text-[#181816] hidden lg:inline truncate max-w-[100px]">
              {user?.name || 'Alex Rivera'}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="rounded-[4px] p-1 text-[#797973] hover:bg-[#fef2f2] hover:text-[#991b1b] transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* shadcn Command Dialog */}
      <CommandDialog open={openCommand} onOpenChange={setOpenCommand}>
        <CommandInput
          value={searchQuery}
          onValueChange={setSearchQuery}
          placeholder="Search topics, lessons, practice, or tools..."
        />
        <CommandList>
          {filteredTopics.length === 0 && (
            <CommandEmpty>No topics found matching &quot;{searchQuery}&quot;</CommandEmpty>
          )}

          {/* Topics Group */}
          {filteredTopics.length > 0 && (
            <CommandGroup heading="Curriculum Topics & Lessons">
              {filteredTopics.map((topic) => (
                <CommandItem
                  key={topic.id}
                  onSelect={() => handleSelectRoute(`/lessons/${topic.id}`)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BookOpen size={14} className="text-[#3730a3] shrink-0" />
                    <div className="truncate">
                      <span className="font-bold text-[#181816]">{topic.title}</span>
                      <span className="text-[11px] text-[#797973] ml-2">{topic.subject}</span>
                    </div>
                  </div>
                  <CommandShortcut>Lesson</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Targeted Practice Group */}
          {filteredTopics.length > 0 && (
            <CommandGroup heading="Adaptive Practice">
              {filteredTopics.map((topic) => (
                <CommandItem
                  key={`prac-${topic.id}`}
                  onSelect={() => handleSelectRoute(`/practice/${topic.id}`)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Target size={14} className="text-[#059669] shrink-0" />
                    <div className="truncate">
                      <span className="font-medium text-[#181816]">{topic.title}</span>
                      <span className="text-[11px] text-[#797973] ml-2">Diagnostic Drill</span>
                    </div>
                  </div>
                  <CommandShortcut>Practice</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* AI Tutor Shortcuts */}
          <CommandGroup heading="AI Tutor">
            {filteredTopics.slice(0, 2).map((topic) => (
              <CommandItem
                key={`tut-${topic.id}`}
                onSelect={() => handleSelectRoute(`/tutor/${topic.id}`)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sparkles size={14} className="text-[#3730a3] shrink-0" />
                  <span className="font-medium text-[#181816]">Unpack {topic.title} with AI</span>
                </div>
                <CommandShortcut>Tutor</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          {/* Quick Page Links */}
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => handleSelectRoute('/dashboard')}>
              <div className="flex items-center gap-2">
                <LayoutDashboard size={14} className="text-[#797973]" />
                <span>Dashboard Overview</span>
              </div>
            </CommandItem>
            <CommandItem onSelect={() => handleSelectRoute('/learning-path')}>
              <div className="flex items-center gap-2">
                <Compass size={14} className="text-[#797973]" />
                <span>Adaptive Learning Path</span>
              </div>
            </CommandItem>
            <CommandItem onSelect={() => handleSelectRoute('/progress')}>
              <div className="flex items-center gap-2">
                <BarChart2 size={14} className="text-[#797973]" />
                <span>Progress & Analytics</span>
              </div>
            </CommandItem>
            <CommandItem onSelect={() => handleSelectRoute('/about')}>
              <div className="flex items-center gap-2">
                <Info size={14} className="text-[#797973]" />
                <span>About Cognara</span>
              </div>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
