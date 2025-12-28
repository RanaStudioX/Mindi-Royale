import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../config/firebase.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)

  if (auth && isFirebaseConfigured) {
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser
      loading.value = false
    })
  } else {
    loading.value = false
  }

  async function signIn(email, password) {
    if (!auth || !isFirebaseConfigured) {
      return { success: false, error: 'Firebase is not configured. Please set up Firebase to use authentication.' }
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: result.user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async function signUp(email, password, displayName) {
    if (!auth || !isFirebaseConfigured) {
      return { success: false, error: 'Firebase is not configured. Please set up Firebase to use authentication.' }
    }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      if (displayName) {
        await result.user.updateProfile({ displayName })
      }
      return { success: true, user: result.user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async function signInWithGoogle() {
    if (!auth || !isFirebaseConfigured) {
      return { success: false, error: 'Firebase is not configured. Please set up Firebase to use authentication.' }
    }
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      return { success: true, user: result.user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async function signOut() {
    if (!auth || !isFirebaseConfigured) {
      user.value = null
      return { success: true }
    }
    try {
      await firebaseSignOut(auth)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  function setGuestUser() {
    user.value = {
      uid: `guest-${Date.now()}`,
      displayName: 'Guest Player',
      isGuest: true
    }
    loading.value = false
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    setGuestUser
  }
})

