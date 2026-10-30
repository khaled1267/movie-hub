import { useEffect, useState } from 'react'
import { getMovieDetails } from '../services/movieApi'
import type { MovieDetails, MovieSummary } from '../types/movie'
import './MovieDetailsPage.css'

interface MovieDetailsPageProps {
  imdbID: string
  isFavorite: boolean
  onToggleFavorite: (movie: MovieSummary) => void
  onBack: () => void
}

function MovieDetailsPage({ imdbID, isFavorite, onToggleFavorite, onBack }: MovieDetailsPageProps) {
  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setMovie(null)
    setError('')
    setLoading(true)

    getMovieDetails(imdbID)
      .then((details) => {
        if (active) setMovie(details)
      })
      .catch((requestError: unknown) => {
        if (active) {
          const reason = requestError instanceof Error ? requestError.message : ''
          setError(reason
            ? `We couldn’t load this movie’s details. ${reason}`
            : 'We couldn’t load this movie’s details. Please check your connection and try again.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [imdbID])

  function toggleFavorite() {
    if (!movie) return
    onToggleFavorite({
      imdbID: movie.imdbID,
      Title: movie.Title,
      Year: movie.Year,
      Type: movie.Type || 'movie',
      Poster: movie.Poster,
    })
  }

  return (
    <section className="movie-details-page" aria-labelledby="movie-details-title">
      <button className="details-back-button" type="button" onClick={onBack}>← Back</button>

      {loading ? (
        <div className="details-message" role="status">
          <span className="loading-spinner" aria-hidden="true" />
          <span>Loading movie details…</span>
        </div>
      ) : error ? (
        <div className="details-message details-error" role="alert">
          <h1>Movie details unavailable</h1>
          <p>{error}</p>
        </div>
      ) : movie ? (
        <div className="movie-details-layout">
          {movie.Poster && movie.Poster !== 'N/A' ? (
            <img className="details-poster" src={movie.Poster} alt={`${movie.Title} poster`} />
          ) : (
            <div className="details-poster details-poster-placeholder" role="img" aria-label="No poster available">No poster available</div>
          )}

          <div className="details-content">
            <p className="eyebrow">MOVIE DETAILS</p>
            <h1 id="movie-details-title">{movie.Title}</h1>
            <div className="details-highlights">
              <span>{movie.Year}</span>
              {movie.Runtime !== 'N/A' && <span>{movie.Runtime}</span>}
              {movie.imdbRating !== 'N/A' && <span>IMDb {movie.imdbRating}</span>}
            </div>
            <p className="details-genre">{movie.Genre}</p>
            <p className="details-plot">{movie.Plot}</p>

            <dl className="details-facts">
              <div><dt>Director</dt><dd>{movie.Director}</dd></div>
              <div><dt>Actors</dt><dd>{movie.Actors}</dd></div>
              <div><dt>Language</dt><dd>{movie.Language}</dd></div>
              <div><dt>Country</dt><dd>{movie.Country}</dd></div>
              <div><dt>Released</dt><dd>{movie.Released}</dd></div>
            </dl>

            <button
              className={`favorite-button${isFavorite ? ' favorite-button-saved' : ''} details-favorite-button`}
              type="button"
              aria-pressed={isFavorite}
              onClick={toggleFavorite}
            >
              <span aria-hidden="true">{isFavorite ? '♥' : '♡'}</span>
              {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default MovieDetailsPage
