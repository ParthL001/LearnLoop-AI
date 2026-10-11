import { NavLink } from 'react-router-dom'
import {
  Home, Compass, BookOpen, MessageSquare, Target,
  ClipboardCheck, BarChart2, X, Sparkles
} from 'lucide-react'
import { Badge } from './UI'
import Logo from './Logo'

export const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Learning Path', path: '/learning-path', icon: Compass },
  { name: 'Lessons', path: '/lessons', icon: BookOpen },
  { name: 'AI Tutor', path: '/tutor', icon: MessageSquare, badge: 'Adaptive' },
  { name: 'Practice', path: '/practice', icon: Target },
  { name: 'Assessments', path: '/assessments', icon: ClipboardCheck },
  { name: 'Progress', path: '/progress', icon: BarChart2 },
]

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          role="presentation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#303846] bg-[#080A0D] transition-transform duration-150 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-14 items-center justify-between border-b border-[#303846] px-5 bg-[#080A0D]">
          <div className="flex items-center gap-2.5">
            <Logo className="h-7 w-auto shrink-0" />
            <div>
              <span className="text-xs font-bold text-[#F8FAFC] tracking-tight block leading-tight">
                LearnLoop AI
              </span>
              <span className="text-[10px] font-medium tracking-wider uppercase text-[#7F8A9B] block">
                Adaptive Tutor
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-[4px] p-1 text-[#7F8A9B] hover:bg-[#14171C] hover:text-[#F8FAFC] lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          <div>
            <div className="px-2 pb-2 text-[10px] font-bold tracking-wider text-[#7F8A9B] uppercase">
              Curriculum & Tools
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-[6px] border transition-colors ${
                        isActive
                          ? 'bg-[#152746] text-[#3B82F6] border-[#1E3A8A] font-semibold'
                          : 'border-transparent text-[#A8B3C4] hover:bg-[#14171C] hover:text-[#F8FAFC]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className="shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <Badge variant="accent">{item.badge}</Badge>
                    )}
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>

        {/* System telemetry footer */}
        <div className="border-t border-[#303846] p-4 text-[11px] text-[#7F8A9B] space-y-2 bg-[#080A0D]">
          <div className="flex items-center justify-between font-medium">
            <span className="text-[#A8B3C4]">Diagnostic Engine</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#4ADE80] bg-[#052E16] border border-[#166534] px-1.5 py-0.5 rounded-[3px]">
              Online
            </span>
          </div>
          <div className="flex gap-3 pt-1 text-[11px]">
            <NavLink to="/privacy" onClick={onClose} className="hover:text-[#F8FAFC] transition-colors">
              Privacy
            </NavLink>
            <span>·</span>
            <NavLink to="/terms" onClick={onClose} className="hover:text-[#F8FAFC] transition-colors">
              Terms
            </NavLink>
            <span>·</span>
            <NavLink to="/about" onClick={onClose} className="hover:text-[#F8FAFC] transition-colors">
              About
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  )
}
