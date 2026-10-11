import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import Logo from '@/components/Logo'

export default function LoginSignup({ onLoginSuccess }) {
  const [mode, setMode] = useState('login') // 'login' or 'signup'
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
    <div className="flex min-h-screen items-center justify-center bg-[#0B0D10] p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Brand header: Logo only, no Cognara text */}
        <div className="mb-6 text-center">
          <Logo className="mx-auto mb-3 h-12 w-auto" />
          <h2 className="text-base font-bold tracking-tight text-[#F8FAFC]">Adaptive Learning Platform</h2>
          <p className="mt-0.5 text-xs text-[#7F8A9B]">AI-Assisted Diagnostic Tutoring & Misconception Detection</p>
        </div>

        {/* Auth Card using shadcn components */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {mode === 'login' ? 'Sign In' : 'Create an Account'}
              </CardTitle>
              <div className="flex rounded-[6px] border border-[#303846] p-0.5 bg-[#1B2028]">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError('') }}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-[4px] transition-colors ${
                    mode === 'login' ? 'bg-[#3B82F6] text-white shadow-xs' : 'text-[#7F8A9B] hover:text-[#F8FAFC]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError('') }}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-[4px] transition-colors ${
                    mode === 'signup' ? 'bg-[#3B82F6] text-white shadow-xs' : 'text-[#7F8A9B] hover:text-[#F8FAFC]'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>
            <CardDescription>
              {mode === 'login'
                ? 'Enter your credentials to access your adaptive learning path.'
                : 'Create an account to begin diagnostic concept analysis.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 rounded-[6px] border border-[#991B1B] bg-[#2A1618] p-2.5 text-xs text-[#EF4444]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <FieldGroup>
                {mode === 'signup' && (
                  <Field>
                    <FieldLabel htmlFor="name">Full Name</FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Alex Rivera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Field>
                )}

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {mode === 'signup' && (
                    <FieldDescription>
                      Used for progress notifications and learning reports.
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {mode === 'signup' && (
                    <FieldDescription>
                      Must be at least 6 characters long.
                    </FieldDescription>
                  )}
                </Field>

                {mode === 'signup' && (
                  <Field>
                    <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </Field>
                )}

                <div className="pt-2 space-y-2">
                  <Button type="submit" className="w-full">
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleDemoLogin}
                  >
                    Continue as Demo Student
                  </Button>
                </div>

                <FieldDescription className="text-center pt-2">
                  {mode === 'login' ? (
                    <>
                      Do not have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setMode('signup'); setError('') }}
                        className="font-semibold text-[#3B82F6] hover:underline"
                      >
                        Create one
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setMode('login'); setError('') }}
                        className="font-semibold text-[#3B82F6] hover:underline"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </FieldDescription>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        {/* Simple disclaimer without brand name */}
        <p className="mt-4 text-center text-[11px] text-[#7F8A9B]">
          Formative diagnostic items are calibrated to detect underlying reasoning patterns, not test capability.
        </p>
      </div>
    </div>
  )
}