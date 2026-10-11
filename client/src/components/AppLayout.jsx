import { useState } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import Sidebar, { navItems } from './Sidebar'
import Navbar from './navbar'

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

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
    '/privacy': 'Privacy Policy',
    '/terms': 'Terms and Conditions',
  }

  const currentTitle = pathTitles[location.pathname] || currentNav?.name || 'Cognara'

  return (
    <div className="min-h-screen bg-[#f9f9f7] text-[#181816]">
      {/* Sidebar (Desktop and Mobile Drawer) */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Column */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Sticky Header with Current Page Title */}
        <Navbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          currentTitle={currentTitle}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Simple Footer with Privacy Policy and Terms and Conditions */}
        <footer className="border-t border-[#e3e3df] bg-[#ffffff] px-6 py-4 text-xs text-[#797973]">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© 2026 Cognara — Adaptive Learning Platform</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-[#181816] hover:underline">
                Privacy Policy
              </Link>
              <span>·</span>
              <Link to="/terms" className="hover:text-[#181816] hover:underline">
                Terms and Conditions
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
