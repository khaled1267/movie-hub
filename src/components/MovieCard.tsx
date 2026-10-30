import type { MovieSummary } from '../types/movie'
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
    <article
      className="movie-card movie-card-clickable"
      role="link"
      tabIndex={0}
      aria-label={`View details for ${movie.Title}`}
      onClick={() => onOpenDetails(movie.imdbID)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpenDetails(movie.imdbID)
        }
      }}
    >
      {hasPoster ? (
        <img
          className="movie-poster"
          src={movie.Poster}
          alt={`${movie.Title} poster`}
          loading="lazy"
        />
      ) : (
        <div className="movie-poster movie-poster-placeholder" aria-label="No poster available">
          <span aria-hidden="true">No poster</span>
        </div>
      )}
      <div className="movie-card-details">
        <h2 className="movie-title">{movie.Title}</h2>
        <div className="movie-meta">
          <span>{movie.Year}</span>
          <span className="movie-type">{movie.Type}</span>
        </div>
        <button
          className={`favorite-button${isFavorite ? ' favorite-button-saved' : ''}`}
          type="button"
          aria-pressed={isFavorite}
          onClick={(event) => {
            event.stopPropagation()
            onToggleFavorite(movie)
          }}
        >
          <span aria-hidden="true">{isFavorite ? '♥' : '♡'}</span>
          {isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
        </button>
      </div>
    </article>
  )
}

export default MovieCard
