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
    '/learning-path': 'Adaptive Learning Path',
    '/lessons': 'Lessons',
    '/tutor': 'AI Tutor',
    '/practice': 'Targeted Practice',
    '/assessments': 'Assessments',
    '/progress': 'Progress & Mastery',
    '/about': 'About Platform',
    '/contact': 'Contact Us',
    '/privacy': 'Privacy Policy',
    '/terms': 'Terms and Conditions',
  }

  const currentTitle = pathTitles[location.pathname] || currentNav?.name || 'Adaptive Learning'

  const handleDashboardClick = () => {
    setMobileMenuOpen(true)
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      {/* Sidebar (Desktop and Mobile Drawer) */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Column */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Sticky Header with Current Page Title, Home, Dashboard, About, Contact */}
        <Navbar
          onOpenMobileMenu={handleDashboardClick}
          currentTitle={currentTitle}
          user={user}
          onLogout={onLogout}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Simple Footer with Privacy Policy and Terms and Conditions */}
        <footer className="border-t border-[#e2e8f0] bg-white px-6 py-4 text-xs text-[#64748b]">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© 2026 Adaptive Learning Platform · Diagnostic Tutoring System</p>
            <div className="flex items-center gap-4">
              <Link to="/about" className="hover:text-[#0f172a] hover:underline">
                About
              </Link>
              <span>·</span>
              <Link to="/contact" className="hover:text-[#0f172a] hover:underline">
                Contact
              </Link>
              <span>·</span>
              <Link to="/privacy" className="hover:text-[#0f172a] hover:underline">
                Privacy Policy
              </Link>
              <span>·</span>
              <Link to="/terms" className="hover:text-[#0f172a] hover:underline">
                Terms and Conditions
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
