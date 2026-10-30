import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import type { AppRoute } from '../types/routes'
import './AuthPage.css'

interface RegisterPageProps {
  onNavigate: (path: AppRoute) => void
}

function RegisterPage({ onNavigate }: RegisterPageProps) {
  const { register, firebaseConfigured } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedName = name.trim()
    const normalizedEmail = email.trim()

    if (!normalizedName) {
      setError('Enter your name.')
      return
    }
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Choose a password with at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }

    setError('')
    setSubmitting(true)
    try {
      await register(normalizedName, normalizedEmail, password)
      onNavigate('/')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create your account.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-page" aria-labelledby="register-title">
      <div className="auth-page-heading">
        <p className="eyebrow">JOIN MOVIEHUB</p>
        <h1 id="register-title">Create an account</h1>
        <p>Save your details and make MovieHub yours.</p>
      </div>
      {!firebaseConfigured && (
        <p className="auth-setup-notice" role="status">
          Authentication needs Firebase configuration. Add the required VITE_FIREBASE values to your .env file.
        </p>
      )}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="register-name">Name</label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(error)}
          />
        </div>
        <div className="auth-field">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(error)}
          />
        </div>
        <div className="auth-field">
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(error)}
          />
        </div>
        <div className="auth-field">
          <label htmlFor="register-confirm-password">Confirm password</label>
          <input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            aria-invalid={Boolean(error)}
          />
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account?{' '}
        <a href="/login" onClick={(event) => { event.preventDefault(); onNavigate('/login') }}>
          Log in
        </a>
      </p>
    </section>
  )
}

export default RegisterPage
