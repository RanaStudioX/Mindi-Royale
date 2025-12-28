<template>
  <div class="menu-page">
    <LoadingSpinner 
      :show="isLoading" 
      :message="loadingMessage"
      :fullscreen="true"
    />
    
    <div class="menu-container">
      <div class="menu-header glass-panel">
        <h1>Mindi Royale</h1>
        <div class="user-info" v-if="authStore.user">
          <span>{{ authStore.user.displayName || 'Guest' }}</span>
          <div class="menu-actions">
            <router-link to="/profile" class="btn btn-secondary btn-sm">Profile</router-link>
            <button @click="handleSignOut" class="btn btn-secondary btn-sm" v-if="!authStore.user.isGuest">Sign Out</button>
          </div>
        </div>
      </div>
      
      <div class="game-modes">
        <div class="mode-card glass-panel" @click="startGame('single')">
          <div class="mode-icon">🤖</div>
          <h3>Single Player</h3>
          <p>Play against 3 AI opponents</p>
          <div class="mode-settings" v-if="showSingleSettings">
            <label>AI Difficulty</label>
            <select v-model="aiDifficulty" class="form-select">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
        
        <div 
          class="mode-card glass-panel" 
          :class="{ 'disabled': !isFirebaseConfigured }"
          @click="startGame('multiplayer')"
        >
          <div class="mode-icon">🌐</div>
          <h3>Online Multiplayer</h3>
          <p>Play with friends in real-time</p>
          <div v-if="!isFirebaseConfigured" class="mode-notice">
            Requires Firebase configuration
          </div>
        </div>
        
      </div>
      
      <div class="menu-footer">
        <button @click="joinRoom" class="btn btn-secondary">Join Room</button>
        <button @click="createRoom" class="btn btn-primary">Create Room</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'
import { useGameStore } from '../stores/gameStore.js'
import { isFirebaseConfigured } from '../config/firebase.js'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()
const gameStore = useGameStore()

const showSingleSettings = ref(false)
const aiDifficulty = ref('medium')
const isLoading = ref(false)
const loadingMessage = ref('')

function startGame(mode) {
  if (mode === 'single') {
    isLoading.value = true
    loadingMessage.value = 'Initializing game...'
    
    setTimeout(() => {
      gameStore.aiDifficulty = aiDifficulty.value
      gameStore.initializeGame('single')
      router.push('/game')
    }, 500)
  } else if (mode === 'multiplayer') {
    router.push('/lobby')
  }
}

function createRoom() {
  router.push('/lobby')
}

function joinRoom() {
  const code = prompt('Enter room code:')
  if (code) {
    router.push(`/lobby/${code}`)
  }
}

async function handleSignOut() {
  await authStore.signOut()
  router.push('/')
}
</script>

<style scoped>
.menu-page {
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-container {
  width: 100%;
  max-width: 1200px;
}

.menu-header {
  padding: 30px;
  margin-bottom: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-header h1 {
  font-size: 48px;
  background: linear-gradient(135deg, var(--accent-gold) 0%, #ffffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-actions {
  display: flex;
  gap: 8px;
}

.game-modes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.mode-card {
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-card:hover:not(.disabled) {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  border-color: var(--accent-gold);
}

.mode-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mode-notice {
  margin-top: 12px;
  padding: 8px;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 6px;
  color: var(--accent-red);
  font-size: 12px;
}

.mode-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.mode-card h3 {
  font-size: 24px;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.mode-card p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.mode-settings {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--glass-border);
  text-align: left;
}

.mode-settings label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-size: 14px;
}

.form-select,
.form-control {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  padding: 8px 12px;
  border-radius: 6px;
  width: 100%;
}

.menu-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
}

@media (max-width: 768px) {
  .menu-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .game-modes {
    grid-template-columns: 1fr;
  }
}
</style>

