import type { MovieDetails, MovieSearchResponse, MovieSummary } from '../types/movie'

const HOME_SEARCH_KEYWORDS = ['Avengers', 'Batman', 'Spider-Man', 'Harry Potter', 'Jurassic Park']
const HOME_MOVIE_LIMIT = 20

export function getOptimizedPosterUrl(posterUrl: string) {
  return posterUrl.replace(
    /_V1_QL75_UX380_CR0,0,380,562_/i,
    '_V1_QL75_UX300_CR0,0,300,444_',
  )
}

export async function searchMovies(query: string): Promise<MovieSearchResponse> {
  const params = new URLSearchParams({ query: query.trim() })
  const response = await fetch(`/api/movies?${params.toString()}`)

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { error?: string }
      | null
    throw new Error(body?.error ?? 'Unable to search movies right now.')
  }

  return (await response.json()) as MovieSearchResponse
}

export async function getMovieDetails(imdbID: string): Promise<MovieDetails> {
  const params = new URLSearchParams({ imdbID })
  const response = await fetch(`/api/movies?${params.toString()}`)
  const body = (await response.json().catch(() => null)) as MovieDetails | { error?: string } | null

  if (!response.ok) {
    throw new Error(body && 'error' in body ? body.error : 'Unable to load movie details.')
  }
  if (!body || !('Response' in body) || body.Response === 'False') {
    throw new Error(body && 'Error' in body ? body.Error : 'Movie details were not found.')
  }
  return body
}

function shuffleMovies(movies: MovieSummary[]) {
  for (let index = movies.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const currentMovie = movies[index]
    movies[index] = movies[randomIndex]
    movies[randomIndex] = currentMovie
  }
  return movies
}

export async function getHomeMovies(onInitialMovies?: (movies: MovieSummary[]) => void): Promise<MovieSummary[]> {
  const requests = HOME_SEARCH_KEYWORDS.map(searchMovies)
  const firstResponse = await requests[0]
  const uniqueMovies = new Map<string, MovieSummary>()

  for (const movie of firstResponse.Search ?? []) {
    uniqueMovies.set(movie.imdbID, movie)
  }

  const initialMovies = shuffleMovies(Array.from(uniqueMovies.values()))
  if (initialMovies.length) onInitialMovies?.(initialMovies)

  const remainingResponses = await Promise.all(requests.slice(1))
  for (const response of remainingResponses) {
    for (const movie of response.Search ?? []) {
      if (!uniqueMovies.has(movie.imdbID)) {
        uniqueMovies.set(movie.imdbID, movie)
      }
    }
  }

  const initialIds = new Set(initialMovies.map((movie) => movie.imdbID))
  const remainingMovies = Array.from(uniqueMovies.values())
    .filter((movie) => !initialIds.has(movie.imdbID))
  return [...initialMovies, ...shuffleMovies(remainingMovies)].slice(0, HOME_MOVIE_LIMIT)
}
