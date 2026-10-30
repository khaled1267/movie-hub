import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import type { AppRoute } from '../types/routes'
import './Header.css'

interface HeaderProps {
  onSearch: (query: string) => void
  currentPage: AppRoute
  onNavigate: (path: AppRoute) => void
}

function Header({ onSearch, currentPage, onNavigate }: HeaderProps) {
  const { user, loading: authLoading, logout } = useAuth()
  const [query, setQuery] = useState('')
  const [validationError, setValidationError] = useState('')
  const [accountError, setAccountError] = useState('')

  function navigate(path: AppRoute) {
    if (path === '/') {
      setQuery('')
      setValidationError('')
    }
    onNavigate(path)
  }

  async function handleLogout() {
    setAccountError('')
    try {
      await logout()
      navigate('/')
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : 'Unable to log out. Please try again.')
    }
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      setValidationError('Enter a movie title to search.')
      return
    }

    setValidationError('')
    onSearch(trimmedQuery)
  }

  return (
    <header className="site-header">
      <div className="header-content">
        <a className="brand" href="/" aria-label="MovieHub home" onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
          event.preventDefault()
          navigate('/')
        }}>
          <span className="brand-mark" aria-hidden="true">M</span>
          <span>MovieHub</span>
        </a>

        <nav className="primary-nav" aria-label="Main navigation">
          <a
            className={`nav-link${currentPage === '/' ? ' nav-link-active' : ''}`}
            href="/"
            aria-current={currentPage === '/' ? 'page' : undefined}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
              event.preventDefault()
              navigate('/')
            }}
          >
            Home
          </a>
          <a
            className={`nav-link${currentPage === '/favorites' ? ' nav-link-active' : ''}`}
            href="/favorites"
            aria-current={currentPage === '/favorites' ? 'page' : undefined}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
              event.preventDefault()
              navigate('/favorites')
            }}
          >
            Favorites
          </a>
        </nav>

        <div className="header-account">
          {authLoading ? (
            <span className="user-greeting">Checking account…</span>
          ) : user ? (
            <>
              <span className="user-greeting" title={user.email ?? undefined}>
                Hi, {user.displayName || user.email?.split('@')[0] || 'there'}
              </span>
              <button className="logout-button" type="button" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <a
                className="account-link"
                href="/login"
                aria-current={currentPage === '/login' ? 'page' : undefined}
                onClick={(event) => { event.preventDefault(); navigate('/login') }}
              >
                Log In
              </a>
              <a
                className="register-link"
                href="/register"
                aria-current={currentPage === '/register' ? 'page' : undefined}
                onClick={(event) => { event.preventDefault(); navigate('/register') }}
              >
                Register
              </a>
            </>
          )}
          {accountError && <span className="account-error" role="alert">{accountError}</span>}
        </div>

        <form className="header-search" role="search" onSubmit={handleSearch}>
          <label className="visually-hidden" htmlFor="movie-search">
            Search movies
          </label>
          <input
            id="movie-search"
            name="query"
            type="search"
            placeholder="Search movies..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              if (validationError) setValidationError('')
            }}
            aria-invalid={Boolean(validationError)}
            aria-describedby={validationError ? 'search-validation-error' : undefined}
          />
          <button type="submit">Search</button>
          {validationError && (
            <span className="search-validation-error" id="search-validation-error" role="alert">
              {validationError}
            </span>
          )}
        </form>
      </div>
    </header>
  )
}

export default Header
