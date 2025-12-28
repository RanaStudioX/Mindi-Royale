<template>
  <div class="landing-page">
    <div class="landing-hero">
      <div class="hero-content glass-panel">
        <h1 class="game-title">Mindi Royale</h1>
        <p class="game-tagline">Premium Card Game Experience</p>
        
        <div v-if="!isFirebaseConfigured" class="firebase-notice">
          <p>💡 Using local multiplayer mode. For true online multiplayer across devices, set up Firebase (see FIREBASE_SETUP.md)</p>
        </div>
        
        <div class="game-mode-selection">
          <div class="mode-option glass-panel" @click="startSinglePlayer">
            <div class="mode-icon-large">🤖</div>
            <h2>Single Player</h2>
            <p>Play against 3 AI opponents</p>
          </div>
          
          <div class="mode-option glass-panel" @click="startMultiplayer">
            <div class="mode-icon-large">🌐</div>
            <h2>Multiplayer</h2>
            <p>Play with friends (local or online)</p>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'
import { useGameStore } from '../stores/gameStore.js'
import { isFirebaseConfigured } from '../config/firebase.js'

const router = useRouter()
const authStore = useAuthStore()
const gameStore = useGameStore()

function startSinglePlayer() {
  if (!authStore.user) {
    authStore.setGuestUser()
    gameStore.currentUser = authStore.user
  }
  gameStore.aiDifficulty = 'medium'
  gameStore.initializeGame('single')
  router.push('/game')
}

function startMultiplayer() {
  if (!authStore.user) {
    authStore.setGuestUser()
    gameStore.currentUser = authStore.user
  }
  router.push('/lobby')
}
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--secondary-dark) 100%);
  position: relative;
  overflow: hidden;
}

.landing-page::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.landing-hero {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 40px;
}

.hero-content {
  padding: 60px 40px;
  max-width: 800px;
}

.game-title {
  font-size: 64px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-gold) 0%, #ffffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 20px;
  text-shadow: 0 0 30px rgba(212, 175, 55, 0.5);
}

.game-tagline {
  font-size: 24px;
  color: var(--text-secondary);
  margin-bottom: 40px;
}

.firebase-notice {
  padding: 12px 16px;
  margin-bottom: 30px;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 8px;
  color: var(--accent-red);
  font-size: 13px;
  text-align: center;
}

.game-mode-selection {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 30px;
}

.mode-option {
  padding: 40px 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.mode-option:hover:not(.disabled) {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  border-color: var(--accent-gold);
}

.mode-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mode-icon-large {
  font-size: 80px;
  margin-bottom: 20px;
}

.mode-option h2 {
  font-size: 28px;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.mode-option p {
  color: var(--text-secondary);
  font-size: 16px;
}

.mode-disabled-text {
  margin-top: 12px;
  padding: 8px;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 6px;
  color: var(--accent-red);
  font-size: 12px;
}

@media (max-width: 768px) {
  .game-title {
    font-size: 48px;
  }
  
  .game-tagline {
    font-size: 18px;
  }
  
  .hero-content {
    padding: 40px 20px;
  }
  
  .game-mode-selection {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .mode-icon-large {
    font-size: 60px;
  }
  
  .mode-option h2 {
    font-size: 24px;
  }
}
</style>

