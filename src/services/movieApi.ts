import type { MovieDetails, MovieSearchResponse, MovieSummary } from '../types/movie'

const HOME_SEARCH_KEYWORDS = ['Avengers', 'Batman', 'Spider-Man', 'Harry Potter', 'Jurassic Park']
const HOME_MOVIE_LIMIT = 20

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

export async function getHomeMovies(): Promise<MovieSummary[]> {
  const responses = await Promise.all(HOME_SEARCH_KEYWORDS.map(searchMovies))
  const uniqueMovies = new Map<string, MovieSummary>()

  for (const response of responses) {
    for (const movie of response.Search ?? []) {
      if (!uniqueMovies.has(movie.imdbID)) {
        uniqueMovies.set(movie.imdbID, movie)
      }
    }
  }

  const movies = Array.from(uniqueMovies.values())

  // Fisher–Yates produces a shuffled list without changing the source array.
  for (let index = movies.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const currentMovie = movies[index]
    movies[index] = movies[randomIndex]
    movies[randomIndex] = currentMovie
  }

  return movies.slice(0, HOME_MOVIE_LIMIT)
}
