<template>
  <div class="menu-page">
    <div class="animated-background">
      <div class="card-pattern-overlay"></div>
      <div class="floating-cards">
        <div class="floating-card card-1">♠</div>
        <div class="floating-card card-2">♥</div>
        <div class="floating-card card-3">♦</div>
        <div class="floating-card card-4">♣</div>
        <div class="floating-card card-5">♠</div>
        <div class="floating-card card-6">♥</div>
        <div class="floating-card card-7">♦</div>
        <div class="floating-card card-8">♣</div>
      </div>
      <div class="card-back-pattern"></div>
      <div class="gradient-overlay"></div>
    </div>
    
    <LoadingSpinner 
      :show="isLoading" 
      :message="loadingMessage"
      :fullscreen="true"
    />
    
    <div class="menu-container position-relative">
      <div class="menu-header animate__animated animate__fadeInDown">
        <h1 class="menu-title">
          <i class="bi bi-suit-spade-fill"></i>Mindi Royale
        </h1>
        <div class="menu-user-info" v-if="authStore.user">
          <div class="user-badge">
            <i class="bi bi-person-circle"></i>
            <span>{{ authStore.user.displayName || 'Guest' }}</span>
          </div>
          <div class="menu-actions">
            <router-link to="/profile" class="btn btn-outline-light btn-sm">
              <i class="bi bi-person"></i>Profile
            </router-link>
            <button @click="handleSignOut" class="btn btn-outline-danger btn-sm" v-if="!authStore.user.isGuest">
              <i class="bi bi-box-arrow-right"></i>Sign Out
            </button>
          </div>
        </div>
      </div>
      
      <div class="game-modes row g-4 justify-content-center mb-5">
        <div class="col-md-6 col-lg-5">
          <div class="mode-card glass-panel animate__animated animate__fadeInLeft text-center h-100" @click="startGame('single')">
            <div class="mode-icon-wrapper mb-4">
              <div class="mode-icon animate__animated animate__bounce">🤖</div>
              <div class="icon-glow"></div>
            </div>
            <h3 class="mb-3 fw-bold">
              <i class="bi bi-cpu me-2 text-primary"></i>Single Player
            </h3>
            <p class="mb-0 fs-5" style="color: rgba(255, 255, 255, 0.8);">Play with Guest players</p>
            <div class="card-hover-effect"></div>
          </div>
        </div>
        
        <div class="col-md-6 col-lg-5">
          <div 
            class="mode-card glass-panel animate__animated animate__fadeInRight text-center h-100" 
            :class="{ 'disabled': !isFirebaseConfigured }"
            @click="startGame('multiplayer')"
          >
            <div class="mode-icon-wrapper mb-4">
              <div class="mode-icon animate__animated animate__pulse">🌐</div>
              <div class="icon-glow"></div>
            </div>
            <h3 class="mb-3 fw-bold">
              <i class="bi bi-globe me-2 text-info"></i>Online Multiplayer
            </h3>
            <p class="mb-0 fs-5" style="color: rgba(255, 255, 255, 0.8);">Play with friends in real-time</p>
            <div v-if="!isFirebaseConfigured" class="mode-notice alert alert-warning mt-3 mb-0 animate__animated animate__shakeX">
              <i class="bi bi-exclamation-triangle me-2"></i>Requires Firebase configuration
            </div>
            <div class="card-hover-effect"></div>
          </div>
        </div>
      </div>
      
      <div class="menu-footer d-flex justify-content-center gap-3 animate__animated animate__fadeInUp">
        <button @click="joinRoom" class="btn btn-outline-primary btn-lg px-5 animate__animated animate__pulse">
          <i class="bi bi-box-arrow-in-right me-2"></i>Join Room
        </button>
        <button @click="createRoom" class="btn btn-primary btn-lg px-5 animate__animated animate__pulse">
          <i class="bi bi-plus-circle me-2"></i>Create Room
        </button>
      </div>
    </div>

    <!-- Welcome Modal for Single Player -->
    <div v-if="showWelcomeModal" class="welcome-modal-overlay" @click.self="showWelcomeModal = false">
      <div class="welcome-modal glass-panel animate__animated animate__zoomIn">
        <div class="welcome-header text-center mb-4">
          <div class="welcome-icon mb-3 animate__animated animate__bounce">
            <i class="bi bi-suit-spade-fill text-warning" style="font-size: 4rem;"></i>
          </div>
          <h2 class="text-warning mb-2 animate__animated animate__fadeInDown">
            Welcome to Mindi Royale!
          </h2>
          <p class="text-white-50 animate__animated animate__fadeInUp">
            Get ready for an exciting card game experience
          </p>
        </div>
        
        <div class="welcome-content mb-4">
          <div class="welcome-info-card mb-3 animate__animated animate__fadeInLeft">
            <i class="bi bi-people-fill text-primary me-2"></i>
            <span>You'll be playing with 3 Guest players</span>
          </div>
          <div class="welcome-info-card mb-3 animate__animated animate__fadeInRight">
            <i class="bi bi-trophy-fill text-warning me-2"></i>
            <span>Work with your teammate to win tricks</span>
          </div>
          <div class="welcome-info-card animate__animated animate__fadeInLeft">
            <i class="bi bi-star-fill text-info me-2"></i>
            <span>Capture all 4 tens for a Mendikot!</span>
          </div>
        </div>
        
        <div class="welcome-actions d-flex gap-3 justify-content-center">
          <button @click="showWelcomeModal = false" class="btn btn-outline-secondary btn-lg px-4">
            <i class="bi bi-x-circle me-2"></i>Cancel
          </button>
          <button @click="confirmStartGame" class="btn btn-warning btn-lg px-5 animate__animated animate__pulse">
            <i class="bi bi-play-circle-fill me-2"></i>Start Game
          </button>
        </div>
      </div>
    </div>

    <!-- Join Room Modal -->
    <div v-if="showJoinRoomModal" class="join-room-modal-overlay" @click.self="cancelJoinRoom">
      <div class="join-room-modal glass-panel animate__animated animate__zoomIn">
        <div class="join-room-header text-center mb-4">
          <div class="room-icon-wrapper mb-3">
            <i class="bi bi-door-open-fill text-warning" style="font-size: 4rem;"></i>
          </div>
          <h3 class="text-warning mb-2 animate__animated animate__pulse">
            Join Room
          </h3>
          <p class="text-white-50">Enter the 6-character room code</p>
        </div>
        <div class="join-room-content">
          <div class="form-group mb-3">
            <label class="form-label text-white-50 mb-2">
              <i class="bi bi-key me-2"></i>Room Code
            </label>
            <input
              ref="joinRoomInput"
              v-model="joinRoomCode"
              type="text"
              class="form-control form-control-lg text-center"
              placeholder="ABCD12"
              maxlength="6"
              @keyup.enter="confirmJoinRoom"
              @input="joinRoomCode = joinRoomCode.toUpperCase()"
              style="text-transform: uppercase; letter-spacing: 4px; font-size: 1.5rem; font-weight: bold;"
            />
          </div>
          <div v-if="joinRoomError" class="alert alert-danger animate__animated animate__shakeX">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ joinRoomError }}
          </div>
        </div>
        <div class="join-room-actions d-flex gap-3 justify-content-center">
          <button @click="cancelJoinRoom" class="btn btn-outline-light btn-lg px-5">
            <i class="bi bi-x-circle me-2"></i>Cancel
          </button>
          <button @click="confirmJoinRoom" class="btn btn-warning btn-lg px-5">
            <i class="bi bi-box-arrow-in-right me-2"></i>Join
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'
import { useGameStore } from '../stores/gameStore.js'
import { isFirebaseConfigured } from '../config/firebase.js'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()
const gameStore = useGameStore()

const isLoading = ref(false)
const loadingMessage = ref('')
const showWelcomeModal = ref(false)
const showJoinRoomModal = ref(false)
const joinRoomCode = ref('')
const joinRoomError = ref('')
const joinRoomInput = ref(null)

watch(showJoinRoomModal, (newVal) => {
  if (newVal) {
    nextTick(() => {
      if (joinRoomInput.value) {
        joinRoomInput.value.focus()
        joinRoomInput.value.select()
      }
    })
  }
})

function startGame(mode) {
  if (mode === 'single') {
    showWelcomeModal.value = true
  } else if (mode === 'multiplayer') {
    router.push('/lobby')
  }
}

function confirmStartGame() {
  showWelcomeModal.value = false
  isLoading.value = true
  loadingMessage.value = 'Initializing game...'
  
  setTimeout(() => {
    gameStore.aiDifficulty = 'medium'
    gameStore.initializeGame('single')
    router.push('/game')
  }, 500)
}

function createRoom() {
  router.push('/lobby')
}

function joinRoom() {
  showJoinRoomModal.value = true
  joinRoomCode.value = ''
  joinRoomError.value = ''
}

async function confirmJoinRoom() {
  const code = joinRoomCode.value.trim().toUpperCase()
  if (!code || code.length !== 6) {
    joinRoomError.value = 'Please enter a valid 6-character room code'
    return
  }
  
  const validChars = /^[A-Z0-9]{6}$/
  if (!validChars.test(code)) {
    joinRoomError.value = 'Room code must contain only letters and numbers'
    return
  }
  
  try {
    const { roomService } = await import('../utils/roomService.js')
    const roomData = await roomService.getRoom(code)
    
    if (!roomData) {
      joinRoomError.value = 'Room not found. Please check the code and try again.'
      return
    }
    
    if (roomData.players && roomData.players.length >= 4) {
      joinRoomError.value = 'Room is full (4 players maximum)'
      return
    }
    
    showJoinRoomModal.value = false
    router.push(`/lobby/${code}`)
    joinRoomCode.value = ''
    joinRoomError.value = ''
  } catch (error) {
    joinRoomError.value = error.message || 'Failed to check room. Please try again.'
  }
}

function cancelJoinRoom() {
  showJoinRoomModal.value = false
  joinRoomCode.value = ''
  joinRoomError.value = ''
}

async function handleSignOut() {
  await authStore.signOut()
  router.push('/')
}
</script>

<style scoped>
@import '../assets/styles/views/shared-pages.css';

.menu-page {
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #0d1b2a 100%);
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
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

.card-pattern-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 215, 0, 0.02) 2px, rgba(255, 215, 0, 0.02) 4px),
    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255, 215, 0, 0.02) 2px, rgba(255, 215, 0, 0.02) 4px);
  opacity: 0.3;
}

.card-back-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(255, 215, 0, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 215, 0, 0.05) 0%, transparent 50%);
  background-size: 300px 300px;
  animation: patternMove 40s linear infinite;
}

@keyframes patternMove {
  0% {
    background-position: 0% 0%, 100% 100%;
  }
  100% {
    background-position: 100% 100%, 0% 0%;
  }
}

.floating-cards {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.floating-card {
  position: absolute;
  font-size: 6rem;
  font-weight: bold;
  opacity: 0.1;
  animation: cardFloat 30s infinite ease-in-out;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
  filter: blur(2px);
}

.floating-card.card-1 {
  top: 10%;
  left: 5%;
  color: #000;
  animation-delay: 0s;
}

.floating-card.card-2 {
  top: 20%;
  right: 10%;
  color: #dc3545;
  animation-delay: 3s;
}

.floating-card.card-3 {
  top: 50%;
  left: 8%;
  color: #dc3545;
  animation-delay: 6s;
}

.floating-card.card-4 {
  top: 60%;
  right: 15%;
  color: #000;
  animation-delay: 9s;
}

.floating-card.card-5 {
  bottom: 15%;
  left: 12%;
  color: #000;
  animation-delay: 12s;
}

.floating-card.card-6 {
  bottom: 25%;
  right: 8%;
  color: #dc3545;
  animation-delay: 15s;
}

.floating-card.card-7 {
  top: 35%;
  left: 50%;
  color: #dc3545;
  animation-delay: 18s;
}

.floating-card.card-8 {
  bottom: 40%;
  right: 50%;
  color: #000;
  animation-delay: 21s;
}

@keyframes cardFloat {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg) scale(1);
    opacity: 0.15;
  }
  25% {
    transform: translate(30px, -40px) rotate(15deg) scale(1.1);
    opacity: 0.2;
  }
  50% {
    transform: translate(-20px, -60px) rotate(-10deg) scale(0.9);
    opacity: 0.1;
  }
  75% {
    transform: translate(-30px, 30px) rotate(20deg) scale(1.05);
    opacity: 0.18;
  }
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.06) 0%, transparent 50%);
  animation: overlayPulse 12s ease-in-out infinite;
}

@keyframes overlayPulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
}

.menu-container {
  width: 100%;
  max-width: 1200px;
  z-index: 1;
}

.menu-header {
  text-align: center;
  margin-bottom: 50px;
  padding: 0 20px;
}

.menu-title {
  font-size: 4.5rem;
  font-weight: 800;
  color: #ffd700;
  text-shadow: 
    0 0 30px rgba(255, 215, 0, 0.6),
    0 0 60px rgba(255, 215, 0, 0.4),
    2px 2px 8px rgba(0, 0, 0, 0.8);
  letter-spacing: 6px;
  margin: 0 0 30px 0;
  line-height: 1.1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.menu-title i {
  font-size: 4rem;
  color: #ffd700;
  filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8));
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.9;
  }
}

.menu-user-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(13, 110, 253, 0.2);
  border: 1px solid rgba(13, 110, 253, 0.4);
  border-radius: 25px;
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
}

.user-badge i {
  font-size: 1.2rem;
  color: #0d6efd;
}

.menu-actions {
  display: flex;
  gap: 10px;
}

.game-modes {
  margin-bottom: 40px;
}

.mode-card {
  padding: 50px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  border: 2px solid rgba(255, 215, 0, 0.3);
  background: rgba(13, 27, 42, 0.6);
}

.mode-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.mode-card:hover::before {
  left: 100%;
}

.mode-card:hover:not(.disabled) {
  transform: translateY(-15px) scale(1.05);
  box-shadow: 0 20px 60px rgba(255, 215, 0, 0.4),
              0 0 40px rgba(255, 215, 0, 0.2),
              inset 0 0 30px rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.8);
  background: rgba(13, 27, 42, 0.8);
}

.mode-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mode-icon-wrapper {
  position: relative;
  display: inline-block;
}

.mode-icon {
  font-size: 5rem;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
}

.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.5), transparent);
  border-radius: 50%;
  animation: iconPulse 2s ease-in-out infinite;
  z-index: 1;
}

@keyframes iconPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.3;
  }
}

.mode-card h3 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.mode-card p {
  color: rgba(255, 255, 255, 0.9) !important;
  margin-bottom: 0;
  font-size: 1.1rem;
  font-weight: 400;
}

.mode-notice {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 10px;
  font-size: 0.875rem;
}

.card-hover-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.mode-card:hover .card-hover-effect {
  opacity: 1;
}

.menu-footer {
  z-index: 1;
}

.welcome-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.welcome-modal {
  max-width: 500px;
  width: 90%;
  padding: 40px;
  border-radius: 20px;
  background: rgba(13, 27, 42, 0.95);
  border: 2px solid rgba(255, 215, 0, 0.5);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
              0 0 40px rgba(255, 215, 0, 0.3);
}

.welcome-header {
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
}

.welcome-icon {
  display: inline-block;
  animation: iconSpin 2s ease-in-out infinite;
}

@keyframes iconSpin {
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
}

.welcome-content {
  padding: 20px 0;
}

.welcome-info-card {
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-left: 3px solid rgba(255, 215, 0, 0.5);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.welcome-info-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-left-color: rgba(255, 215, 0, 0.8);
  transform: translateX(5px);
}

.welcome-info-card i {
  font-size: 1.5rem;
}

.welcome-actions {
  padding-top: 20px;
  border-top: 1px solid rgba(255, 215, 0, 0.3);
}

@media (max-width: 768px) {
  .menu-title {
    font-size: 2.5rem;
    letter-spacing: 3px;
    gap: 15px;
  }
  
  .menu-title i {
    font-size: 2.2rem;
  }
  
  .mode-card {
    padding: 30px 20px;
  }
  
  .mode-icon {
    font-size: 4rem;
  }
  
  .floating-card {
    font-size: 3rem;
  }
  
  .menu-user-info {
    flex-direction: column;
    gap: 15px;
  }
}

.join-room-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.4s ease;
}

.join-room-modal {
  max-width: 450px;
  width: 90%;
  padding: 40px;
  border-radius: 25px;
  background: linear-gradient(135deg, rgba(13, 27, 42, 0.98) 0%, rgba(26, 38, 59, 0.98) 100%);
  border: 3px solid rgba(255, 215, 0, 0.6);
  box-shadow: 
    0 25px 70px rgba(0, 0, 0, 0.7),
    0 0 60px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.join-room-modal::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
  animation: rotate 10s linear infinite;
}

.room-icon-wrapper {
  display: inline-block;
  animation: iconBounce 2s ease-in-out infinite;
}

@keyframes iconBounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.1);
  }
}

.join-room-header h3 {
  font-size: 2rem;
  font-weight: 800;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  letter-spacing: 1px;
}

.join-room-content .form-control {
  background: rgba(255, 255, 255, 0.15) !important;
  border: 2px solid rgba(255, 215, 0, 0.4) !important;
  color: #ffd700 !important;
  border-radius: 12px;
  transition: all 0.3s ease;
  pointer-events: auto !important;
  z-index: 10;
  position: relative;
}

.join-room-content .form-control:focus {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 215, 0, 0.8) !important;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.4) !important;
  outline: none !important;
  color: #ffd700 !important;
}

.join-room-content .form-control::placeholder {
  color: rgba(255, 215, 0, 0.5) !important;
}

.join-room-actions {
  padding-top: 20px;
  border-top: 2px solid rgba(255, 215, 0, 0.3);
  position: relative;
  z-index: 1;
}

.join-room-actions .btn {
  min-width: 120px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.join-room-actions .btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.join-room-actions .btn-warning:hover {
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.5);
}

@media (max-width: 768px) {
  .join-room-modal {
    padding: 30px 20px;
    max-width: 90%;
  }
  
  .join-room-header h3 {
    font-size: 1.5rem;
  }
  
  .join-room-actions {
    flex-direction: column;
  }
  
  .join-room-actions .btn {
    width: 100%;
  }
}
</style>
