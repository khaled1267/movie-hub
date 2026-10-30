import { useState, type FormEvent } from 'react'
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
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedEmail = email.trim()

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.')
      return
    }
    if (!password) {
      setError('Enter your password.')
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
        <h1 id="login-title">Log in to MovieHub</h1>
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
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(error)}
          />
        </div>
        <div className="auth-field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(error)}
          />
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
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
