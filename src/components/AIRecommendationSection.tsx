import { useRef, useState, type FormEvent } from 'react'
import './AIRecommendationSection.css'

const MAX_PREFERENCE_LENGTH = 1000

interface Recommendation {
  title: string
  year: number
  genre: string
  reason: string
}

type RecommendationStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error'

function isRecommendation(value: unknown): value is Recommendation {
  if (!value || typeof value !== 'object') return false

  const recommendation = value as Record<string, unknown>
  return typeof recommendation.title === 'string' && recommendation.title.trim().length > 0 &&
    typeof recommendation.year === 'number' && Number.isInteger(recommendation.year) &&
    typeof recommendation.genre === 'string' && recommendation.genre.trim().length > 0 &&
    typeof recommendation.reason === 'string' && recommendation.reason.trim().length > 0
}

function AIRecommendationSection() {
  const [preference, setPreference] = useState('')
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [status, setStatus] = useState<RecommendationStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [validationError, setValidationError] = useState('')
  const requestInProgress = useRef(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (requestInProgress.current) return

    const trimmedPreference = preference.trim()
    if (!trimmedPreference) {
      setValidationError('Tell us what kind of movies you enjoy.')
      setStatus('idle')
      return
    }
    if (trimmedPreference.length > MAX_PREFERENCE_LENGTH) {
      setValidationError(`Keep your preferences to ${MAX_PREFERENCE_LENGTH} characters or fewer.`)
      setStatus('idle')
      return
    }

    requestInProgress.current = true
    setValidationError('')
    setErrorMessage('')
    setRecommendations([])
    setStatus('loading')

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preference: trimmedPreference }),
      })
      const data: unknown = await response.json().catch(() => null)

      if (!response.ok) {
        const message = data && typeof data === 'object' && 'error' in data &&
          typeof data.error === 'string'
          ? data.error
          : 'We could not get recommendations right now. Please try again.'
        throw new Error(message)
      }

      const received = data && typeof data === 'object' && 'recommendations' in data
        ? data.recommendations
        : undefined
      if (!Array.isArray(received)) {
        throw new Error('The recommendation service returned an unexpected response.')
      }
      if (received.length === 0) {
        setStatus('empty')
        return
      }
      if (received.length !== 5 || !received.every(isRecommendation)) {
        throw new Error('The recommendation service returned incomplete movie details.')
      }

      setRecommendations(received)
      setStatus('success')
    } catch (error) {
      setErrorMessage(error instanceof Error
        ? error.message
        : 'We could not get recommendations right now. Please try again.')
      setStatus('error')
    } finally {
      requestInProgress.current = false
    }
  }

  return (
    <section className="ai-recommendation" aria-labelledby="ai-recommendation-title">
      <div className="ai-recommendation-heading">
        <p className="eyebrow">YOUR NEXT MOVIE NIGHT</p>
        <h1 id="ai-recommendation-title" tabIndex={-1}>Find a movie that fits your mood</h1>
        <p>Describe what you feel like watching, and get five picks made for you.</p>
      </div>

      <form className="ai-recommendation-form" onSubmit={handleSubmit}>
        <label htmlFor="movie-preference">What are you in the mood for?</label>
        <textarea
          id="movie-preference"
          name="preference"
          rows={3}
          aria-required="true"
          maxLength={MAX_PREFERENCE_LENGTH}
          placeholder="A thoughtful sci-fi adventure with memorable characters..."
          value={preference}
          aria-invalid={Boolean(validationError)}
          aria-describedby={validationError ? 'preference-error preference-count' : 'preference-count'}
          onChange={(event) => {
            setPreference(event.target.value)
            if (validationError) setValidationError('')
          }}
        />
        <div className="ai-recommendation-form-footer">
          <span id="preference-count" className="preference-count">
            {preference.length}/{MAX_PREFERENCE_LENGTH}
          </span>
          <button className="ai-recommendation-submit" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Finding your movies…' : 'Get AI Recommendations'}
          </button>
        </div>
        {validationError && <p id="preference-error" className="recommendation-validation" role="alert">{validationError}</p>}
      </form>

      {status === 'idle' && (
        <p className="recommendation-empty-prompt">Your personalized movie picks will appear here.</p>
      )}
      {status === 'loading' && (
        <div className="recommendation-loading" role="status" aria-live="polite">
          <span className="loading-spinner" aria-hidden="true" />
          <span>Finding movies that match your mood…</span>
        </div>
      )}
      {status === 'empty' && (
        <p className="recommendation-empty-prompt" role="status">No recommendations came back. Try describing your movie mood another way.</p>
      )}
      {status === 'error' && (
        <p className="recommendation-error" role="alert">{errorMessage}</p>
      )}
      {status === 'success' && (
        <>
          <p className="visually-hidden" role="status">Five AI movie recommendations are ready.</p>
          <section className="recommendation-results" aria-label="AI movie recommendations">
            {recommendations.map((recommendation, index) => (
              <article className="recommendation-card" key={`${recommendation.title}-${recommendation.year}-${index}`}>
                <div className="recommendation-card-topline">
                  <span className="recommendation-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="recommendation-genre">{recommendation.genre}</span>
                </div>
                <h2>{recommendation.title}</h2>
                <p className="recommendation-year">{recommendation.year}</p>
                <p className="recommendation-reason">{recommendation.reason}</p>
              </article>
            ))}
          </section>
        </>
      )}
    </section>
  )
}

export default AIRecommendationSection
