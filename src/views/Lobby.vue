<template>
  <div class="lobby-page">
    <LoadingSpinner 
      :show="creatingRoom || joiningRoom || startingGame" 
      :message="loadingMessage"
      :fullscreen="true"
    />
    
    <div class="lobby-container glass-panel">
      <div class="lobby-header">
        <h2>Game Lobby</h2>
        <button @click="leaveLobby" class="btn btn-secondary btn-sm">Leave</button>
      </div>
      
      <div v-if="!roomCode" class="lobby-options">
        <div class="option-card glass-panel" @click="createRoom">
          <div class="option-icon">➕</div>
          <h3>Create Room</h3>
          <p>Start a new game room</p>
        </div>
        
        <div class="option-card glass-panel" @click="showJoinDialog = true">
          <div class="option-icon">🔗</div>
          <h3>Join Room</h3>
          <p>Enter a room code to join</p>
        </div>
      </div>
      
      <div v-else class="lobby-room">
        <div class="room-code glass-panel">
          <label>Share this code with friends</label>
          <div class="code-display">{{ roomCode }}</div>
          <button @click="copyCode" class="btn btn-primary btn-sm">
            <span v-if="copied">✓ Copied!</span>
            <span v-else>Copy Code</span>
          </button>
          <div class="room-url" v-if="roomUrl">
            <small>Or share this link:</small>
            <div class="url-display">{{ roomUrl }}</div>
            <button @click="copyUrl" class="btn btn-secondary btn-sm">Copy Link</button>
          </div>
        </div>
        
        <div class="players-list">
          <h3>Players ({{ players.length }}/4)</h3>
          <div class="players-grid">
            <div
              v-for="(player, index) in players"
              :key="player.id || index"
              class="player-slot glass-panel"
            >
              <div class="player-avatar">{{ getPlayerInitial(player.name) }}</div>
              <div class="player-name">{{ player.name }}</div>
              <div v-if="player.isHost || player.id === hostId" class="host-badge">Host</div>
            </div>
            <div
              v-for="i in (4 - players.length)"
              :key="`empty-${i}`"
              class="player-slot empty glass-panel"
            >
              <div class="empty-slot">Waiting for player...</div>
            </div>
          </div>
        </div>
        
        <div class="lobby-actions">
          <button
            @click="startGame"
            class="btn btn-primary"
            :disabled="players.length < 4 || !isHost"
          >
            Start Game
          </button>
          <div v-if="players.length < 4" class="waiting-message">
            Waiting for {{ 4 - players.length }} more player{{ 4 - players.length > 1 ? 's' : '' }}...
          </div>
        </div>
      </div>
      
      <div v-if="showJoinDialog" class="modal-overlay" @click.self="showJoinDialog = false">
        <div class="modal-content glass-panel">
          <h3>Join Room</h3>
          <div class="form-group">
            <label>Enter Room Code</label>
            <input
              v-model="joinCode"
              type="text"
              class="form-control"
              placeholder="ABCD12"
              maxlength="6"
              @keyup.enter="handleJoinRoom"
              style="text-transform: uppercase;"
            />
          </div>
          <div v-if="joinError" class="alert alert-danger">{{ joinError }}</div>
          <div class="modal-actions">
            <button @click="handleJoinRoom" class="btn btn-primary">Join</button>
            <button @click="showJoinDialog = false" class="btn btn-secondary">Cancel</button>
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

const roomUrl = computed(() => {
  if (!roomCode.value) return null
  return `${window.location.origin}/lobby/${roomCode.value}`
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
      alert('Room creation is taking too long. Please try again.')
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
    alert(`Failed to create room: ${error.message || 'Unknown error'}. Please try again.`)
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
  await joinRoom(code)
}

function subscribeToRoomUpdates(code) {
  if (unsubscribeRoom.value) {
    roomService.unsubscribeFromRoom(code)
  }

  unsubscribeRoom.value = roomService.subscribeToRoom(code, (roomData) => {
    if (!roomData) {
      alert('Room was closed')
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
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    alert('Failed to copy code')
  }
}

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(roomUrl.value)
    alert('Link copied!')
  } catch (error) {
    alert('Failed to copy link')
  }
}

async function startGame() {
  if (players.value.length !== 4 || !isHost.value) {
    if (players.value.length < 4) {
      alert(`Need 4 players to start. Currently ${players.value.length}/4 players.`)
    } else if (!isHost.value) {
      alert('Only the host can start the game.')
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
    alert(`Failed to start game: ${error.message || 'Unknown error'}`)
  }
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
.lobby-page {
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lobby-container {
  width: 100%;
  max-width: 800px;
  padding: 40px;
}

.lobby-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.lobby-header h2 {
  font-size: 32px;
}

.lobby-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 30px;
}

.option-card {
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  border-color: var(--accent-gold);
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
  padding: 20px;
  text-align: center;
  margin-bottom: 30px;
}

.room-code label {
  display: block;
  margin-bottom: 12px;
  color: var(--text-secondary);
  font-size: 14px;
}

.code-display {
  font-size: 48px;
  font-weight: 700;
  letter-spacing: 8px;
  color: var(--accent-gold);
  margin-bottom: 16px;
  font-family: 'Courier New', monospace;
  user-select: all;
}

.room-url {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--glass-border);
}

.url-display {
  background: rgba(0, 0, 0, 0.2);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  word-break: break-all;
  margin: 8px 0;
  color: var(--text-secondary);
}

.waiting-message {
  margin-top: 16px;
  color: var(--text-secondary);
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
  color: var(--text-secondary);
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
  gap: 16px;
  margin-bottom: 30px;
}

.player-slot {
  padding: 20px;
  text-align: center;
  position: relative;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  color: var(--text-secondary);
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

