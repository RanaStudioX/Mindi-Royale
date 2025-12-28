<template>
  <div class="auth-page">
    <div class="auth-container glass-panel">
      <h2 class="auth-title">Sign In</h2>
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input
            v-model="email"
            type="email"
            class="form-control"
            required
            placeholder="Enter your email"
          />
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input
            v-model="password"
            type="password"
            class="form-control"
            required
            placeholder="Enter your password"
          />
        </div>
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <button type="submit" class="btn btn-primary w-100 mb-3" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
        <button type="button" @click="signInWithGoogle" class="btn btn-secondary w-100 mb-3" :disabled="loading">
          Sign in with Google
        </button>
        <div class="auth-links">
          <router-link to="/signup">Don't have an account? Sign up</router-link>
          <router-link to="/">Back to Home</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'
import { useGameStore } from '../stores/gameStore.js'

const router = useRouter()
const authStore = useAuthStore()
const gameStore = useGameStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  
  const result = await authStore.signIn(email.value, password.value)
  
  if (result.success) {
    gameStore.currentUser = result.user
    router.push('/menu')
  } else {
    error.value = result.error
  }
  
  loading.value = false
}

async function signInWithGoogle() {
  error.value = ''
  loading.value = true
  
  const result = await authStore.signInWithGoogle()
  
  if (result.success) {
    gameStore.currentUser = result.user
    router.push('/menu')
  } else {
    error.value = result.error
  }
  
  loading.value = false
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  padding: 40px;
}

.auth-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 32px;
  font-weight: 600;
}

.auth-form {
  width: 100%;
}

.form-label {
  color: var(--text-secondary);
  margin-bottom: 8px;
  display: block;
}

.form-control {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  padding: 12px;
  border-radius: 8px;
  width: 100%;
}

.form-control:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--accent-gold);
  outline: none;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.2);
}

.alert {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.alert-danger {
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid var(--accent-red);
  color: var(--accent-red);
}

.auth-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
  margin-top: 20px;
}

.auth-links a {
  color: var(--accent-blue);
  text-decoration: none;
  transition: color 0.3s ease;
}

.auth-links a:hover {
  color: var(--accent-gold);
}
</style>

