<template>
  <div class="auth-page">
    <div class="auth-container glass-panel animate__animated animate__zoomIn">
      <h2 class="auth-title animate__animated animate__fadeInDown">
        <i class="bi bi-box-arrow-in-right me-2 text-warning"></i>Sign In
      </h2>
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="mb-3 animate__animated animate__fadeInUp">
          <label class="form-label">
            <i class="bi bi-envelope me-2"></i>Email
          </label>
          <input
            v-model="email"
            type="email"
            class="form-control"
            required
            placeholder="Enter your email"
          />
        </div>
        <div class="mb-3 animate__animated animate__fadeInUp">
          <label class="form-label">
            <i class="bi bi-lock me-2"></i>Password
          </label>
          <input
            v-model="password"
            type="password"
            class="form-control"
            required
            placeholder="Enter your password"
          />
        </div>
        <div v-if="error" class="alert alert-danger animate__animated animate__shakeX">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
        </div>
        <button type="submit" class="btn btn-primary w-100 mb-3 animate__animated animate__fadeInUp" :disabled="loading">
          <i class="bi bi-box-arrow-in-right me-2" v-if="!loading"></i>
          <span class="spinner-border spinner-border-sm me-2" v-if="loading"></span>
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
        <button type="button" @click="signInWithGoogle" class="btn btn-outline-danger w-100 mb-3 animate__animated animate__fadeInUp" :disabled="loading">
          <i class="bi bi-google me-2"></i>Sign in with Google
        </button>
        <div class="auth-links animate__animated animate__fadeInUp">
          <router-link to="/signup" class="text-decoration-none">
            <i class="bi bi-person-plus me-2"></i>Don't have an account? Sign up
          </router-link>
          <router-link to="/" class="text-decoration-none">
            <i class="bi bi-house me-2"></i>Back to Home
          </router-link>
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
@import '../assets/styles/views/shared-pages.css';

.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
}

.auth-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 215, 0, 0.02) 2px, rgba(255, 215, 0, 0.02) 4px),
    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255, 215, 0, 0.02) 2px, rgba(255, 215, 0, 0.02) 4px);
  opacity: 0.3;
  animation: gridMove 20s linear infinite;
  z-index: 0;
  pointer-events: none;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(20px, 20px);
  }
}

.auth-container {
  width: 100%;
  max-width: 450px;
  padding: 3rem 2.5rem;
  position: relative;
  z-index: 1;
}

.auth-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 800;
  color: #ffd700;
  text-shadow: 
    0 0 20px rgba(255, 215, 0, 0.5),
    0 0 40px rgba(255, 215, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
}

.auth-title i {
  font-size: 2.2rem;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 20px rgba(255, 215, 0, 1));
  }
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
  background: rgba(255, 255, 255, 0.1) !important;
  border: 2px solid rgba(255, 255, 255, 0.2) !important;
  color: var(--text-primary) !important;
  padding: 14px 18px;
  border-radius: 12px;
  width: 100%;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.form-control:focus {
  background: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(212, 175, 55, 0.6) !important;
  outline: none !important;
  box-shadow: 
    0 0 0 3px rgba(212, 175, 55, 0.2),
    0 0 20px rgba(212, 175, 55, 0.3) !important;
  transform: scale(1.02);
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.5) !important;
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

