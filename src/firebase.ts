import { getApps, initializeApp, type FirebaseApp } from 'firebase/app'

interface FirebaseRuntime {
  app: FirebaseApp | null
}

declare global {
  // Preserve the Firebase singleton when Vite reevaluates this module during HMR.
  var __movieHubFirebaseRuntime: FirebaseRuntime | undefined
}

const firebaseRuntime = globalThis.__movieHubFirebaseRuntime ??= { app: null }

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseConfigured = Object.values(firebaseConfig).every(Boolean)
export const firebaseDatabaseUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL ?? ''
export const firebaseDatabaseUrlConfigured = Boolean(firebaseDatabaseUrl)

export function getFirebaseApp() {
  if (!firebaseConfigured) return null

  firebaseRuntime.app ??= getApps().find((app) => app.name === '[DEFAULT]') ?? initializeApp(firebaseConfig)
  return firebaseRuntime.app
}
