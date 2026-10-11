import { NavLink } from 'react-router-dom'
import {
  Home, Compass, BookOpen, MessageSquare, Target,
  BarChart2, X, Code2, Layout, Sparkles, Terminal
} from 'lucide-react'
import { Badge } from './UI'
import Logo from './Logo'

export const primaryNavItems = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Explore Content', path: '/explore', icon: Compass },
  { name: 'AI Tutor', path: '/tutor', icon: MessageSquare, badge: 'Ollama' },
  { name: 'My Progress', path: '/progress', icon: BarChart2 },
]

export const curriculumTools = [
  {
    name: 'Python Practice',
    path: '/python-practice',
    icon: Code2,
    badge: 'Detector',
    description: 'Practice Python concepts and understand the reasoning behind your answers.'
  },
  {
    name: 'CSS Practice',
    path: '/css-practice',
    icon: Layout,
    badge: 'Interactive',
    description: 'Practice CSS concepts and strengthen your understanding of styling and layout.'
  }
]

export const navItems = [...primaryNavItems, ...curriculumTools]

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

      {/* Sidebar container in Deep Forest (#2E4742) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#243935] bg-[#2E4742] text-[#F2F2EB] transition-transform duration-150 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-15 items-center justify-between border-b border-[#3D5F58] px-5 bg-[#243935]">
          <div className="flex items-center gap-2.5">
            <Logo className="h-7 w-auto shrink-0" />
            <div>
              <span className="font-heading text-base font-extrabold text-[#F2F2EB] tracking-tight block leading-tight">
                LearnLoop AI
              </span>
              <span className="font-mono text-[9px] font-semibold tracking-wider uppercase text-[#8BB2DE] block">
                Adaptive Learning
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-[4px] p-1 text-[#D8D8CF] hover:bg-[#3D5F58] hover:text-[#FFFFFF] lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {/* Main Navigation */}
          <div>
            <div className="px-2 pb-2 font-mono text-[10px] font-bold tracking-wider text-[#A4BEB9] uppercase">
              Main Menu
            </div>
            <nav className="space-y-1">
              {primaryNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-[5px] border transition-all ${
                        isActive
                          ? 'bg-[#3D5F58] text-[#FFFFFF] border-[#F5B726] font-semibold shadow-xs'
                          : 'border-transparent text-[#E2ECE9] hover:bg-[#3D5F58]/50 hover:text-[#FFFFFF]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={15} className="shrink-0 text-[#8BB2DE]" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded-[3px] bg-[#243935] text-[#F5B726] border border-[#F5B726]/40 font-bold">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </nav>
          </div>

          {/* Curriculum & Tools Section */}
          <div>
            <div className="px-2 pb-2 font-mono text-[10px] font-bold tracking-wider text-[#A4BEB9] uppercase flex items-center justify-between">
              <span>Curriculum & Tools</span>
              <span className="text-[9px] px-1 bg-[#243935] text-[#8BB2DE] rounded-[2px] font-bold">
                PROBES
              </span>
            </div>
            <nav className="space-y-1">
              {curriculumTools.map((tool) => {
                const Icon = tool.icon
                return (
                  <NavLink
                    key={tool.path}
                    to={tool.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex flex-col p-2.5 rounded-[5px] border transition-all ${
                        isActive
                          ? 'bg-[#3D5F58] text-[#FFFFFF] border-[#F5B726] shadow-xs'
                          : 'border-transparent text-[#E2ECE9] hover:bg-[#3D5F58]/50 hover:text-[#FFFFFF]'
                      }`
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-xs">
                        <Icon size={14} className="shrink-0 text-[#F5B726]" />
                        <span>{tool.name}</span>
                      </div>
                      <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded-[2px] bg-[#243935] text-[#F5B726] font-bold">
                        {tool.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#C2D7D2] mt-1 line-clamp-1 leading-snug">
                      {tool.description}
                    </span>
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>

        {/* System telemetry footer in Deep Forest (#243935) */}
        <div className="border-t border-[#3D5F58] p-4 text-[11px] text-[#C2D7D2] space-y-2 bg-[#243935]">
          <div className="flex items-center justify-between font-medium">
            <span className="font-mono text-[10px] text-[#A4BEB9]">OLLAMA DIAGNOSTICS</span>
            <span className="font-mono text-[9px] uppercase font-bold tracking-wider text-[#231F20] bg-[#F5B726] border border-[#D99B16] px-1.5 py-0.5 rounded-[3px]">
              Active
            </span>
          </div>
          <div className="flex gap-3 pt-1 text-[11px] text-[#A4BEB9]">
            <NavLink to="/privacy" onClick={onClose} className="hover:text-[#FFFFFF] transition-colors">
              Privacy
            </NavLink>
            <span>·</span>
            <NavLink to="/terms" onClick={onClose} className="hover:text-[#FFFFFF] transition-colors">
              Terms
            </NavLink>
            <span>·</span>
            <NavLink to="/about" onClick={onClose} className="hover:text-[#FFFFFF] transition-colors">
              About
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  )
}
