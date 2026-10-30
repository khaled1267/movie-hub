import { useEffect, useState } from 'react'
import { onValue, ref, remove, set } from 'firebase/database'
import { database, firebaseDatabaseUrlConfigured } from '../firebase'
import { useAuth } from '../context/AuthContext'
import type { MovieSummary } from '../types/movie'

function isMovieSummary(value: unknown): value is MovieSummary {
  if (typeof value !== 'object' || value === null) return false
  const movie = value as Record<string, unknown>
  return typeof movie.imdbID === 'string' && typeof movie.Title === 'string' &&
    typeof movie.Year === 'string' && typeof movie.Type === 'string' &&
    typeof movie.Poster === 'string'
}

export function useFavorites() {
  const { user, loading: authLoading } = useAuth()
  const [favorites, setFavorites] = useState<MovieSummary[]>([])
  const [favoritesUserId, setFavoritesUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const userFavorites = user && favoritesUserId === user.uid ? favorites : []

  useEffect(() => {
    let active = true
    setFavorites([])
    setFavoritesUserId(null)
    setError('')

    if (authLoading) return () => { active = false }
    if (!user) {
      setLoading(false)
      return () => { active = false }
    }
    if (!database) {
      setError('Favorites are unavailable. Set VITE_FIREBASE_DATABASE_URL in your environment.')
      setLoading(false)
      return () => { active = false }
    }

    setLoading(true)
    const favoritesRef = ref(database, `users/${user.uid}/favorites`)
    const unsubscribe = onValue(
      favoritesRef,
      (snapshot) => {
        if (!active) return
        const value: unknown = snapshot.val()
        const movies = value && typeof value === 'object' ? Object.values(value) : []
        setFavorites(movies.filter(isMovieSummary))
        setFavoritesUserId(user.uid)
        setLoading(false)
      },
      () => {
        if (!active) return
        setError('Could not load your favorites. Check your connection and database access.')
        setLoading(false)
      },
    )
    return () => {
      active = false
      unsubscribe()
    }
  }, [authLoading, user?.uid])

  async function toggleFavorite(movie: MovieSummary) {
    console.info('[MovieHub favorites] Save diagnostics', {
      authenticated: Boolean(user),
      databaseInitialized: Boolean(database),
      databaseUrlConfigured: firebaseDatabaseUrlConfigured,
    })
    if (!user || !database) {
      console.error('[MovieHub favorites] Save skipped', {
        reason: !user ? 'User is not authenticated' : 'Realtime Database is not initialized',
        referencePath: `users/{uid}/favorites/${movie.imdbID}`,
      })
      setError(user ? 'Favorites are unavailable. Set VITE_FIREBASE_DATABASE_URL in your environment.' : 'Log in to save favorites.')
      return
    }
    setError('')
    const movieRef = ref(database, `users/${user.uid}/favorites/${movie.imdbID}`)
    console.info('[MovieHub favorites] Realtime Database reference', {
      path: `users/{uid}/favorites/${movie.imdbID}`,
    })
    try {
      if (userFavorites.some((favorite) => favorite.imdbID === movie.imdbID)) {
        await remove(movieRef)
      } else {
        await set(movieRef, movie)
      }
    } catch (error) {
      const firebaseError = error as { code?: unknown; message?: unknown; stack?: unknown } | null
      console.error('[MovieHub favorites] Firebase write failed', {
        code: typeof firebaseError?.code === 'string' ? firebaseError.code : 'unknown',
        message: typeof firebaseError?.message === 'string' ? firebaseError.message : String(error),
        stack: typeof firebaseError?.stack === 'string' ? firebaseError.stack : undefined,
        authenticated: Boolean(user),
        referencePath: `users/{uid}/favorites/${movie.imdbID}`,
      })
      setError('Could not update your favorites. Check your connection and database rules.')
    }
  }

  return {
    favorites: userFavorites,
    toggleFavorite,
    loading,
    error,
    signedIn: Boolean(user),
  }
}
