import { useRef, useState, type FormEvent } from 'react'
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
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const [submitting, setSubmitting] = useState(false)
  const nameInput = useRef<HTMLInputElement>(null)
  const emailInput = useRef<HTMLInputElement>(null)
  const passwordInput = useRef<HTMLInputElement>(null)
  const confirmPasswordInput = useRef<HTMLInputElement>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const normalizedName = name.trim()
    const normalizedEmail = email.trim()

    const nextFieldErrors = {
      name: !normalizedName ? 'Enter your name.' : undefined,
      email: !normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
        ? 'Enter a valid email address.'
        : undefined,
      password: password.length < 6 ? 'Choose a password with at least 6 characters.' : undefined,
      confirmPassword: password !== confirmPassword ? 'Your passwords do not match.' : undefined,
    }
    setFieldErrors(nextFieldErrors)
    if (nextFieldErrors.name || nextFieldErrors.email || nextFieldErrors.password || nextFieldErrors.confirmPassword) {
      if (nextFieldErrors.name) nameInput.current?.focus()
      else if (nextFieldErrors.email) emailInput.current?.focus()
      else if (nextFieldErrors.password) passwordInput.current?.focus()
      else confirmPasswordInput.current?.focus()
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
        <h1 id="register-title" tabIndex={-1}>Create an account</h1>
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
            ref={nameInput}
            type="text"
            required
            aria-required="true"
            autoComplete="name"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setFieldErrors((current) => ({ ...current, name: undefined }))
              setError('')
            }}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'register-name-error' : undefined}
          />
          {fieldErrors.name && <p className="auth-field-error" id="register-name-error">{fieldErrors.name}</p>}
        </div>
        <div className="auth-field">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            ref={emailInput}
            type="email"
            required
            aria-required="true"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setFieldErrors((current) => ({ ...current, email: undefined }))
              setError('')
            }}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
          />
          {fieldErrors.email && <p className="auth-field-error" id="register-email-error">{fieldErrors.email}</p>}
        </div>
        <div className="auth-field">
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            ref={passwordInput}
            type="password"
            required
            aria-required="true"
            autoComplete="new-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setFieldErrors((current) => ({ ...current, password: undefined, confirmPassword: undefined }))
              setError('')
            }}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'register-password-error' : undefined}
          />
          {fieldErrors.password && <p className="auth-field-error" id="register-password-error">{fieldErrors.password}</p>}
        </div>
        <div className="auth-field">
          <label htmlFor="register-confirm-password">Confirm password</label>
          <input
            id="register-confirm-password"
            ref={confirmPasswordInput}
            type="password"
            required
            aria-required="true"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value)
              setFieldErrors((current) => ({ ...current, confirmPassword: undefined }))
              setError('')
            }}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            aria-describedby={fieldErrors.confirmPassword ? 'register-confirm-password-error' : undefined}
          />
          {fieldErrors.confirmPassword && <p className="auth-field-error" id="register-confirm-password-error">{fieldErrors.confirmPassword}</p>}
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {submitting && <p className="visually-hidden" role="status">Creating your account.</p>}
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
