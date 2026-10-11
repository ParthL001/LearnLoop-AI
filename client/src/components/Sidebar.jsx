import { NavLink } from 'react-router-dom'
import {
  Home, Compass, BookOpen, MessageSquare, Target,
  ClipboardCheck, BarChart2, X, Shield, FileText
} from 'lucide-react'
import { Badge } from './UI'

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
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#e3e3df] bg-[#ffffff] transition-transform duration-150 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-14 items-center justify-between border-b border-[#e3e3df] px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#3730a3] text-white font-bold text-xs">
              C
            </div>
            <div className="leading-none">
              <span className="text-sm font-bold tracking-tight text-[#181816]">Cognara</span>
              <span className="block text-[10px] text-[#797973] font-medium mt-0.5">Adaptive Tutor</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-[4px] p-1 text-[#797973] hover:bg-[#f2f2ef] hover:text-[#181816] lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="px-2 pb-2 text-[10px] font-bold tracking-wider text-[#797973] uppercase">
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
                    `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-[4px] border transition-colors ${
                      isActive
                        ? 'bg-[#eef2ff] text-[#3730a3] border-[#c7d2fe] font-semibold'
                        : 'border-transparent text-[#494944] hover:bg-[#f2f2ef] hover:text-[#181816]'
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
        <div className="border-t border-[#e3e3df] p-4 text-[11px] text-[#797973] space-y-2">
          <div className="flex items-center justify-between font-medium">
            <span>Cognara v1.0</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#065f46] bg-[#ecfdf5] border border-[#a7f3d0] px-1.5 py-0.5 rounded-[3px]">
              Ready
            </span>
          </div>
          <div className="flex gap-3 pt-1 text-[11px]">
            <NavLink to="/privacy" onClick={onClose} className="hover:text-[#181816] hover:underline">
              Privacy
            </NavLink>
            <span>·</span>
            <NavLink to="/terms" onClick={onClose} className="hover:text-[#181816] hover:underline">
              Terms
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  )
}
