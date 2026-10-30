import { getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase, type Database } from 'firebase/database'

interface FirebaseRuntime {
  app: FirebaseApp | null
  database: Database | null
  databaseURL: string | null
}

declare global {
  // Preserve Firebase singletons when Vite reevaluates this module during HMR.
  var __movieHubFirebaseRuntime: FirebaseRuntime | undefined
}

const firebaseRuntime = globalThis.__movieHubFirebaseRuntime ??= {
  app: null,
  database: null,
  databaseURL: null,
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseConfigured = Object.values(firebaseConfig).every(Boolean)
const databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL

const firebaseApp = firebaseRuntime.app ?? (firebaseConfigured
  ? getApps().find((app) => app.name === '[DEFAULT]') ?? initializeApp(firebaseConfig)
  : null)
firebaseRuntime.app = firebaseApp

export const auth = firebaseApp ? getAuth(firebaseApp) : null
if (firebaseApp && databaseURL && !firebaseRuntime.database) {
  firebaseRuntime.database = getDatabase(firebaseApp, databaseURL)
  firebaseRuntime.databaseURL = databaseURL
}

// A changed Vite env value during HMR must not initialize a second database for
// the same app. The active page keeps using the one URL selected at startup.
export const database = firebaseRuntime.database
export const firebaseDatabaseUrlConfigured = Boolean(databaseURL)
