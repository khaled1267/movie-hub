import { createServer } from 'node:http'
import { handleMovieApi } from './lib/movie-api-handler.js'
import { getMovieRecommendations } from './lib/ai-recommendation.js'

const port = Number(process.env.API_PORT ?? 3001)
const MAX_PREFERENCE_LENGTH = 1000
const MAX_REQUEST_BODY_LENGTH = 1024 * 1024

function sendJson(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  })
  response.end(JSON.stringify(body))
}

async function readJsonBody(request) {
  const chunks = []
  let bodyLength = 0

  for await (const chunk of request) {
    bodyLength += chunk.length
    if (bodyLength > MAX_REQUEST_BODY_LENGTH) {
      throw new Error('Request body is too large.')
    }
    chunks.push(chunk)
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`)

  if (url.pathname === '/api/movies') {
    const result = await handleMovieApi(request.method, request.url ?? '/')
    return sendJson(response, result.statusCode, result.body)
  }

  if (url.pathname === '/api/recommend') {
    if (request.method !== 'POST') {
      return sendJson(response, 405, { error: 'Method not allowed. Use POST.' }, { Allow: 'POST' })
    }

    let body
    try {
      body = await readJsonBody(request)
    } catch {
      return sendJson(response, 400, { error: 'Request body must be valid JSON.' })
    }

    const preference = body && typeof body === 'object' && !Array.isArray(body)
      ? body.preference
      : undefined

    if (typeof preference !== 'string' || !preference.trim()) {
      return sendJson(response, 400, { error: 'Enter your movie preferences.' })
    }
    if (preference.trim().length > MAX_PREFERENCE_LENGTH) {
      return sendJson(response, 400, {
        error: `Movie preferences must be ${MAX_PREFERENCE_LENGTH} characters or fewer.`,
      })
    }

    try {
      const recommendations = await getMovieRecommendations(preference)
      return sendJson(response, 200, { recommendations })
    } catch {
      return sendJson(response, 502, {
        error: 'Could not generate movie recommendations. Please try again.',
      })
    }
  }

  return sendJson(response, 404, { error: 'Endpoint not found.' })
})

server.listen(port, () => {
  console.log(`MovieHub local API listening at http://localhost:${port}; OMDb API key configured: ${Boolean(process.env.OMDB_API_KEY)}`)
})
