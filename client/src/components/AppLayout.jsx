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
    '/python-practice': 'Python Misconception Detector',
    '/css-practice': 'CSS Practice Lab',
    '/progress': 'My Progress & Evidence',
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
    <div className="min-h-screen bg-[#F2F2EB] text-[#231F20] font-sans">
      {/* Sidebar (Desktop and Mobile Drawer) */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Column */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Sticky Header with Current Page Title, Command Search, and Quick Nav */}
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

        {/* Cohesive Footer */}
        <footer className="border-t border-[#D8D8CF] bg-[#FFFFFF] px-6 py-4 text-xs text-[#6B7280]">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-mono">© 2026 LearnLoop AI · Adaptive Learning & Misconception Engine</p>
            <div className="flex items-center gap-4 font-sans">
              <Link to="/about" className="hover:text-[#231F20] transition-colors">
                About
              </Link>
              <span>·</span>
              <Link to="/contact" className="hover:text-[#231F20] transition-colors">
                Contact
              </Link>
              <span>·</span>
              <Link to="/privacy" className="hover:text-[#231F20] transition-colors">
                Privacy Policy
              </Link>
              <span>·</span>
              <Link to="/terms" className="hover:text-[#231F20] transition-colors">
                Terms and Conditions
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
