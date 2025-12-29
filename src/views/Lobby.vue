<template>
  <div class="lobby-page">
    <LoadingSpinner 
      :show="creatingRoom || joiningRoom || startingGame" 
      :message="loadingMessage"
      :fullscreen="true"
    />
    
    <div class="lobby-wrapper">
      <div class="lobby-header glass-panel animate__animated animate__fadeInDown">
        <div class="lobby-header-content">
          <div class="lobby-title-section">
            <div class="lobby-icon">
              <i class="bi bi-door-open"></i>
            </div>
            <h2 class="lobby-title">Game Lobby</h2>
          </div>
          <button @click="leaveLobby" class="leave-lobby-btn animate__animated animate__fadeInRight">
            <i class="bi bi-box-arrow-right me-2"></i>Leave Lobby
          </button>
        </div>
      </div>
      
      <div class="lobby-content">
        <div v-if="!roomCode" class="lobby-options">
          <div class="option-card glass-panel animate__animated animate__fadeInLeft" @click="createRoom">
            <div class="option-icon-wrapper">
              <div class="option-icon animate__animated animate__bounce">
                <i class="bi bi-plus-circle-fill"></i>
              </div>
              <div class="icon-glow"></div>
            </div>
            <h3 class="option-title">
              <i class="bi bi-plus-circle me-2"></i>Create Room
            </h3>
            <p class="option-description">Start a new game room</p>
          </div>
          
          <div class="option-card glass-panel animate__animated animate__fadeInRight" @click="showJoinDialog = true">
            <div class="option-icon-wrapper">
              <div class="option-icon animate__animated animate__pulse">
                <i class="bi bi-link-45deg"></i>
              </div>
              <div class="icon-glow"></div>
            </div>
            <h3 class="option-title">
              <i class="bi bi-link-45deg me-2"></i>Join Room
            </h3>
            <p class="option-description">Enter a room code to join</p>
          </div>
        </div>
      
      <div v-else class="lobby-room animate__animated animate__fadeIn">
        <div class="room-code glass-panel mb-4 animate__animated animate__zoomIn">
          <div class="room-code-header text-center mb-4">
            <div class="share-icon-wrapper mb-3">
              <i class="bi bi-share-fill text-warning" style="font-size: 3rem;"></i>
            </div>
            <h4 class="text-warning mb-2 animate__animated animate__pulse">
              Share this code with friends
            </h4>
          </div>
          <div class="code-display-wrapper mb-4">
            <div class="code-display animate__animated animate__pulse">
              {{ roomCode }}
            </div>
          </div>
          <div class="room-code-actions d-flex flex-column gap-3 align-items-center mb-4">
            <button @click="copyCode" class="btn btn-warning btn-lg px-5 animate__animated animate__pulse">
              <i class="bi" :class="copied ? 'bi-check-circle-fill' : 'bi-clipboard-fill'"></i>
              <span class="ms-2">{{ copied ? 'Copied!' : 'Copy Code' }}</span>
            </button>
          </div>
          <div class="room-url mt-4 pt-4 border-top border-warning" v-if="roomUrl">
            <div class="text-center mb-3">
              <small class="text-white-50 d-block mb-2">
                <i class="bi bi-link-45deg me-2"></i>Or share this link:
              </small>
            </div>
            <div class="url-display-wrapper mb-3">
              <div class="url-display">{{ roomUrl }}</div>
            </div>
            <div class="text-center">
              <button @click="copyUrl" class="btn btn-outline-warning btn-sm">
                <i class="bi bi-clipboard me-2"></i>Copy Link
              </button>
            </div>
          </div>
        </div>
        
        <div class="players-list mb-4" style="width: 100%;">
          <h3 class="mb-4 animate__animated animate__fadeInDown">
            <i class="bi bi-people-fill me-2"></i>Players ({{ players.length }}/4)
          </h3>
          <div class="players-grid">
            <div
              v-for="(player, index) in players"
              :key="player.id || index"
            >
              <div class="player-slot glass-panel animate__animated animate__fadeInUp" :style="`animation-delay: ${index * 0.1}s`">
                <div class="player-content text-center">
                  <div class="player-avatar mx-auto mb-3 animate__animated animate__bounce">{{ getPlayerInitial(player.name) }}</div>
                  <div class="player-name fw-bold mb-2">{{ player.name }}</div>
                  <div v-if="player.isHost || player.id === hostId" class="host-badge badge bg-primary">
                    <i class="bi bi-star-fill me-1"></i>Host
                  </div>
                </div>
              </div>
            </div>
            <div
              v-for="i in (4 - players.length)"
              :key="`empty-${i}`"
            >
              <div class="player-slot empty glass-panel animate__animated animate__fadeIn">
                <div class="player-content text-center d-flex align-items-center justify-content-center">
                  <div class="empty-slot text-muted">
                    <i class="bi bi-hourglass-split d-block fs-1 mb-2"></i>
                    Waiting for player...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="lobby-actions text-center" style="width: 100%;">
          <button
            @click="startGame"
            class="btn btn-primary btn-lg px-5 mb-3 animate__animated animate__pulse"
            :disabled="players.length < 4 || !isHost"
          >
            <i class="bi bi-play-circle-fill me-2"></i>Start Game
          </button>
          <div v-if="players.length < 4" class="waiting-message alert alert-info animate__animated animate__fadeIn">
            <i class="bi bi-hourglass-split me-2"></i>
            Waiting for {{ 4 - players.length }} more player{{ 4 - players.length > 1 ? 's' : '' }}...
          </div>
        </div>
      </div>
      </div>
      
    <!-- Notification Modal -->
    <div v-if="showNotification" class="notification-modal-overlay" @click.self="closeNotification">
      <div class="notification-modal glass-panel animate__animated animate__zoomIn" :class="`notification-${notificationType}`">
        <div class="notification-header text-center mb-4">
          <div class="notification-icon-wrapper mb-3">
            <i v-if="notificationType === 'error'" class="bi bi-exclamation-triangle-fill text-danger" style="font-size: 4rem;"></i>
            <i v-else-if="notificationType === 'warning'" class="bi bi-exclamation-circle-fill text-warning" style="font-size: 4rem;"></i>
            <i v-else-if="notificationType === 'success'" class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
            <i v-else class="bi bi-info-circle-fill text-info" style="font-size: 4rem;"></i>
          </div>
          <p class="notification-message text-white fs-5 mb-0">{{ notificationMessage }}</p>
        </div>
        <div class="notification-actions d-flex justify-content-center">
          <button @click="closeNotification" class="btn btn-primary btn-lg px-5">
            <i class="bi bi-check-circle me-2"></i>OK
          </button>
        </div>
      </div>
    </div>

      <div v-if="showJoinDialog" class="modal-overlay d-flex align-items-center justify-content-center" @click.self="showJoinDialog = false">
        <div class="modal-content glass-panel animate__animated animate__zoomIn">
          <h3 class="mb-4">
            <i class="bi bi-link-45deg me-2 text-warning"></i>Join Room
          </h3>
          <div class="form-group mb-3">
            <label class="form-label">
              <i class="bi bi-key me-2"></i>Enter Room Code
            </label>
            <input
              v-model="joinCode"
              type="text"
              class="form-control form-control-lg text-center"
              placeholder="ABCD12"
              maxlength="6"
              @keyup.enter="handleJoinRoom"
              style="text-transform: uppercase; letter-spacing: 4px;"
            />
          </div>
          <div v-if="joinError" class="alert alert-danger animate__animated animate__shakeX">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ joinError }}
          </div>
          <div class="modal-actions d-flex gap-2 justify-content-end">
            <button @click="showJoinDialog = false" class="btn btn-outline-secondary">
              <i class="bi bi-x-circle me-2"></i>Cancel
            </button>
            <button @click="handleJoinRoom" class="btn btn-primary">
              <i class="bi bi-box-arrow-in-right me-2"></i>Join
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore.js'
import { useAuthStore } from '../stores/authStore.js'
import { roomService } from '../utils/roomService.js'
import { getPlayerInitial } from '../utils/profileIcons.js'
import LoadingSpinner from '../components/LoadingSpinner.vue'

function getBaseUrl() {
  const envUrl = import.meta.env.VITE_APP_URL
  if (envUrl) {
    return envUrl
  }
  return window.location.origin
}

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const authStore = useAuthStore()

const roomCode = ref(route.params.roomCode || null)
const players = ref([])
const isHost = ref(false)
const hostId = ref(null)
const showJoinDialog = ref(false)
const joinCode = ref('')
const joinError = ref('')
const copied = ref(false)
const unsubscribeRoom = ref(null)
const creatingRoom = ref(false)
const joiningRoom = ref(false)
const startingGame = ref(false)
const loadingMessage = ref('')
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('info')

const roomUrl = computed(() => {
  if (!roomCode.value) return null
  const baseUrl = getBaseUrl()
  const path = `/lobby/${roomCode.value}`
  return `${baseUrl}${path}`
})

onMounted(async () => {
  if (roomCode.value) {
    await joinRoom(roomCode.value)
  }
})

async function createRoom() {
  if (creatingRoom.value) {
    return
  }
  
  creatingRoom.value = true
  loadingMessage.value = 'Creating room...'
  
  const timeoutId = setTimeout(() => {
    if (creatingRoom.value) {
      creatingRoom.value = false
      showNotificationModal('Room creation is taking too long. Please try again.', 'warning')
    }
  }, 10000)
  
  try {
    if (!authStore.user) {
      authStore.setGuestUser()
      gameStore.currentUser = authStore.user
    }

    const playerId = authStore.user?.uid || `guest-${Date.now()}`
    const hostPlayer = {
      id: playerId,
      name: authStore.user?.displayName || `Guest ${playerId.slice(-4)}`,
      isHost: true
    }
    
    const createPromise = roomService.createRoom(hostPlayer)
    const result = await Promise.race([
      createPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Room creation timeout')), 8000)
      )
    ])
    
    clearTimeout(timeoutId)
    
    if (!result || !result.roomCode) {
      throw new Error('Room creation failed - no room code returned')
    }

    const code = result.roomCode
    
    roomCode.value = code
    gameStore.roomCode = code
    isHost.value = true
    hostId.value = playerId
    players.value = [{
      ...hostPlayer,
      isHost: true
    }]

    await nextTick()
    
    subscribeToRoomUpdates(code)
  } catch (error) {
    clearTimeout(timeoutId)
    showNotificationModal(`Failed to create room: ${error.message || 'Unknown error'}. Please try again.`, 'error')
  } finally {
    creatingRoom.value = false
  }
}

async function joinRoom(code) {
  joiningRoom.value = true
  loadingMessage.value = 'Joining room...'
  
  try {
    if (!authStore.user) {
      authStore.setGuestUser()
      gameStore.currentUser = authStore.user
    }

    const playerId = authStore.user?.uid || `guest-${Date.now()}`
    const player = {
      id: playerId,
      name: authStore.user?.displayName || `Guest ${playerId.slice(-4)}`,
      isHost: false
    }

    const roomData = await roomService.joinRoom(code, player)
    
    if (!roomData) {
      throw new Error('Room not found')
    }

    roomCode.value = code
    gameStore.roomCode = code
    hostId.value = roomData.hostId
    isHost.value = playerId === roomData.hostId
    players.value = roomData.players.map(p => ({
      ...p,
      isHost: p.id === roomData.hostId
    }))

    subscribeToRoomUpdates(code)
    showJoinDialog.value = false
    joinError.value = ''
  } catch (error) {
    joinError.value = error.message || 'Failed to join room'
  } finally {
    joiningRoom.value = false
    loadingMessage.value = ''
  }
}

async function handleJoinRoom() {
  const code = joinCode.value.trim().toUpperCase()
  if (!code || code.length !== 6) {
    joinError.value = 'Please enter a valid 6-character room code'
    return
  }
  
  const validChars = /^[A-Z0-9]{6}$/
  if (!validChars.test(code)) {
    joinError.value = 'Room code must contain only letters and numbers'
    return
  }
  joiningRoom.value = true
  loadingMessage.value = 'Checking room...'
  try {
    const roomData = await roomService.getRoom(code)
    if (!roomData) {
      joinError.value = 'Room not found. Please check the code and try again.'
      joiningRoom.value = false
      loadingMessage.value = ''
      return
    }
    
    if (roomData.players && roomData.players.length >= 4) {
      joinError.value = 'Room is full (4 players maximum)'
      joiningRoom.value = false
      loadingMessage.value = ''
      return
    }
    
    await joinRoom(code)
  } catch (error) {
    joinError.value = error.message || 'Failed to check room. Please try again.'
    joiningRoom.value = false
    loadingMessage.value = ''
  }
}

function subscribeToRoomUpdates(code) {
  if (unsubscribeRoom.value) {
    roomService.unsubscribeFromRoom(code)
  }

  unsubscribeRoom.value = roomService.subscribeToRoom(code, (roomData) => {
    if (!roomData) {
      showNotificationModal('Room was closed', 'warning')
      leaveLobby()
      return
    }

    hostId.value = roomData.hostId
    const currentPlayerId = authStore.user?.uid || players.value.find(p => !p.isAI)?.id
    
    if (currentPlayerId) {
      isHost.value = currentPlayerId === roomData.hostId
    }

    players.value = roomData.players.map(p => ({
      ...p,
      isHost: p.id === roomData.hostId
    }))

    if (roomData.status === 'playing' && roomData.gameState) {
      gameStore.initializeGame('multiplayer')
      router.push('/game')
    }
  })
}


async function copyCode() {
  try {
    await navigator.clipboard.writeText(roomCode.value)
    copied.value = true
    showNotificationModal('Room code copied to clipboard!', 'success')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    showNotificationModal('Failed to copy code', 'error')
  }
}

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(roomUrl.value)
    showNotificationModal('Link copied to clipboard!', 'success')
  } catch (error) {
    showNotificationModal('Failed to copy link', 'error')
  }
}

async function startGame() {
  if (players.value.length !== 4 || !isHost.value) {
    if (players.value.length < 4) {
      showNotificationModal(`Need 4 players to start. Currently ${players.value.length}/4 players.`, 'warning')
    } else if (!isHost.value) {
      showNotificationModal('Only the host can start the game.', 'warning')
    }
    return
  }

  try {
    startingGame.value = true
    loadingMessage.value = 'Starting game...'
    
    gameStore.players = players.value.map(p => ({
      ...p,
      hand: []
    }))
    await roomService.updateRoomStatus(roomCode.value, 'playing')
    
    setTimeout(() => {
      gameStore.initializeGame('multiplayer')
      router.push('/game')
    }, 500)
  } catch (error) {
    startingGame.value = false
    loadingMessage.value = ''
    showNotificationModal(`Failed to start game: ${error.message || 'Unknown error'}`, 'error')
  }
}

function showNotificationModal(message, type = 'info') {
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true
}

function closeNotification() {
  showNotification.value = false
  notificationMessage.value = ''
}

async function leaveLobby() {
  if (roomCode.value) {
    const playerId = authStore.user?.uid || players.value.find(p => !p.isAI)?.id
    if (playerId) {
      await roomService.leaveRoom(roomCode.value, playerId)
    }
    if (unsubscribeRoom.value) {
      roomService.unsubscribeFromRoom(roomCode.value)
    }
  }
  
  roomCode.value = null
  players.value = []
  isHost.value = false
  hostId.value = null
  gameStore.roomCode = null
  router.push('/')
}

onUnmounted(async () => {
  if (unsubscribeRoom.value && roomCode.value) {
    roomService.unsubscribeFromRoom(roomCode.value)
  }
})
</script>

<style scoped>
@import '../assets/styles/views/shared-pages.css';

.lobby-page {
  min-height: 100vh;
  padding: 20px;
  position: relative;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
}

.lobby-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.lobby-page::before {
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

.lobby-header {
  padding: 18px 28px;
  margin-bottom: 24px;
  background: rgba(15, 20, 40, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.15);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  position: relative;
  z-index: 1;
}

.lobby-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.lobby-title-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.lobby-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%);
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 12px;
  color: #ffd700;
  font-size: 24px;
}

.lobby-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  text-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
}

.leave-lobby-btn {
  padding: 12px 24px;
  background: rgba(231, 76, 60, 0.2);
  border: 2px solid rgba(231, 76, 60, 0.6);
  border-radius: 12px;
  color: #ffb3b3;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.leave-lobby-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.leave-lobby-btn:hover {
  background: rgba(231, 76, 60, 0.3);
  border-color: rgba(231, 76, 60, 0.8);
  box-shadow: 
    0 6px 20px rgba(231, 76, 60, 0.4),
    0 0 30px rgba(231, 76, 60, 0.2);
  transform: translateY(-2px) scale(1.05);
}

.leave-lobby-btn:active {
  transform: translateY(0) scale(1);
}

.leave-lobby-btn:active::before {
  width: 300px;
  height: 300px;
}

.lobby-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  width: 100%;
}

.option-card {
  padding: 50px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.option-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
}

.option-icon {
  font-size: 64px;
  color: var(--accent-gold);
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
}

.option-icon-wrapper .icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.5), transparent);
  border-radius: 50%;
  animation: iconGlowPulse 2s ease-in-out infinite;
  z-index: 1;
}

@keyframes iconGlowPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.3;
  }
}

.option-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.option-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin: 0;
}

.option-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.option-card:hover::before {
  left: 100%;
}

.option-card:hover {
  transform: translateY(-15px) scale(1.05);
  box-shadow: 
    0 20px 60px rgba(255, 215, 0, 0.4),
    0 0 40px rgba(255, 215, 0, 0.2),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.8);
}

.option-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.option-card h3 {
  font-size: 24px;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.option-card p {
  color: var(--text-secondary);
  font-size: 16px;
}

.room-code {
  padding: 40px 30px;
  text-align: center;
  margin-bottom: 30px;
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(13, 27, 42, 0.95) 0%, rgba(26, 38, 59, 0.95) 100%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
              0 0 20px rgba(255, 215, 0, 0.2);
}

.room-code-header {
  margin-bottom: 30px;
}

.share-icon-wrapper {
  display: inline-block;
  padding: 20px;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 50%;
  border: 2px solid rgba(255, 215, 0, 0.3);
}

.room-code-header h4 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.code-display-wrapper {
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  border: 2px solid rgba(255, 215, 0, 0.4);
  box-shadow: inset 0 0 20px rgba(255, 215, 0, 0.1),
              0 0 30px rgba(255, 215, 0, 0.2);
}

.code-display {
  font-size: 3.5rem;
  font-weight: 900;
  letter-spacing: 12px;
  color: #ffd700;
  font-family: 'Courier New', monospace;
  user-select: all;
  text-shadow: 
    0 0 20px rgba(255, 215, 0, 0.8),
    0 0 40px rgba(255, 215, 0, 0.4),
    0 0 60px rgba(255, 215, 0, 0.2);
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: codeShimmer 3s linear infinite;
  position: relative;
}

@keyframes codeShimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.room-code-actions {
  margin-top: 20px;
}

.room-url {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid rgba(255, 215, 0, 0.3);
}

.url-display-wrapper {
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.url-display {
  background: transparent;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.9rem;
  word-break: break-all;
  color: rgba(255, 255, 255, 0.9) !important;
  font-family: 'Courier New', monospace;
  line-height: 1.6;
}

.waiting-message {
  margin-top: 16px;
  color: rgba(255, 255, 255, 0.9) !important;
  font-size: 14px;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  padding: 40px;
  min-width: 400px;
  max-width: 90%;
}

.modal-content h3 {
  margin-bottom: 24px;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary) !important;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 18px;
  text-align: center;
  letter-spacing: 4px;
}

.form-control:focus {
  outline: none;
  border-color: var(--accent-gold);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.2);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.players-list h3 {
  margin-bottom: 20px;
  font-size: 24px;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  width: 100%;
}

.lobby-room {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.player-slot {
  padding: 24px;
  text-align: center;
  position: relative;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  width: 100%;
}

.player-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.player-slot:not(.empty):hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 
    0 12px 40px rgba(212, 175, 55, 0.3),
    0 0 30px rgba(212, 175, 55, 0.2);
  border-color: rgba(255, 215, 0, 0.5);
}

.player-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-gold) 0%, #b8941f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 12px;
  box-shadow: 
    0 4px 15px rgba(212, 175, 55, 0.4),
    0 0 20px rgba(212, 175, 55, 0.2);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.player-avatar::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(255, 255, 255, 0.3) 90deg,
    transparent 180deg,
    rgba(255, 255, 255, 0.3) 270deg,
    transparent 360deg
  );
  animation: avatarRotate 3s linear infinite;
}

@keyframes avatarRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.player-slot:hover .player-avatar {
  transform: scale(1.15) rotate(5deg);
  box-shadow: 
    0 6px 20px rgba(212, 175, 55, 0.6),
    0 0 30px rgba(212, 175, 55, 0.4);
}

.player-name {
  font-weight: 600;
  margin-bottom: 8px;
}

.host-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--accent-blue);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
}

.empty-slot {
  color: rgba(255, 255, 255, 0.7) !important;
  font-style: italic;
}

.lobby-actions {
  text-align: center;
}

@media (max-width: 768px) {
  .lobby-options {
    grid-template-columns: 1fr;
  }
  
  .players-grid {
    grid-template-columns: 1fr;
  }
  
  .code-display {
    font-size: 36px;
    letter-spacing: 4px;
  }
  
  .modal-content {
    min-width: 90%;
    padding: 30px 20px;
  }
}
</style>

