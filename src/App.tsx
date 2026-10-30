import { useCallback, useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import MovieCard from './components/MovieCard'
import FavoritesPage from './pages/FavoritesPage'
import MovieDetailsPage from './pages/MovieDetailsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { useFavorites } from './hooks/useFavorites'
import { getHomeMovies, searchMovies } from './services/movieApi'
import type { MovieSummary } from './types/movie'
import type { AppRoute } from './types/routes'

type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error'

function getRouteFromPath(pathname: string): AppRoute {
  if (pathname === '/favorites' || pathname === '/login' || pathname === '/register') {
    return pathname
  }
  const movieMatch = pathname.match(/^\/movie\/(tt\d+)$/)
  if (movieMatch) return `/movie/${movieMatch[1]}`
  return '/'
}

function App() {
  const [currentPage, setCurrentPage] = useState<AppRoute>(() => getRouteFromPath(window.location.pathname))
  const [movies, setMovies] = useState<MovieSummary[]>([])
  const [status, setStatus] = useState<SearchStatus>(() =>
    getRouteFromPath(window.location.pathname) === '/' ? 'loading' : 'idle',
  )
  const [searchedQuery, setSearchedQuery] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const requestId = useRef(0)
  const { favorites, toggleFavorite, loading: favoritesLoading, error: favoritesError, signedIn } = useFavorites()

  const loadHomeMovies = useCallback(async () => {
    const currentRequestId = ++requestId.current
    setSearchedQuery('')
    setMovies([])
    setErrorMessage('')
    setStatus('loading')

    try {
      const homeMovies = await getHomeMovies()
      if (currentRequestId !== requestId.current) return

      if (homeMovies.length === 0) {
        setErrorMessage('No movies were returned. Try searching for a title instead.')
        setStatus('error')
        return
      }

      setMovies(homeMovies)
      setStatus('success')
    } catch (error) {
      if (currentRequestId !== requestId.current) return
      setErrorMessage(
        error instanceof Error
          ? `We couldn't load the home movies. ${error.message}`
          : 'We couldn’t load the home movies. Please try searching for a title instead.',
      )
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    function syncPageFromHistory() {
      const nextPage = getRouteFromPath(window.location.pathname)
      setCurrentPage(nextPage)
    }

    window.addEventListener('popstate', syncPageFromHistory)
    if (getRouteFromPath(window.location.pathname) === '/') void loadHomeMovies()
    return () => window.removeEventListener('popstate', syncPageFromHistory)
  }, [loadHomeMovies])

  function navigateTo(path: AppRoute) {
    if (window.location.pathname !== path) {
      window.history.pushState({ movieHubFrom: window.location.pathname }, '', path)
    }
    setCurrentPage(path)
    if (path === '/') void loadHomeMovies()
  }

  function openMovieDetails(imdbID: string) {
    navigateTo(`/movie/${encodeURIComponent(imdbID)}`)
  }

  function goBackFromDetails() {
    if (typeof window.history.state?.movieHubFrom === 'string') {
      window.history.back()
    } else {
      navigateTo('/')
    }
  }

  async function handleSearch(query: string) {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/')
    }
    setCurrentPage('/')
    const currentRequestId = ++requestId.current
    setSearchedQuery(query)
    setMovies([])
    setErrorMessage('')
    setStatus('loading')

    try {
      const result = await searchMovies(query)
      if (currentRequestId !== requestId.current) return

      if (result.Response === 'False') {
        if (result.Error?.toLowerCase().includes('movie not found')) {
          setStatus('empty')
        } else {
          setErrorMessage(result.Error ?? 'The movie service could not complete the search.')
          setStatus('error')
        }
        return
      }

      const matchingMovies = result.Search ?? []
      setMovies(matchingMovies)
      setStatus(matchingMovies.length ? 'success' : 'empty')
    } catch (error) {
      if (currentRequestId !== requestId.current) return
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to search movies right now.',
      )
      setStatus('error')
    }
  }

  return (
    <>
      <Header
        onSearch={handleSearch}
        currentPage={currentPage}
        onNavigate={navigateTo}
      />
      <main className="app-shell">
        {favoritesError && <p className="search-message search-message-error" role="alert">{favoritesError}</p>}
        {currentPage === '/login' ? (
          <LoginPage onNavigate={navigateTo} />
        ) : currentPage === '/register' ? (
          <RegisterPage onNavigate={navigateTo} />
        ) : currentPage.startsWith('/movie/') ? (
          <MovieDetailsPage
            imdbID={currentPage.slice('/movie/'.length)}
            isFavorite={favorites.some((favorite) => favorite.imdbID === currentPage.slice('/movie/'.length))}
            onToggleFavorite={toggleFavorite}
            onBack={goBackFromDetails}
          />
        ) : currentPage === '/favorites' ? (
          <FavoritesPage movies={favorites} onToggleFavorite={toggleFavorite} loading={favoritesLoading} signedIn={signedIn} onOpenDetails={openMovieDetails} />
        ) : (
          <>
            {status === 'idle' && (
              <section className="welcome-card" aria-labelledby="welcome-title">
                <p className="eyebrow">FLYRANK INTERNSHIP PROJECT</p>
                <h1 id="welcome-title">Find your next favorite</h1>
                <p className="intro">
                  Search the movie collection by title to discover what to watch next.
                </p>
              </section>
            )}

            {status === 'loading' && (
              <div className="loading-state" role="status">
                <span className="loading-spinner" aria-hidden="true" />
                <span>{searchedQuery ? `Searching for “${searchedQuery}”…` : 'Loading movies for you…'}</span>
              </div>
            )}

            {status === 'loading' && (
              <div className="movie-grid movie-skeleton-grid" aria-hidden="true">
                {Array.from({ length: 8 }, (_, index) => (
                  <div className="movie-skeleton" key={index}>
                    <div className="skeleton-poster skeleton-shimmer" />
                    <div className="skeleton-line skeleton-shimmer" />
                    <div className="skeleton-line short skeleton-shimmer" />
                  </div>
                ))}
              </div>
            )}

            {status === 'error' && (
              <section className="search-message search-message-error" role="alert">
                <h1>We couldn’t complete that search</h1>
                <p>{errorMessage}</p>
              </section>
            )}

            {status === 'empty' && (
              <section className="search-message" role="status">
                <h1>No movies found</h1>
                <p>Try another title. We couldn’t find results for “{searchedQuery}”.</p>
              </section>
            )}

            {status === 'success' && (
              <section className="results-section" aria-labelledby="results-title">
                {!searchedQuery && movies[0] && (
                  <section className="hero-feature" aria-label="Featured movie">
                    {movies[0].Poster && movies[0].Poster !== 'N/A' && (
                      <img className="hero-backdrop" src={movies[0].Poster} alt="" />
                    )}
                    <div className="hero-copy">
                      <span className="hero-kicker">Featured pick</span>
                      <h1>{movies[0].Title}</h1>
                      <div className="hero-meta"><span>{movies[0].Year}</span><span>MovieHub selection</span></div>
                      <p>Discover the story, cast, and details behind this featured movie.</p>
                      <button className="hero-action" type="button" onClick={() => openMovieDetails(movies[0].imdbID)}>
                        Explore movie
                      </button>
                    </div>
                  </section>
                )}
                <div className="results-heading">
                  <div>
                    <p className="eyebrow">{searchedQuery ? 'SEARCH RESULTS' : 'A FEW PICKS FOR YOU'}</p>
                    <h1 id="results-title">
                      {searchedQuery ? `Movies matching “${searchedQuery}”` : 'Explore movies'}
                    </h1>
                  </div>
                  <p className="results-count">{movies.length} results</p>
                </div>
                <div className="movie-grid">
                  {movies.map((movie) => (
                    <MovieCard
                      key={movie.imdbID}
                      movie={movie}
                      isFavorite={favorites.some((favorite) => favorite.imdbID === movie.imdbID)}
                      onToggleFavorite={toggleFavorite}
                      onOpenDetails={openMovieDetails}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </>
  )
}

export default App
