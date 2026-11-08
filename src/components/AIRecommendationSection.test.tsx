import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AIRecommendationSection from './AIRecommendationSection'

const recommendations = [
  { title: 'Arrival', year: 2016, genre: 'Science Fiction', reason: 'A thoughtful first contact story.' },
  { title: 'Interstellar', year: 2014, genre: 'Science Fiction', reason: 'A heartfelt journey across space.' },
  { title: 'Contact', year: 1997, genre: 'Drama', reason: 'A curious and human look at discovery.' },
  { title: 'Moon', year: 2009, genre: 'Science Fiction', reason: 'An intimate mystery on the lunar surface.' },
  { title: 'The Martian', year: 2015, genre: 'Adventure', reason: 'A resourceful and hopeful space adventure.' },
]

function response(body: unknown, ok = true) {
  return { ok, json: vi.fn().mockResolvedValue(body) } as unknown as Response
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((complete) => { resolve = complete })
  return { promise, resolve }
}

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('AIRecommendationSection', () => {
  it('sends the preference and renders all five recommendations', async () => {
    fetchMock.mockResolvedValue(response({ recommendations }))
    render(<AIRecommendationSection />)

    fireEvent.change(screen.getByLabelText('What are you in the mood for?'), {
      target: { value: '  thoughtful science fiction  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Get AI Recommendations' }))

    expect(await screen.findByRole('heading', { name: 'Arrival' })).toBeTruthy()
    expect(screen.getByRole('status').textContent).toContain('Five AI movie recommendations are ready.')
    expect(fetchMock).toHaveBeenCalledWith('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preference: 'thoughtful science fiction' }),
    })
    expect(screen.getAllByRole('article')).toHaveLength(5)
    expect(screen.getByText('2016')).toBeTruthy()
    expect(screen.getAllByText('Science Fiction')).toHaveLength(3)
    expect(screen.getByText('A thoughtful first contact story.')).toBeTruthy()
  })

  it('validates an empty preference without calling the API', () => {
    render(<AIRecommendationSection />)

    fireEvent.click(screen.getByRole('button', { name: 'Get AI Recommendations' }))

    expect(screen.getByRole('alert').textContent).toContain('Tell us what kind of movies you enjoy.')
    expect(screen.getByLabelText('What are you in the mood for?').getAttribute('aria-invalid')).toBe('true')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows loading and disables submit until the request completes', async () => {
    const request = deferred<Response>()
    fetchMock.mockReturnValue(request.promise)
    render(<AIRecommendationSection />)
    fireEvent.change(screen.getByLabelText('What are you in the mood for?'), {
      target: { value: 'quiet mysteries' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Get AI Recommendations' }))

    expect(screen.getByRole('status').textContent).toContain('Finding movies that match your mood')
    expect(screen.getByRole('button', { name: 'Finding your movies…' }).hasAttribute('disabled')).toBe(true)

    request.resolve(response({ recommendations }))
    expect(await screen.findByRole('heading', { name: 'Arrival' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Get AI Recommendations' }).hasAttribute('disabled')).toBe(false)
  })

  it('shows the API error message', async () => {
    fetchMock.mockResolvedValue(response({ error: 'Recommendation service unavailable.' }, false))
    render(<AIRecommendationSection />)
    fireEvent.change(screen.getByLabelText('What are you in the mood for?'), {
      target: { value: 'a warm comedy' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Get AI Recommendations' }))

    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Recommendation service unavailable.')
  })

  it('shows the empty state when the API returns no recommendations', async () => {
    fetchMock.mockResolvedValue(response({ recommendations: [] }))
    render(<AIRecommendationSection />)
    fireEvent.change(screen.getByLabelText('What are you in the mood for?'), {
      target: { value: 'anything unexpected' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Get AI Recommendations' }))

    expect(await screen.findByText(
      'No recommendations came back. Try describing your movie mood another way.',
    )).toBeTruthy()
  })

  it('rejects an invalid recommendation payload', async () => {
    fetchMock.mockResolvedValue(response({ recommendations: [{ title: 'Arrival', year: '2016' }] }))
    render(<AIRecommendationSection />)
    fireEvent.change(screen.getByLabelText('What are you in the mood for?'), {
      target: { value: 'thoughtful sci-fi' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Get AI Recommendations' }))

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'The recommendation service returned incomplete movie details.',
    )
  })

  it('prevents duplicate submissions while a request is pending', async () => {
    const request = deferred<Response>()
    fetchMock.mockReturnValue(request.promise)
    render(<AIRecommendationSection />)
    fireEvent.change(screen.getByLabelText('What are you in the mood for?'), {
      target: { value: 'space exploration' },
    })
    const form = screen.getByLabelText('What are you in the mood for?').closest('form')
    if (!form) throw new Error('Recommendation form not found')

    fireEvent.submit(form)
    fireEvent.submit(form)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    request.resolve(response({ recommendations }))
    expect(await screen.findByRole('heading', { name: 'Arrival' })).toBeTruthy()
  })
})
