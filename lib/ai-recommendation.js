import { GoogleGenAI, Type } from '@google/genai'

const MODEL = 'gemini-3.8-flash'
const RECOMMENDATION_COUNT = 5
const MAX_PREFERENCE_LENGTH = 1000
const MAX_RETRIES = 2
const INITIAL_RETRY_DELAY_MS = 250
const GEMINI_REQUEST_TIMEOUT_MS = 10_000
const GEMINI_OVERALL_TIMEOUT_MS = 20_000

function getRetryableStatus(error) {
  const details = error && typeof error === 'object' ? error : {}
  const responseStatus = details.response?.status
  const directStatus = details.status ?? details.statusCode ?? responseStatus
  if ([429, 503, 504, '429', '503', '504'].includes(directStatus)) {
    return Number(directStatus)
  }

  const fields = [details.code, details.status, details.message]
  for (const candidate of [details.error, details.body]) {
    if (typeof candidate === 'string') {
      try {
        const parsed = JSON.parse(candidate)
        fields.push(parsed?.error?.code, parsed?.error?.status, parsed?.error?.message)
      } catch {
        fields.push(candidate)
      }
    } else if (candidate && typeof candidate === 'object') {
      fields.push(candidate.code, candidate.status, candidate.message)
    }
  }

  const text = fields.filter(Boolean).join(' ').toUpperCase()
  if (/\b504\b|DEADLINE_EXCEEDED|DEADLINE EXPIRED/.test(text)) return 504
  if (/\b503\b|UNAVAILABLE/.test(text)) return 503
  if (/\b429\b|RESOURCE_EXHAUSTED|TOO MANY REQUESTS/.test(text)) return 429
  return null
}

function isRequestTimeout(error) {
  let current = error
  for (let depth = 0; depth < 4 && current; depth += 1) {
    const details = current && typeof current === 'object' ? current : {}
    const name = typeof details.name === 'string' ? details.name : ''
    const code = typeof details.code === 'string' ? details.code : ''
    const message = typeof details.message === 'string' ? details.message : ''
    if (/^(?:AbortError|TimeoutError|RequestTimeoutError|APIConnectionTimeoutError)$/.test(name) ||
      /^(?:ABORT_ERR|ETIMEDOUT)$/.test(code) ||
      /timed?\s*out|deadline (?:exceeded|expired)/i.test(message)) {
      return true
    }
    current = details.cause
  }
  return false
}

function modelNameForLog(model, apiKey) {
  if ((apiKey && model.includes(apiKey)) || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(model)) {
    return '[redacted model identifier]'
  }
  return model
}

function logModelAttempt(event, model, attempt, startedAt, apiKey, status = null) {
  console.info(`[MovieHub Gemini] Model ${event}`, {
    model: modelNameForLog(model, apiKey),
    attempt,
    durationMs: Date.now() - startedAt,
    ...(status ? { status } : {}),
  })
}

function wait(milliseconds, signal) {
  if (signal.aborted) {
    return Promise.reject(signal.reason)
  }

  return new Promise((resolve, reject) => {
    const cleanup = () => signal.removeEventListener('abort', onAbort)
    const timer = setTimeout(() => {
      cleanup()
      resolve()
    }, milliseconds)
    const onAbort = () => {
      clearTimeout(timer)
      cleanup()
      reject(signal.reason)
    }

    signal.addEventListener('abort', onAbort, { once: true })
  })
}

function logGeminiFailure(stage, error, apiKey) {
  const details = error && typeof error === 'object' ? error : {}
  const sanitizeMessage = (value) => {
    let message = typeof value === 'string' ? value : String(value)
    if (apiKey) {
      message = message.split(apiKey).join('[REDACTED]')
    }
    return message
      .replace(/([?&](?:key|api[_-]?key|token)=)[^&\s]+/gi, '$1[REDACTED]')
      .replace(/(authorization\s*:\s*bearer\s+)[^\s,]+/gi, '$1[REDACTED]')
      .replace(/AIza[\w-]{20,}/g, '[REDACTED]')
      .slice(0, 500)
  }
  const cause = details.cause && typeof details.cause === 'object' ? details.cause : null
  let parsedErrorBody
  for (const candidate of [details.error, details.body, details.message]) {
    if (candidate && typeof candidate === 'object') {
      parsedErrorBody = candidate
      break
    }
    if (typeof candidate === 'string') {
      try {
        parsedErrorBody = JSON.parse(candidate)
        break
      } catch {
        // Try the next SDK error field, if any.
      }
    }
  }
  const nestedError = parsedErrorBody?.error && typeof parsedErrorBody.error === 'object'
    ? parsedErrorBody.error
    : {}
  const code = nestedError.status ?? details.code ?? nestedError.code ?? null
  const status = details.status ?? details.statusCode ?? details.response?.status ??
    (Number.isInteger(nestedError.code) ? nestedError.code : null)

  console.error('[MovieHub Gemini] Request failed', {
    stage,
    name: sanitizeMessage(typeof details.name === 'string' ? details.name : 'Error'),
    status: Number.isInteger(status) ? status : null,
    code: typeof code === 'string' || typeof code === 'number' ? sanitizeMessage(code) : null,
    message: sanitizeMessage(nestedError.message ?? details.message ?? error),
    causeName: typeof cause?.name === 'string' ? sanitizeMessage(cause.name) : null,
    causeCode: typeof cause?.code === 'string' || typeof cause?.code === 'number'
      ? sanitizeMessage(cause.code)
      : null,
    causeMessage: cause?.message ? sanitizeMessage(cause.message) : null,
  })
}

const recommendationSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      year: { type: Type.INTEGER },
      genre: { type: Type.STRING },
      reason: { type: Type.STRING },
    },
    required: ['title', 'year', 'genre', 'reason'],
  },
}

/**
 * Generate five movie recommendations for a preference.
 * This module is server-only; never import it from browser code.
 */
export async function getMovieRecommendations(preference) {
  if (typeof preference !== 'string' || !preference.trim()) {
    throw new Error('Enter your movie preferences to get recommendations.')
  }

  const trimmedPreference = preference.trim()
  if (trimmedPreference.length > MAX_PREFERENCE_LENGTH) {
    throw new Error(`Movie preferences must be ${MAX_PREFERENCE_LENGTH} characters or fewer.`)
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    logGeminiFailure('configuration', new Error('GEMINI_API_KEY is not set in the server environment.'))
    throw new Error('Movie recommendations are not configured on the server.')
  }

  const fallbackModel = process.env.GEMINI_FALLBACK_MODEL?.trim()
  const usableFallbackModel = fallbackModel && fallbackModel !== MODEL ? fallbackModel : null
  const overallTimeout = AbortSignal.timeout(GEMINI_OVERALL_TIMEOUT_MS)
  let ai
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        timeout: GEMINI_REQUEST_TIMEOUT_MS,
        retryOptions: { attempts: 1 },
        fetch: (input, init) => {
          // The SDK passes its per-request timeout signal on the Request object,
          // rather than in init. Preserve it while adding the shared deadline so
          // each model attempt gets its own 10-second timeout.
          const requestSignal = init?.signal ??
            (input instanceof Request ? input.signal : undefined)
          return fetch(input, {
            ...init,
            signal: requestSignal
              ? AbortSignal.any([overallTimeout, requestSignal])
              : overallTimeout,
          })
        },
      },
    })
  } catch (error) {
    logGeminiFailure('client_initialization', error, apiKey)
    throw new Error('Could not generate movie recommendations. Please try again.')
  }
  let response
  let model = MODEL
  let attempt = 0

  while (attempt <= MAX_RETRIES) {
    if (overallTimeout.aborted) {
      const error = overallTimeout.reason ?? new Error('The overall Gemini request timed out.')
      logGeminiFailure('overall_timeout', error, apiKey)
      throw new Error('Could not generate movie recommendations. Please try again.')
    }

    const attemptModel = model
    const startedAt = Date.now()
    console.info('[MovieHub Gemini] Calling model', {
      model: modelNameForLog(attemptModel, apiKey),
      attempt: attempt + 1,
    })
    try {
      response = await ai.models.generateContent({
        model: attemptModel,
        contents: `Recommend exactly ${RECOMMENDATION_COUNT} movies based on these preferences: ${trimmedPreference}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: recommendationSchema,
        },
      })
      logModelAttempt('succeeded', attemptModel, attempt + 1, startedAt, apiKey)
      break
    } catch (error) {
      const status = getRetryableStatus(error)
      logModelAttempt('failed', attemptModel, attempt + 1, startedAt, apiKey, status)
      if (overallTimeout.aborted) {
        logGeminiFailure('overall_timeout', error, apiKey)
        throw new Error('Could not generate movie recommendations. Please try again.')
      }

      const canFailOver = attemptModel === MODEL && usableFallbackModel &&
        (status === 429 || status === 503 || status === 504 || isRequestTimeout(error))
      if (canFailOver && attempt < MAX_RETRIES) {
        model = usableFallbackModel
        attempt += 1
        continue
      }

      const canRetrySameModel = (status === 429 || status === 503) && attempt < MAX_RETRIES
      if (canRetrySameModel) {
        try {
          await wait(INITIAL_RETRY_DELAY_MS * (2 ** attempt), overallTimeout)
        } catch (timeoutError) {
          logGeminiFailure('overall_timeout', timeoutError, apiKey)
          throw new Error('Could not generate movie recommendations. Please try again.')
        }
        attempt += 1
        continue
      }

      logGeminiFailure('generateContent', error, apiKey)
      throw new Error('Could not generate movie recommendations. Please try again.')
    }
  }

  const responseText = response.text?.trim()
  if (!responseText) {
    logGeminiFailure('response', new Error('The Gemini API returned an empty response.'), apiKey)
    throw new Error('The recommendation service returned an empty response. Please try again.')
  }

  let recommendations
  try {
    recommendations = JSON.parse(responseText)
  } catch (error) {
    logGeminiFailure('json_parse', error, apiKey)
    throw new Error('The recommendation service returned invalid data. Please try again.')
  }

  if (!Array.isArray(recommendations) || recommendations.length !== RECOMMENDATION_COUNT) {
    logGeminiFailure('response_validation', new Error('Gemini did not return exactly five recommendations.'), apiKey)
    throw new Error('The recommendation service did not return exactly five movies. Please try again.')
  }

  return recommendations.map((recommendation, index) => {
    const { title, year, genre, reason } = recommendation ?? {}
    if (
      typeof title !== 'string' || !title.trim() ||
      !Number.isInteger(year) || year < 1888 || year > 2100 ||
      typeof genre !== 'string' || !genre.trim() ||
      typeof reason !== 'string' || !reason.trim()
    ) {
      const error = new Error(`Gemini returned an invalid movie at position ${index + 1}.`)
      logGeminiFailure('response_validation', error, apiKey)
      throw new Error(`The recommendation service returned an invalid movie at position ${index + 1}.`)
    }

    return {
      title: title.trim(),
      year,
      genre: genre.trim(),
      reason: reason.trim(),
    }
  })
}
