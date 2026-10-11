import { useState } from 'react'
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import Sidebar, { navItems } from './Sidebar'
import Navbar from './navbar'

export default function AppLayout({ user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const currentNav = navItems.find((item) => {
    if (item.path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) {
      return true
    }
    return location.pathname.startsWith(item.path)
  })

  const pathTitles = {
    '/': 'Dashboard',
    '/dashboard': 'Dashboard',
    '/explore': 'Explore Content',
    '/lessons': 'Interactive Lessons',
    '/tutor': 'AI Tutor',
    '/python-practice': 'Python Practice',
    '/css-practice': 'CSS Practice Lab',
    '/progress': 'My Progress',
    '/about': 'About Platform',
    '/contact': 'Contact Us',
    '/privacy': 'Privacy Policy',
    '/terms': 'Terms and Conditions',
  }

  const currentTitle = pathTitles[location.pathname] || currentNav?.name || 'LearnLoop AI'

  const handleDashboardClick = () => {
    setMobileMenuOpen(true)
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] font-sans antialiased">
      {/* Sidebar (Desktop and Mobile Drawer) */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Column */}
      <div className="flex min-h-screen flex-col lg:pl-[240px] transition-all">
        {/* Sticky Header with Current Page Title, Command Search, and Quick Nav */}
        <Navbar
          onOpenMobileMenu={handleDashboardClick}
          currentTitle={currentTitle}
          user={user}
          onLogout={onLogout}
        />

        {/* Page Content wrapped in .main-content */}
        <main className="main-content flex-1 w-full">
          <Outlet />
        </main>

        {/* Cohesive Footer */}
        <footer className="border-t border-[var(--border-soft)] bg-[var(--bg-surface)] px-6 py-4 text-xs text-[var(--text-muted)] mt-auto">
          <div className="max-w-[var(--content-max)] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-mono text-[11px]">© 2026 LearnLoop AI · Adaptive Learning & Misconception Engine</p>
            <div className="flex items-center gap-4 font-sans text-xs">
              <Link to="/about" className="hover:text-[var(--text-main)] transition-colors">
                About
              </Link>
              <span>·</span>
              <Link to="/contact" className="hover:text-[var(--text-main)] transition-colors">
                Contact
              </Link>
              <span>·</span>
              <Link to="/privacy" className="hover:text-[var(--text-main)] transition-colors">
                Privacy Policy
              </Link>
              <span>·</span>
              <Link to="/terms" className="hover:text-[var(--text-main)] transition-colors">
                Terms and Conditions
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
