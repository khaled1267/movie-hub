import { createServer } from 'node:http'

const port = Number(process.env.API_PORT ?? 3001)
const apiKey = process.env.OMDB_API_KEY

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  response.end(JSON.stringify(data))
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host}`)

  if (request.method !== 'GET' || requestUrl.pathname !== '/api/movies') {
    sendJson(response, 404, { error: 'Endpoint not found.' })
    return
  }

  const imdbID = requestUrl.searchParams.get('imdbID')?.trim()
  const query = requestUrl.searchParams.get('query')?.trim()
  if (imdbID) {
    console.info('[MovieHub API] Movie details request', { imdbID })
  }
  if (imdbID && !/^tt\d+$/.test(imdbID)) {
    sendJson(response, 400, { error: 'Enter a valid IMDb ID.' })
    return
  }
  if (!imdbID && !query) {
    sendJson(response, 400, { error: 'Enter a movie title or IMDb ID.' })
    return
  }

  if (!apiKey) {
    sendJson(response, 503, {
      error: 'Movie search is not configured. Add OMDB_API_KEY to your .env file and restart the API server.',
    })
    return
  }

  const omdbUrl = new URL('https://www.omdbapi.com/')
  omdbUrl.searchParams.set('apikey', apiKey)
  if (imdbID) {
    omdbUrl.searchParams.set('i', imdbID)
    omdbUrl.searchParams.set('plot', 'full')
  } else {
    omdbUrl.searchParams.set('s', query)
    omdbUrl.searchParams.set('type', 'movie')
  }

  try {
    const upstreamResponse = await fetch(omdbUrl)
    const data = await upstreamResponse.json()

    console.info('[MovieHub API] OMDb response', {
      status: upstreamResponse.status,
      response: data?.Response,
      error: data?.Error,
    })

    if (!upstreamResponse.ok) {
      sendJson(response, 502, { error: 'The movie service could not complete the search.' })
      return
    }

    sendJson(response, 200, data)
  } catch (error) {
    console.error('[MovieHub API] OMDb request failed', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : 'Unknown upstream error',
    })
    sendJson(response, 502, { error: 'Could not connect to the movie service. Please try again.' })
  }
})

server.listen(port, () => {
  console.log(`MovieHub API server listening at http://localhost:${port}; OMDb API key configured: ${Boolean(apiKey)}`)
})
