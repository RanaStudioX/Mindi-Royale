import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBg1dpaqlTj6lUOcUxORfUUcOYmseS2qKI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mindi-royale.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mindi-royale",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mindi-royale.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1009041253764",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1009041253764:web:37cdfa1acd58b61f46e9d1",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://mindi-royale-default-rtdb.firebaseio.com"
}

const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && 
                              firebaseConfig.projectId !== "YOUR_PROJECT_ID"

let app = null
let auth = null
let db = null
let realtimeDb = null

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    
    if (firebaseConfig.databaseURL && firebaseConfig.databaseURL !== "YOUR_DATABASE_URL") {
      try {
        realtimeDb = getDatabase(app)
      } catch (dbError) {
        realtimeDb = null
      }
    } else {
      realtimeDb = null
    }
  } catch (error) {
    realtimeDb = null
  }
}

if (typeof window !== 'undefined') {
  const originalWarn = console.warn
  console.warn = function(...args) {
    const message = args[0]?.toString() || ''
    if (message.includes('document.write') || 
        (message.includes('Violation') && message.includes('document.write'))) {
      return
    }
    originalWarn.apply(console, args)
  }
}

export { auth, db, realtimeDb, isFirebaseConfigured }

