import { useRef, useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import type { AppRoute } from '../types/routes'
import './AuthPage.css'

interface LoginPageProps {
  onNavigate: (path: AppRoute) => void
}

function LoginPage({ onNavigate }: LoginPageProps) {
  const { login, firebaseConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const emailInput = useRef<HTMLInputElement>(null)
  const passwordInput = useRef<HTMLInputElement>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const normalizedEmail = email.trim()

    const nextFieldErrors = {
      email: !normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
        ? 'Enter a valid email address.'
        : undefined,
      password: !password ? 'Enter your password.' : undefined,
    }
    setFieldErrors(nextFieldErrors)
    if (nextFieldErrors.email || nextFieldErrors.password) {
      if (nextFieldErrors.email) emailInput.current?.focus()
      else passwordInput.current?.focus()
      return
    }

    setError('')
    setSubmitting(true)
    try {
      await login(normalizedEmail, password)
      onNavigate('/')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-page" aria-labelledby="login-title">
      <div className="auth-page-heading">
        <p className="eyebrow">WELCOME BACK</p>
        <h1 id="login-title" tabIndex={-1}>Log in to MovieHub</h1>
        <p>Sign in to continue to your account.</p>
      </div>
      {!firebaseConfigured && (
        <p className="auth-setup-notice" role="status">
          Authentication needs Firebase configuration. Add the required VITE_FIREBASE values to your .env file.
        </p>
      )}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            ref={emailInput}
            type="email"
            required
            aria-required="true"
            autoComplete="email"
            value={email}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
            onChange={(event) => {
              setEmail(event.target.value)
              setFieldErrors((current) => ({ ...current, email: undefined }))
              setError('')
            }}
          />
          {fieldErrors.email && <p className="auth-field-error" id="login-email-error">{fieldErrors.email}</p>}
        </div>
        <div className="auth-field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            ref={passwordInput}
            type="password"
            required
            aria-required="true"
            autoComplete="current-password"
            value={password}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
            onChange={(event) => {
              setPassword(event.target.value)
              setFieldErrors((current) => ({ ...current, password: undefined }))
              setError('')
            }}
          />
          {fieldErrors.password && <p className="auth-field-error" id="login-password-error">{fieldErrors.password}</p>}
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {submitting && <p className="visually-hidden" role="status">Signing in.</p>}
        <button className="auth-submit" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Log In'}
        </button>
      </form>
      <p className="auth-switch">
        New to MovieHub?{' '}
        <a href="/register" onClick={(event) => { event.preventDefault(); onNavigate('/register') }}>
          Create an account
        </a>
      </p>
    </section>
  )
}

export default LoginPage
