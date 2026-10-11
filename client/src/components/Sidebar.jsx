import { NavLink } from 'react-router-dom'
import {
  Home, Compass, BookOpen, MessageSquare, Target,
  ClipboardCheck, BarChart2, X
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
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#e2e8f0] bg-white transition-transform duration-150 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header: Logo only, no 'Cognara' text */}
        <div className="flex h-14 items-center justify-between border-b border-[#e2e8f0] px-5">
          <div className="flex items-center gap-2.5">
            <Logo className="h-7 w-auto shrink-0" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#64748b]">
              Adaptive Tutor
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-[4px] p-1 text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="px-2 pb-2 text-[10px] font-bold tracking-wider text-[#64748b] uppercase">
            Curriculum
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-[5px] border transition-colors ${
                      isActive
                        ? 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe] font-semibold'
                        : 'border-transparent text-[#334155] hover:bg-[#f8fafc] hover:text-[#0f172a]'
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

        {/* Simple Footer Links */}
        <div className="border-t border-[#e2e8f0] p-4 text-[11px] text-[#64748b] space-y-2">
          <div className="flex items-center justify-between font-medium">
            <span>Adaptive System v1.0</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#065f46] bg-[#ecfdf5] border border-[#a7f3d0] px-1.5 py-0.5 rounded-[3px]">
              Active
            </span>
          </div>
          <div className="flex gap-3 pt-1 text-[11px]">
            <NavLink to="/privacy" onClick={onClose} className="hover:text-[#0f172a] hover:underline">
              Privacy
            </NavLink>
            <span>·</span>
            <NavLink to="/terms" onClick={onClose} className="hover:text-[#0f172a] hover:underline">
              Terms
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  )
}
