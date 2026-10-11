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
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-app)] p-4 sm:p-6 text-[var(--text-main)] font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex p-2.5 rounded-xl bg-white border border-[var(--border-color)] shadow-xs mb-1">
            <Logo className="h-10 w-auto" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-main)]">
            LearnLoop AI
          </h1>
          <p className="font-mono text-xs text-[var(--accent-primary)] font-bold uppercase tracking-wider">
            Adaptive Programming & Misconception Engine
          </p>
        </div>

        {/* Auth Card */}
        <div className="card shadow-card p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
            <h2 className="font-heading text-xl font-bold text-[var(--text-main)]">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            <div className="tabs">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError('')
                }}
                aria-selected={mode === 'login'}
                className="tab font-mono text-xs font-bold"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setError('')
                }}
                aria-selected={mode === 'signup'}
                className="tab font-mono text-xs font-bold"
              >
                Sign Up
              </button>
            </div>
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            {mode === 'login'
              ? 'Enter your credentials to access your adaptive learning dashboard.'
              : 'Create an account to begin diagnostic concept analysis.'}
          </p>

          {error && (
            <div className="alert alert-danger text-xs p-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>
            )}

            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                className="btn btn-primary w-full"
              >
                {mode === 'login' ? 'Sign In to Workspace' : 'Create Free Account'}
              </button>

              <button
                type="button"
                onClick={handleDemoLogin}
                className="btn btn-secondary w-full"
              >
                Continue as Demo Student
              </button>
            </div>
          </form>
        </div>

        <p className="text-center font-mono text-[11px] text-[var(--text-muted)]">
          Diagnostic items are calibrated to detect underlying reasoning patterns, not rank students.
        </p>
      </div>
    </div>
  )
}