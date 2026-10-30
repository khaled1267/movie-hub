import { handleMovieApi } from '../lib/movie-api-handler.js'

export default async function handler(request, response) {
  const result = await handleMovieApi(request.method, request.url)
  response.setHeader('Cache-Control', 'no-store')
  response.status(result.statusCode).json(result.body)
}
