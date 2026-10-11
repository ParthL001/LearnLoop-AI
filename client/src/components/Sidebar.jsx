import { NavLink } from 'react-router-dom'
import {
  Home, Compass, MessageSquare, BarChart2,
  X, Code2, Layout, Sparkles, Terminal, ChevronRight
} from 'lucide-react'
import Logo from './Logo'

export const primaryNavItems = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Explore Content', path: '/explore', icon: Compass },
  { name: 'AI Tutor', path: '/tutor', icon: MessageSquare, badge: 'Qwen3:4b' },
  { name: 'My Progress', path: '/progress', icon: BarChart2 },
]

export const curriculumTools = [
  {
    name: 'Python Practice',
    path: '/python-practice',
    icon: Code2,
    badge: 'Detector',
    description: 'Diagnose Python mental models & reasoning.'
  },
  {
    name: 'CSS Practice',
    path: '/css-practice',
    icon: Layout,
    badge: 'Lab',
    description: 'Master specificity, flexbox & box model.'
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
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Styled Sidebar using .sidebar */}
      <aside
        className={`sidebar fixed top-0 bottom-0 left-0 h-screen min-h-screen h-[100dvh] w-[var(--sidebar-width)] z-50 flex flex-col ${
          isOpen ? 'is-open' : ''
        }`}
      >
        {/* Brand header */}
        <div className="sidebar-brand flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-white/10 border border-white/10">
              <Logo className="h-6 w-auto shrink-0" />
            </div>
            <div>
              <span className="font-heading text-base font-bold text-white tracking-tight block leading-tight">
                LearnLoop AI
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded p-1 text-[#D8D8CF] hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4">
          {/* Main Navigation */}
          <div>
            <div className="sidebar-section-label">
              Main Menu
            </div>
            <nav className="space-y-0.5">
              {primaryNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? 'is-active' : ''}`
                    }
                  >
                    <Icon size={17} className="text-[#8BB2DE]" />
                    <span className="flex-1 font-medium">{item.name}</span>
                    {item.badge && (
                      <span className="badge badge-on-dark-ochre">
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
            <div className="sidebar-section-label flex items-center justify-between">
              <span>Curriculum & Tools</span>
              <span className="badge badge-sky" style={{ padding: '0.1rem 0.4rem', fontSize: '0.62rem' }}>
                PROBES
              </span>
            </div>
            <nav className="space-y-0.5">
              {curriculumTools.map((tool) => {
                const Icon = tool.icon
                return (
                  <NavLink
                    key={tool.path}
                    to={tool.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? 'is-active' : ''}`
                    }
                  >
                    <Icon size={16} className="text-[#F59E0B] shrink-0" />
                    <span className="flex-1 font-medium truncate">{tool.name}</span>
                    <span className="badge badge-on-dark-ochre shrink-0" style={{ padding: '0.1rem 0.35rem', fontSize: '0.62rem' }}>
                      {tool.badge}
                    </span>
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Live Telemetry Footer */}
        <div className="sidebar-footer space-y-2.5">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="flex items-center gap-2 text-[#A4BEB9]">
              <span className="status-dot"></span>
              OLLAMA LOCAL
            </span>
            <span className="badge badge-ochre text-[10px]">
              ONLINE
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#A4BEB9] pt-1 border-t border-white/5">
            <NavLink to="/about" onClick={onClose}>About</NavLink>
            <span>·</span>
            <NavLink to="/privacy" onClick={onClose}>Privacy</NavLink>
            <span>·</span>
            <NavLink to="/terms" onClick={onClose}>Terms</NavLink>
          </div>
        </div>
      </aside>
    </>
  )
}
