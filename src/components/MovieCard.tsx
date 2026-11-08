import type { MovieSummary } from '../types/movie'
import { getOptimizedPosterUrl } from '../services/movieApi'
import './MovieCard.css'

interface MovieCardProps {
  movie: MovieSummary
  isFavorite: boolean
  onToggleFavorite: (movie: MovieSummary) => void
  onOpenDetails: (imdbID: string) => void
}

function MovieCard({ movie, isFavorite, onToggleFavorite, onOpenDetails }: MovieCardProps) {
  const hasPoster = movie.Poster && movie.Poster !== 'N/A'

  return (
    <article className="movie-card">
      <a
        className="movie-card-link"
        href={`/movie/${encodeURIComponent(movie.imdbID)}`}
        onClick={(event) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
          event.preventDefault()
          onOpenDetails(movie.imdbID)
        }}
      >
        {hasPoster ? (
          <img className="movie-poster" src={getOptimizedPosterUrl(movie.Poster)} alt={`${movie.Title} poster`} width="300" height="450" loading="lazy" fetchPriority="low" />
        ) : (
          <div className="movie-poster movie-poster-placeholder" role="img" aria-label="No poster available">
            <span aria-hidden="true">No poster</span>
          </div>
        )}
        <div className="movie-card-details">
          <h3 className="movie-title">{movie.Title}</h3>
          <div className="movie-meta">
            <span>{movie.Year}</span>
            <span className="movie-type">{movie.Type}</span>
          </div>
        </div>
      </a>
      <div className="movie-card-action">
        <button
          className={`favorite-button${isFavorite ? ' favorite-button-saved' : ''}`}
          type="button"
          aria-label={`${isFavorite ? 'Remove Favorite' : 'Add to Favorites'}: ${movie.Title}`}
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(movie)}
        >
          <span aria-hidden="true">{isFavorite ? '♥' : '♡'}</span>
          {isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
        </button>
      </div>
    </article>
  )
}

export default MovieCard
