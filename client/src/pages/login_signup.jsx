import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '@/components/Logo'

export default function LoginSignup({ onLoginSuccess }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
    }

    const userData = {
      name: name.trim() || (email ? email.split('@')[0] : 'Alex Rivera'),
      email: email || 'alex.rivera@edu.org',
      role: 'Student',
      isAuthenticated: true,
      lastLogin: new Date().toISOString(),
    }

    localStorage.setItem('cognara_user', JSON.stringify(userData))
    if (onLoginSuccess) onLoginSuccess(userData)
    navigate('/dashboard')
  }

  const handleDemoLogin = () => {
    const demoUser = {
      name: 'Alex Rivera',
      email: 'alex.rivera@edu.org',
      role: 'Student',
      isAuthenticated: true,
      lastLogin: new Date().toISOString(),
    }
    localStorage.setItem('cognara_user', JSON.stringify(demoUser))
    if (onLoginSuccess) onLoginSuccess(demoUser)
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F2F2EB] p-4 sm:p-6 text-[#231F20] font-sans">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <Logo className="mx-auto mb-3 h-12 w-auto" />
          <h1 className="font-heading text-2xl font-extrabold uppercase tracking-tight text-[#231F20]">
            LearnLoop AI
          </h1>
          <p className="mt-1 font-mono text-xs text-[#3D5F58] uppercase font-bold tracking-wider">
            Adaptive Programming & Misconception Engine
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-lg border border-[#D8D8CF] bg-[#FFFFFF] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#D8D8CF]">
            <h2 className="font-heading text-xl font-bold text-[#231F20]">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            <div className="flex rounded-md border border-[#D8D8CF] p-0.5 bg-[#F2F2EB]">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError('')
                }}
                className={`px-3 py-1 text-xs font-mono font-bold rounded transition ${
                  mode === 'login'
                    ? 'bg-[#3D5F58] text-white shadow-xs'
                    : 'text-[#4B5563] hover:text-[#231F20]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setError('')
                }}
                className={`px-3 py-1 text-xs font-mono font-bold rounded transition ${
                  mode === 'signup'
                    ? 'bg-[#3D5F58] text-white shadow-xs'
                    : 'text-[#4B5563] hover:text-[#231F20]'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <p className="text-xs text-[#6B7280] mb-5">
            {mode === 'login'
              ? 'Enter your credentials to access your adaptive learning dashboard.'
              : 'Create an account to begin diagnostic concept analysis.'}
          </p>

          {error && (
            <div className="mb-4 rounded-md border border-[#FECDD3] bg-[#FFF1F2] p-3 text-xs text-[#9F1239]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#3D5F58] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF9F5] text-[#231F20] border border-[#D8D8CF] rounded-md px-3.5 py-2.5 text-xs sm:text-sm focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#3D5F58] transition"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#3D5F58] mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF9F5] text-[#231F20] border border-[#D8D8CF] rounded-md px-3.5 py-2.5 text-xs sm:text-sm focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#3D5F58] transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#3D5F58] mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF9F5] text-[#231F20] border border-[#D8D8CF] rounded-md px-3.5 py-2.5 text-xs sm:text-sm focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#3D5F58] transition"
                required
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#3D5F58] mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#FAF9F5] text-[#231F20] border border-[#D8D8CF] rounded-md px-3.5 py-2.5 text-xs sm:text-sm focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#3D5F58] transition"
                  required
                />
              </div>
            )}

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-[#3D5F58] text-white font-sans text-xs sm:text-sm font-bold rounded-md hover:bg-[#2E4742] transition shadow-xs"
              >
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-[#D8D8CF] bg-[#FFFFFF] text-[#231F20] font-mono text-xs font-bold rounded-md hover:bg-[#F2F2EB] transition"
              >
                Continue as Demo Student
              </button>
            </div>
          </form>
        </div>

        <p className="mt-4 text-center font-mono text-[11px] text-[#6B7280]">
          Diagnostic items are calibrated to detect underlying reasoning patterns, not rank students.
        </p>
      </div>
    </div>
  )
}