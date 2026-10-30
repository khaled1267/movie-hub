import MovieCard from '../components/MovieCard'
import type { MovieSummary } from '../types/movie'
import './FavoritesPage.css'

interface FavoritesPageProps {
  movies: MovieSummary[]
  onToggleFavorite: (movie: MovieSummary) => void
  loading: boolean
  signedIn: boolean
  onOpenDetails: (imdbID: string) => void
}

function FavoritesPage({ movies, onToggleFavorite, loading, signedIn, onOpenDetails }: FavoritesPageProps) {
  return (
    <section className="favorites-section" aria-labelledby="favorites-title">
      <div className="favorites-heading">
        <div>
          <p className="eyebrow">YOUR COLLECTION</p>
          <h1 id="favorites-title">Favorites</h1>
        </div>
        {movies.length > 0 && <p className="results-count">{movies.length} saved</p>}
      </div>

      {loading ? (
        <div className="favorites-empty" role="status"><span className="loading-spinner" aria-hidden="true" /><p>Loading your favorites…</p></div>
      ) : !signedIn ? (
        <div className="favorites-empty" role="status">
          <h2>Sign in to see your favorites</h2>
          <p>Your saved movies are private to your account.</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="favorites-empty" role="status">
          <span className="empty-heart" aria-hidden="true">♡</span>
          <h2>No favorites yet</h2>
          <p>Save movies you’d like to watch and they’ll show up here.</p>
        </div>
      ) : (
        <div className="movie-grid">
          {movies.map((movie) => (
            <MovieCard
              key={movie.imdbID}
              movie={movie}
              isFavorite
              onToggleFavorite={onToggleFavorite}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default FavoritesPage
