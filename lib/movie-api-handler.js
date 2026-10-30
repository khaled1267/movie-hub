export async function handleMovieApi(method, requestUrl) {
  const url = new URL(requestUrl, 'http://localhost')

  if (method !== 'GET' || url.pathname !== '/api/movies') {
    return { statusCode: 404, body: { error: 'Endpoint not found.' } }
  }

  const imdbID = url.searchParams.get('imdbID')?.trim()
  const query = url.searchParams.get('query')?.trim()

  if (imdbID && !/^tt\d+$/.test(imdbID)) {
    return { statusCode: 400, body: { error: 'Enter a valid IMDb ID.' } }
  }
  if (!imdbID && !query) {
    return { statusCode: 400, body: { error: 'Enter a movie title or IMDb ID.' } }
  }

  const apiKey = process.env.OMDB_API_KEY
  if (!apiKey) {
    return {
      statusCode: 503,
      body: { error: 'Movie search is not configured. Set OMDB_API_KEY in the server environment.' },
    }
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
      return { statusCode: 502, body: { error: 'The movie service could not complete the request.' } }
    }
    return { statusCode: 200, body: data }
  } catch (error) {
    console.error('[MovieHub API] OMDb request failed', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : 'Unknown upstream error',
    })
    return { statusCode: 502, body: { error: 'Could not connect to the movie service. Please try again.' } }
  }
}
