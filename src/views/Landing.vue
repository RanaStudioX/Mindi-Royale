<template>
  <div class="landing-page">
    <div class="landing-hero">
      <div class="hero-content glass-panel animate__animated animate__zoomIn">
        <h1 class="game-title animate__animated animate__fadeInDown">
          <i class="bi bi-suit-spade-fill text-warning me-3"></i>Mindi Royale
        </h1>
        <p class="game-tagline animate__animated animate__fadeInUp">Premium Card Game Experience</p>
        
        <div v-if="!isFirebaseConfigured" class="firebase-notice alert alert-info animate__animated animate__fadeIn">
          <i class="bi bi-info-circle me-2"></i>
          <span>Using local multiplayer mode. For true online multiplayer across devices, set up Firebase.</span>
        </div>
        
        <div class="game-mode-selection">
          <div class="mode-option glass-panel animate__animated animate__fadeInLeft" @click="startSinglePlayer">
            <div class="mode-icon-large animate__animated animate__bounce">🤖</div>
            <h2>
              <i class="bi bi-cpu me-2"></i>Single Player
            </h2>
            <p>Play against 3 AI opponents</p>
          </div>
          
          <div class="mode-option glass-panel animate__animated animate__fadeInRight" @click="startMultiplayer">
            <div class="mode-icon-large animate__animated animate__pulse">🌐</div>
            <h2>
              <i class="bi bi-people-fill me-2"></i>Multiplayer
            </h2>
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
@import '../assets/styles/views/shared-pages.css';

.landing-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--secondary-dark) 100%);
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
  position: relative;
  overflow: hidden;
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
  z-index: 2;
  text-align: center;
  padding: 40px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  padding: 60px 50px;
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
}

.game-title {
  font-size: 64px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-gold) 0%, #ffffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 auto 20px auto;
  text-shadow: 0 0 30px rgba(212, 175, 55, 0.5);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.game-tagline {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.9) !important;
  margin: 0 auto 50px auto;
  text-align: center;
  font-weight: 400;
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
  gap: 30px;
  margin: 0 auto;
  width: 100%;
  max-width: 900px;
  justify-items: center;
  align-items: stretch;
}

.mode-option {
  padding: 50px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 2px solid rgba(255, 215, 0, 0.3);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  border-radius: 20px;
  width: 100%;
  max-width: 100%;
}

.mode-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.mode-option:hover::before {
  left: 100%;
}

.mode-option:hover:not(.disabled) {
  transform: translateY(-15px) scale(1.05);
  box-shadow: 
    0 20px 60px rgba(255, 215, 0, 0.4),
    0 0 40px rgba(255, 215, 0, 0.2),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.8);
}

.mode-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mode-icon-large {
  font-size: 80px;
  margin: 0 0 24px 0;
  line-height: 1;
  display: block;
}

.mode-option h2 {
  font-size: 28px;
  margin: 0 0 16px 0;
  color: var(--text-primary) !important;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.mode-option p {
  color: rgba(255, 255, 255, 0.85) !important;
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
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
    flex-direction: column;
    gap: 10px;
  }
  
  .game-tagline {
    font-size: 18px;
    margin-bottom: 40px;
  }
  
  .hero-content {
    padding: 40px 20px;
  }
  
  .game-mode-selection {
    grid-template-columns: 1fr;
    gap: 20px;
    max-width: 100%;
  }
  
  .mode-option {
    min-height: 280px;
    padding: 40px 30px;
  }
  
  .mode-icon-large {
    font-size: 60px;
    margin-bottom: 20px;
  }
  
  .mode-option h2 {
    font-size: 24px;
  }
  
  .mode-option p {
    font-size: 15px;
  }
}
</style>

