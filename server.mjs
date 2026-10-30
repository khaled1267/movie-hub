import { createServer } from 'node:http'
import { handleMovieApi } from './lib/movie-api-handler.js'

const port = Number(process.env.API_PORT ?? 3001)

const server = createServer(async (request, response) => {
  const result = await handleMovieApi(request.method, request.url ?? '/')
  response.writeHead(result.statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  response.end(JSON.stringify(result.body))
})

server.listen(port, () => {
  console.log(`MovieHub local API listening at http://localhost:${port}; OMDb API key configured: ${Boolean(process.env.OMDB_API_KEY)}`)
})
