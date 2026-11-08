import { getMovieRecommendations } from '../lib/ai-recommendation.js'

const MAX_PREFERENCE_LENGTH = 1000

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  let body = request.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return response.status(400).json({ error: 'Request body must be valid JSON.' })
    }
  }

  const preference = body && typeof body === 'object' && !Array.isArray(body)
    ? body.preference
    : undefined

  if (typeof preference !== 'string' || !preference.trim()) {
    return response.status(400).json({ error: 'Enter your movie preferences.' })
  }
  if (preference.trim().length > MAX_PREFERENCE_LENGTH) {
    return response.status(400).json({ error: `Movie preferences must be ${MAX_PREFERENCE_LENGTH} characters or fewer.` })
  }

  try {
    const recommendations = await getMovieRecommendations(preference)
    return response.status(200).json({ recommendations })
  } catch {
    return response.status(502).json({ error: 'Could not generate movie recommendations. Please try again.' })
  }
}
