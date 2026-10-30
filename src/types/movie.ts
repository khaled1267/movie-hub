export interface MovieSummary {
  imdbID: string
  Title: string
  Year: string
  Type: string
  Poster: string
}

export interface MovieDetails extends MovieSummary {
  Rated: string
  Released: string
  Runtime: string
  Genre: string
  Director: string
  Writer: string
  Actors: string
  Plot: string
  Language: string
  Country: string
  Awards: string
  Poster: string
  Ratings: Array<{ Source: string; Value: string }>
  Metascore: string
  imdbRating: string
  imdbVotes: string
  DVD: string
  BoxOffice: string
  Production: string
  Website: string
  Response: 'True' | 'False'
  Error?: string
}

export interface MovieSearchResponse {
  Search?: MovieSummary[]
  totalResults?: string
  Response: 'True' | 'False'
  Error?: string
}
