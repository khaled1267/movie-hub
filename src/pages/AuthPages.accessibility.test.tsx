import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: vi.fn(), register: vi.fn(), firebaseConfigured: true }),
}))

describe('authentication form accessibility', () => {
  it('associates login validation with the invalid email and focuses it', () => {
    render(<LoginPage onNavigate={vi.fn()} />)
    const email = screen.getByRole('textbox', { name: 'Email' })

    fireEvent.click(screen.getByRole('button', { name: 'Log In' }))

    expect(email.getAttribute('aria-required')).toBe('true')
    expect(email.getAttribute('aria-invalid')).toBe('true')
    expect(email.getAttribute('aria-describedby')).toBe('login-email-error')
    expect(document.activeElement).toBe(email)
  })

  it('associates registration validation with the invalid name and focuses it', () => {
    render(<RegisterPage onNavigate={vi.fn()} />)
    const name = screen.getByRole('textbox', { name: 'Name' })

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

    expect(name.getAttribute('aria-required')).toBe('true')
    expect(name.getAttribute('aria-invalid')).toBe('true')
    expect(name.getAttribute('aria-describedby')).toBe('register-name-error')
    expect(document.activeElement).toBe(name)
  })
})
