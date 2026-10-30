import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { auth, firebaseConfigured } from '../firebase'

interface AuthContextValue {
  user: User | null
  loading: boolean
  firebaseConfigured: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function getFriendlyError(error: unknown): Error {
  const code = (error as { code?: string } | null)?.code
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/invalid-credential': 'The email or password is incorrect. Please try again.',
    'auth/invalid-login-credentials': 'The email or password is incorrect. Please try again.',
    'auth/user-not-found': 'The email or password is incorrect. Please try again.',
    'auth/wrong-password': 'The email or password is incorrect. Please try again.',
    'auth/weak-password': 'Choose a stronger password with at least 6 characters.',
    'auth/user-disabled': 'This account is disabled. Contact support for help.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed': 'Could not connect. Check your internet connection and try again.',
    'auth/operation-not-allowed': 'Email and password sign-in is not enabled in Firebase yet.',
  }

  if (error instanceof Error && error.message.startsWith('Firebase is not configured.')) {
    return error
  }

  return new Error(
    (code && messages[code]) || 'Authentication failed. Please try again.',
  )
}

function requireConfiguredAuth() {
  if (!auth) {
    throw new Error(
      'Firebase is not configured. Add the VITE_FIREBASE values from .env.example to your .env file.',
    )
  }
  return auth
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(firebaseConfigured)

  useEffect(() => {
    if (!auth) return

    return onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser)
        setLoading(false)
      },
      () => {
        setUser(null)
        setLoading(false)
      },
    )
  }, [])

  async function login(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(requireConfiguredAuth(), email, password)
    } catch (error) {
      throw getFriendlyError(error)
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      const credential = await createUserWithEmailAndPassword(
        requireConfiguredAuth(),
        email,
        password,
      )
      await updateProfile(credential.user, { displayName: name })
    } catch (error) {
      throw getFriendlyError(error)
    }
  }

  async function logout() {
    try {
      await signOut(requireConfiguredAuth())
    } catch (error) {
      throw getFriendlyError(error)
    }
  }

  const value = { user, loading, firebaseConfigured, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside an AuthProvider.')
  return context
}
