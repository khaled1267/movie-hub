import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MovieCard from './MovieCard'

const movie = {
  imdbID: 'tt2543164',
  Title: 'Arrival',
  Year: '2016',
  Type: 'movie',
  Poster: 'N/A',
}

describe('MovieCard accessibility', () => {
  it('uses a native details link and a separate named favorite button', () => {
    const onOpenDetails = vi.fn()
    const onToggleFavorite = vi.fn()
    render(
      <MovieCard
        movie={movie}
        isFavorite={false}
        onOpenDetails={onOpenDetails}
        onToggleFavorite={onToggleFavorite}
      />,
    )

    const detailsLink = screen.getByRole('link', { name: /Arrival/ })
    expect(detailsLink.tagName).toBe('A')
    expect(detailsLink.getAttribute('href')).toBe('/movie/tt2543164')
    expect(detailsLink.querySelector('button')).toBeNull()
    expect(screen.getByRole('img', { name: 'No poster available' })).toBeTruthy()

    fireEvent.click(detailsLink)
    expect(onOpenDetails).toHaveBeenCalledWith('tt2543164')

    const favoriteButton = screen.getByRole('button', { name: 'Add to Favorites: Arrival' })
    expect(favoriteButton.getAttribute('aria-label')).toContain('Add to Favorites')
    expect(favoriteButton.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(favoriteButton)
    expect(onToggleFavorite).toHaveBeenCalledWith(movie)
  })
})
