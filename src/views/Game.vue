<template>
  <div class="game-page">
    <LoadingSpinner 
      :show="isLoading" 
      :message="loadingMessage"
      :fullscreen="true"
    />
    
    <!-- Leave Game Confirmation Modal -->
    <div v-if="showLeaveConfirm" class="leave-confirm-overlay" @click.self="cancelLeave">
      <div class="leave-confirm-modal glass-panel animate__animated animate__zoomIn">
        <div class="leave-confirm-header text-center mb-4">
          <div class="card-icon-wrapper mb-3">
            <div class="floating-card-icon card-1">♠</div>
            <div class="floating-card-icon card-2">♥</div>
            <div class="floating-card-icon card-3">♦</div>
            <div class="floating-card-icon card-4">♣</div>
          </div>
          <h3 class="text-warning mt-3 mb-2 animate__animated animate__pulse">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>Leave Game?
          </h3>
          <p class="text-white-50 fs-5">Your game progress will be lost!</p>
          <div class="warning-message mt-3">
            <i class="bi bi-info-circle me-2"></i>
            <span>Are you sure you want to leave this game?</span>
          </div>
        </div>
        <div class="leave-confirm-actions d-flex gap-3 justify-content-center">
          <button @click="cancelLeave" class="btn btn-outline-light btn-lg px-5 animate__animated animate__fadeInLeft">
            <i class="bi bi-x-circle me-2"></i>Stay & Play
          </button>
          <button @click="confirmLeave" class="btn btn-danger btn-lg px-5 animate__animated animate__fadeInRight">
            <i class="bi bi-box-arrow-right me-2"></i>Leave Game
          </button>
        </div>
      </div>
    </div>

    <!-- Alert Modal -->
    <div v-if="showAlert" class="alert-modal-overlay" @click.self="closeAlert">
      <div class="alert-modal glass-panel animate__animated animate__zoomIn" :class="`alert-${alertType}`">
        <div class="alert-header text-center mb-4">
          <div class="alert-icon-wrapper mb-3">
            <i v-if="alertType === 'error'" class="bi bi-exclamation-triangle-fill text-danger" style="font-size: 4rem;"></i>
            <i v-else-if="alertType === 'warning'" class="bi bi-exclamation-circle-fill text-warning" style="font-size: 4rem;"></i>
            <i v-else-if="alertType === 'success'" class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
            <i v-else class="bi bi-info-circle-fill text-info" style="font-size: 4rem;"></i>
          </div>
          <p class="alert-message text-white fs-5 mb-0">{{ alertMessage }}</p>
        </div>
        <div class="alert-actions d-flex justify-content-center">
          <button @click="closeAlert" class="btn btn-primary btn-lg px-5">
            <i class="bi bi-check-circle me-2"></i>OK
          </button>
        </div>
      </div>
    </div>

    <!-- Countdown Overlay -->
    <div v-if="showCountdown" class="countdown-overlay">
      <div class="countdown-content">
        <div v-if="countdownNumber > 0" class="countdown-number animate__animated animate__zoomIn animate__faster">
          {{ countdownNumber }}
        </div>
        <div v-else class="countdown-start animate__animated animate__zoomIn animate__faster">
          <div class="start-text">Game Start!</div>
          <div class="start-icon">
            <i class="bi bi-play-circle-fill"></i>
          </div>
        </div>
      </div>
    </div>
    
     <div class="game-header">
       <div class="game-info">
         <div class="round-info">
           <div class="round-icon">
             <i class="bi bi-arrow-repeat"></i>
           </div>
           <div class="round-text">
             <span class="round-label">Round</span>
             <span class="round-number">{{ roundNumber }}</span>
           </div>
         </div>
         <div class="teams-info">
           <div class="team-info team-1">
             <div class="team-header">
               <i class="bi bi-people-fill"></i>
               <span class="team-name">Team 1</span>
             </div>
             <div class="team-stats">
               <div class="stat-item">
                 <i class="bi bi-10-circle"></i>
                 <span class="stat-value">{{ gameState.teamTens?.[0] || 0 }}/4</span>
                 <span class="stat-label">tens</span>
               </div>
               <div class="stat-divider"></div>
               <div class="stat-item">
                 <i class="bi bi-trophy"></i>
                 <span class="stat-value">{{ gameState.teamScores?.[0] || 0 }}</span>
                 <span class="stat-label">tricks</span>
               </div>
             </div>
           </div>
           <div class="team-info team-2">
             <div class="team-header">
               <i class="bi bi-people-fill"></i>
               <span class="team-name">Team 2</span>
             </div>
             <div class="team-stats">
               <div class="stat-item">
                 <i class="bi bi-10-circle"></i>
                 <span class="stat-value">{{ gameState.teamTens?.[1] || 0 }}/4</span>
                 <span class="stat-label">tens</span>
               </div>
               <div class="stat-divider"></div>
               <div class="stat-item">
                 <i class="bi bi-trophy"></i>
                 <span class="stat-value">{{ gameState.teamScores?.[1] || 0 }}</span>
                 <span class="stat-label">tricks</span>
               </div>
             </div>
           </div>
         </div>
        <div v-if="trumpSuit && trumpRevealed" class="trump-display">
          <div class="trump-icon">
            <i class="bi bi-star-fill"></i>
          </div>
          <div class="trump-content">
            <span class="trump-label">Trump</span>
            <span class="trump-suit" :class="`suit-${trumpSuit}`">{{ getSuitSymbol(trumpSuit) }}</span>
          </div>
        </div>
       </div>
       <button @click="leaveGame" class="leave-game-btn" :disabled="isProcessingAction">
         <i class="bi bi-box-arrow-right"></i>
         <span>Leave</span>
       </button>
     </div>
    
    <div class="game-board">
      <div class="game-board-grid"></div>
      <div class="trump-corner-indicator">
        <div v-if="trumpSuit && trumpRevealed" class="trump-indicator">
          <div class="trump-indicator-bg"></div>
          <div class="trump-indicator-content">
            <div class="trump-crown">
              <i class="bi bi-star-fill"></i>
            </div>
            <div class="trump-label-wrapper">
              <div class="trump-label">TRUMP</div>
              <div class="trump-suit" :class="`suit-${trumpSuit}`">
                <span class="suit-symbol">{{ getSuitSymbol(trumpSuit) }}</span>
                <div class="suit-glow"></div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="hiddenCard && !trumpRevealed" class="hidden-card-indicator">
          <div class="hidden-indicator-bg"></div>
          <div class="hidden-indicator-content">
            <div class="hidden-icon">
              <i class="bi bi-eye-slash-fill"></i>
            </div>
            <div class="hidden-label">HIDDEN</div>
            <div class="hidden-card-back">
              <div class="card-back-pattern"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mindi Logo in Center -->
      <div class="mindi-logo-center">
        <div class="mindi-logo animate__animated animate__pulse">
          <span class="mindi-text">MINDI</span>
          <span class="mindi-subtitle">ROYALE</span>
        </div>
      </div>

      <!-- Winner Celebration Effect -->
      <div v-if="trickWinner !== null && animatingToWinner" class="winner-celebration">
        <div class="celebration-particles">
          <div class="particle particle-1"></div>
          <div class="particle particle-2"></div>
          <div class="particle particle-3"></div>
          <div class="particle particle-4"></div>
          <div class="particle particle-5"></div>
          <div class="particle particle-6"></div>
          <div class="particle particle-7"></div>
          <div class="particle particle-8"></div>
        </div>
        <div class="winner-glow" :data-winner-position="getPlayerPosition(trickWinner)"></div>
      </div>

      <!-- Trick Cards in Center -->
      <div class="trick-cards-center">
        <TransitionGroup name="card-play" tag="div" class="trick-cards-container">
          <div
            v-for="(trickCard, index) in currentTrick"
            :key="`${trickCard.card.id}-${index}`"
            class="trick-card-wrapper animate__animated animate__zoomIn"
            :style="{ ...getTrickCardPosition(trickCard, index), ...getCardRotation(trickCard.playerIndex ?? index) }"
            :class="[
              `animate__delay-${index * 0.1}s`,
              { 'animating-to-winner': animatingToWinner && trickWinner !== null }
            ]"
            :data-winner-index="trickWinner"
          >
            <Card
              :card="trickCard.card"
              :is-trump="trickCard.card.suit === trumpSuit && trumpRevealed"
              class="played-card"
            />
          </div>
        </TransitionGroup>
      </div>
      
      <PlayerArea
        v-for="(player, index) in gameStore.players"
        :key="player.id"
        :player="player"
        :position="getPlayerPosition(index)"
        :is-current-turn="gameState.currentPlayerIndex === index"
        :is-winner="trickWinner === index && animatingToWinner"
        :tricks-won="getTricksWon(index)"
        :score="gameState.scores[index]"
        :show-actual-cards="player.id === currentPlayer?.id && (player.isHuman && !player.isAI)"
        :actual-cards="player.id === currentPlayer?.id && (player.isHuman && !player.isAI) && player.hand && player.hand.length > 0 ? sortCards(player.hand, trumpSuit) : []"
        :is-card-playable="player.id === currentPlayer?.id && (player.isHuman && !player.isAI) ? isCardPlayable : null"
        :handle-card-click="player.id === currentPlayer?.id && (player.isHuman && !player.isAI) ? handleCardClick : null"
        :is-disabled="!isMyTurn || gameState.gameState !== 'playing'"
        :trump-suit="trumpSuit"
        :trump-revealed="trumpRevealed"
      />
    </div>
    
    <div v-if="gameState.gameState === 'playing' && isMyTurn && hiddenCard && !trumpRevealed && currentTrick.length > 0 && currentPlayer && currentPlayer.hand && !currentPlayer.hand.some(c => c.suit === currentTrick[0]?.card?.suit)" 
         class="trump-reveal-prompt">
      <div class="trump-prompt-content">
        <div class="trump-prompt-icon">
          <div class="icon-glow"></div>
          <i class="bi bi-stars"></i>
        </div>
        <h3 class="trump-prompt-title">Reveal Hidden Trump</h3>
        <p class="trump-prompt-text">You must reveal your hidden trump card to continue playing.</p>
        <button @click="revealTrumpCard" class="trump-reveal-btn" :disabled="isProcessingAction">
          <span v-if="!isProcessingAction">
            <i class="bi bi-eye-fill"></i>
            <span>Reveal Card</span>
          </span>
          <span v-else class="revealing-state">
            <div class="reveal-spinner"></div>
            <span>Revealing...</span>
          </span>
        </button>
      </div>
    </div>
    
    <div v-if="gameState.gameState === 'selecting_trump' && isMyTurn" class="trump-selection glass-panel modal-dialog modal-dialog-centered animate__animated animate__zoomIn">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h3 class="modal-title text-center w-100">
            <i class="bi bi-star-fill text-warning me-2"></i>Select Trump Suit
          </h3>
        </div>
        <div class="modal-body">
          <div class="row g-3">
            <div v-for="suit in ['hearts', 'diamonds', 'clubs', 'spades']" :key="suit" class="col-6">
              <button
                @click="selectTrump(suit)"
                class="btn btn-outline-primary suit-btn w-100 h-100 p-4 animate__animated animate__fadeInUp"
                :class="`suit-${suit}`"
                style="min-height: 100px; transition: all 0.3s ease;"
                @mouseenter="$event.target.classList.add('btn-primary', 'scale-up')"
                @mouseleave="$event.target.classList.remove('btn-primary', 'scale-up')"
              >
                <div class="d-flex flex-column align-items-center">
                  <span class="fs-1 mb-2">
                    <span v-if="suit === 'hearts'">♥</span>
                    <span v-else-if="suit === 'diamonds'">♦</span>
                    <span v-else-if="suit === 'spades'">♠</span>
                    <span v-else-if="suit === 'clubs'">♣</span>
                  </span>
                  <span class="text-capitalize fw-bold">{{ suit }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    
    <div v-if="gameState.gameState === 'mendikot'" class="round-summary glass-panel mendikot-win modal-dialog modal-dialog-centered animate__animated animate__zoomIn">
      <div class="modal-content">
        <div class="modal-header border-0 bg-warning text-dark">
          <h2 class="modal-title w-100 text-center animate__animated animate__bounce">
            <i class="bi bi-trophy-fill me-2"></i>🎉 MENDIKOT! 🎉
          </h2>
        </div>
        <div class="modal-body text-center">
          <h3 class="text-warning mb-4 animate__animated animate__fadeInUp">
            <i class="bi bi-people-fill me-2"></i>Team {{ gameState.winnerTeam === 0 ? '1' : '2' }} captured all 4 tens!
          </h3>
          <div class="scores-list">
            <div class="row g-3 mb-4">
              <div class="col-6">
                <div class="team-score card border-info h-100 animate__animated animate__fadeInLeft">
                  <div class="card-body">
                    <h4 class="card-title text-info">
                      <i class="bi bi-people-fill me-2"></i>Team 1
                    </h4>
                    <div class="team-stats d-flex flex-column gap-2">
                      <span class="badge bg-info fs-6">{{ gameState.teamTens?.[0] || 0 }}/4 tens</span>
                      <span class="badge bg-primary fs-6">{{ gameState.teamScores?.[0] || 0 }} tricks</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="team-score card border-danger h-100 animate__animated animate__fadeInRight">
                  <div class="card-body">
                    <h4 class="card-title text-danger">
                      <i class="bi bi-people-fill me-2"></i>Team 2
                    </h4>
                    <div class="team-stats d-flex flex-column gap-2">
                      <span class="badge bg-danger fs-6">{{ gameState.teamTens?.[1] || 0 }}/4 tens</span>
                      <span class="badge bg-primary fs-6">{{ gameState.teamScores?.[1] || 0 }} tricks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0 justify-content-center">
          <button @click="startNextRound" class="btn btn-warning btn-lg px-5 animate__animated animate__pulse">
            <i class="bi bi-arrow-clockwise me-2"></i>New Round
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="gameState.gameState === 'whitewash'" class="round-summary glass-panel whitewash-win modal-dialog modal-dialog-centered animate__animated animate__zoomIn">
      <div class="modal-content">
        <div class="modal-header border-0 bg-primary text-white">
          <h2 class="modal-title w-100 text-center animate__animated animate__bounce">
            <i class="bi bi-star-fill me-2"></i>🏆 52-CARD MENDIKOT! 🏆
          </h2>
        </div>
        <div class="modal-body text-center">
          <h3 class="text-primary mb-4 animate__animated animate__fadeInUp">
            <i class="bi bi-trophy-fill me-2"></i>Team {{ gameState.winnerTeam === 0 ? '1' : '2' }} won all 13 tricks!
          </h3>
          <div class="scores-list">
            <div class="row g-3 mb-4">
              <div class="col-6">
                <div class="team-score card border-info h-100 animate__animated animate__fadeInLeft">
                  <div class="card-body">
                    <h4 class="card-title text-info">
                      <i class="bi bi-people-fill me-2"></i>Team 1
                    </h4>
                    <div class="team-stats d-flex flex-column gap-2">
                      <span class="badge bg-info fs-6">{{ gameState.teamTens?.[0] || 0 }}/4 tens</span>
                      <span class="badge bg-primary fs-6">{{ gameState.teamScores?.[0] || 0 }} tricks</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="team-score card border-danger h-100 animate__animated animate__fadeInRight">
                  <div class="card-body">
                    <h4 class="card-title text-danger">
                      <i class="bi bi-people-fill me-2"></i>Team 2
                    </h4>
                    <div class="team-stats d-flex flex-column gap-2">
                      <span class="badge bg-danger fs-6">{{ gameState.teamTens?.[1] || 0 }}/4 tens</span>
                      <span class="badge bg-primary fs-6">{{ gameState.teamScores?.[1] || 0 }} tricks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0 justify-content-center">
          <button @click="startNextRound" class="btn btn-primary btn-lg px-5 animate__animated animate__pulse">
            <i class="bi bi-arrow-clockwise me-2"></i>New Round
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="gameState.gameState === 'round_complete'" class="round-summary glass-panel modal-dialog modal-dialog-centered animate__animated animate__zoomIn">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h3 class="modal-title w-100 text-center">
            <i class="bi bi-check-circle-fill text-success me-2"></i>Round Complete!
          </h3>
        </div>
        <div class="modal-body">
          <div v-if="gameState.roundWinner !== undefined" class="round-winner alert alert-success animate__animated animate__fadeInUp mb-4">
            <h4 class="mb-0">
              <i class="bi bi-trophy-fill me-2"></i>Team {{ gameState.roundWinner === 0 ? '1' : '2' }} Wins!
            </h4>
          </div>
          <div class="scores-list">
            <div class="row g-3 mb-4">
              <div class="col-6">
                <div class="team-score card border-info h-100">
                  <div class="card-body">
                    <h4 class="card-title text-info">Team 1</h4>
                    <div class="team-stats d-flex flex-column gap-2">
                      <span class="badge bg-info">{{ gameState.teamTens?.[0] || 0 }}/4 tens</span>
                      <span class="badge bg-primary">{{ gameState.teamScores?.[0] || 0 }} tricks</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="team-score card border-danger h-100">
                  <div class="card-body">
                    <h4 class="card-title text-danger">Team 2</h4>
                    <div class="team-stats d-flex flex-column gap-2">
                      <span class="badge bg-danger">{{ gameState.teamTens?.[1] || 0 }}/4 tens</span>
                      <span class="badge bg-primary">{{ gameState.teamScores?.[1] || 0 }} tricks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="player-details">
              <h5 class="mb-3">Player Details</h5>
              <div class="list-group">
                <div v-for="(player, index) in gameStore.players" :key="index" class="list-group-item d-flex justify-content-between align-items-center animate__animated animate__fadeInUp" :class="`animate__delay-${index * 0.1}s`">
                  <span class="fw-bold">{{ player.name }}</span>
                  <div class="badge bg-primary rounded-pill ms-2">
                    {{ gameState.scores[index] }} tricks | {{ gameState.tensCaptured?.[index] || 0 }} tens
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0 justify-content-center">
          <button @click="startNextRound" class="btn btn-primary btn-lg px-5 animate__animated animate__pulse">
            <i class="bi bi-arrow-right-circle me-2"></i>Next Round
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore.js'
import { sortCards, getValidCards } from '../utils/cards.js'
import { soundManager } from '../utils/sounds.js'
import Card from '../components/Card.vue'
import PlayerArea from '../components/PlayerArea.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import gsap from 'gsap'
import '../assets/styles/views/game.css'

const router = useRouter()
const gameStore = useGameStore()

const gameStateRef = ref(null)

const gameState = computed(() => {
  if (gameStore.game) {
    const state = gameStore.game.getGameState()
    gameStateRef.value = state
    return state
  }
  return gameStateRef.value || {
    gameState: 'waiting',
    currentPlayerIndex: 0,
    currentTrick: [],
    scores: [0, 0, 0, 0],
    tensCaptured: [0, 0, 0, 0],
    teamScores: [0, 0],
    teamTens: [0, 0],
    trumpSuit: null,
    hiddenCard: null,
    trumpRevealed: false,
    roundNumber: 0,
    teams: [[0, 2], [1, 3]]
  }
})

const displayedTrick = ref([])
const lastTrickHistoryLength = ref(0)
const showCountdown = ref(false)
const countdownNumber = ref(3)
const showLeaveConfirm = ref(false)
const showAlert = ref(false)
const alertMessage = ref('')
const alertType = ref('info')
const trickWinner = ref(null)
const animatingToWinner = ref(false)
const winningCards = ref([])

const currentTrick = computed(() => {
  if (displayedTrick.value && displayedTrick.value.length > 0) {
    return displayedTrick.value
  }
  const trick = gameState.value?.currentTrick
  if (trick && Array.isArray(trick) && trick.length > 0) {
    return trick
  }
  return []
})
const trumpSuit = computed(() => gameState.value.trumpSuit)
const trumpRevealed = computed(() => gameState.value.trumpRevealed || false)
const hiddenCard = computed(() => gameState.value.hiddenCard)
const roundNumber = computed(() => gameState.value.roundNumber || 0)
const currentPlayer = computed(() => gameStore.currentPlayer)

const isMyTurn = computed(() => gameStore.isMyTurn)

const sortedHand = computed(() => {
  if (!currentPlayer.value?.hand) return []
  return sortCards(currentPlayer.value.hand, trumpSuit.value)
})

const isLoading = ref(false)
const loadingMessage = ref('')
const isProcessingAction = ref(false)

let aiInterval = null

onMounted(() => {
  if (!gameStore.game) {
    router.push('/menu')
    return
  }
  
  isLoading.value = true
  loadingMessage.value = 'Dealing cards...'
  
  setTimeout(() => {
    soundManager.playSound('deal')
    isLoading.value = false
    loadingMessage.value = ''
    
    if (gameStore.game?.trickHistory) {
      lastTrickHistoryLength.value = gameStore.game.trickHistory.length
    }
    
    animateCards()
    startCountdown()
  }, 800)
  
  window.addEventListener('beforeunload', handleBeforeUnload)
  router.beforeEach((to, from, next) => {
    if (gameStore.game && gameState.value && gameState.value.gameState === 'playing' && from.path === '/game') {
      showLeaveConfirm.value = true
      return false
    }
    next()
  })
})

onUnmounted(() => {
  if (aiInterval) {
    clearInterval(aiInterval)
  }
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

function handleBeforeUnload(event) {
  if (gameStore.game && gameState.value && gameState.value.gameState === 'playing') {
    event.preventDefault()
    showLeaveConfirm.value = true
    event.returnValue = ''
    return ''
  }
}

function startCountdown() {
  showCountdown.value = true
  countdownNumber.value = 3
  
  const countdownInterval = setInterval(() => {
    countdownNumber.value--
    soundManager.playSound('play')
    
    if (countdownNumber.value === 0) {
      clearInterval(countdownInterval)
      setTimeout(() => {
        showCountdown.value = false
        
        if (gameStore.gameMode === 'single') {
          startAIChecker()
          setTimeout(() => {
            gameStore.processAITurn()
          }, 500)
        }
      }, 1000)
    }
  }, 1000)
}

onUnmounted(() => {
  if (aiInterval) {
    clearInterval(aiInterval)
  }
})

watch(() => [gameState.value.currentPlayerIndex, gameState.value.gameState, gameState.value.trumpRevealed], ([newIndex, newState, trumpRevealed], [oldIndex, oldState]) => {
  const newGameState = gameStore.game?.getGameState()
  if (newGameState) {
    const currentTrickHistoryLength = gameStore.game?.trickHistory?.length || 0
    const trickJustCompleted = currentTrickHistoryLength > lastTrickHistoryLength.value
    
    if (trickJustCompleted && gameStore.game?.trickHistory && gameStore.game.trickHistory.length > 0) {
      const lastTrick = gameStore.game.trickHistory[gameStore.game.trickHistory.length - 1]
      if (lastTrick && lastTrick.cards && lastTrick.cards.length === 4 && !animatingToWinner.value) {
        const winner = lastTrick.winner
        trickWinner.value = winner
        
        const currentPlayerIdx = newGameState.currentPlayerIndex
        const startingPlayer = (currentPlayerIdx - 3 + 4) % 4
        const reconstructedTrick = lastTrick.cards.map((card, index) => {
          const playerIndex = (startingPlayer + index) % 4
          return { card, playerIndex, playedAt: Date.now() }
        })
        
        displayedTrick.value = reconstructedTrick
        winningCards.value = reconstructedTrick
        lastTrickHistoryLength.value = currentTrickHistoryLength
        
        animatingToWinner.value = true
        
        setTimeout(() => {
          animateCardsToWinner(winner)
        }, 1500)
        
        setTimeout(() => {
          displayedTrick.value = []
          animatingToWinner.value = false
          trickWinner.value = null
          winningCards.value = []
        }, 4000)
      }
    } else if (!isProcessingAction.value || (oldIndex !== newIndex && newGameState.currentTrick)) {
      if (newGameState.currentTrick && newGameState.currentTrick.length > 0) {
        displayedTrick.value = [...newGameState.currentTrick]
        lastTrickHistoryLength.value = currentTrickHistoryLength
      } else if (newGameState.currentTrick && newGameState.currentTrick.length === 0 && displayedTrick.value.length === 0) {
        displayedTrick.value = []
      }
    }
    gameStateRef.value = { ...newGameState }
  }
}, { immediate: false })


function getPlayerPosition(index) {
  const positions = ['top', 'right', 'bottom', 'left']
  const myIndex = gameStore.players.findIndex(p => 
    gameStore.gameMode === 'single' 
      ? (p.isHuman && !p.isAI)
      : (p.id === gameStore.currentUser?.uid || (p.isHuman && !p.isAI))
  )
  
  if (myIndex === -1) {
    return positions[index % 4]
  }
  const offset = (index - myIndex + 4) % 4
  return positions[offset]
}

function getTricksWon(playerIndex) {
  if (!gameStore.game) return 0
  const history = gameStore.game.trickHistory || []
  return history.filter(t => t.winner === playerIndex).length
}

function getSuitSymbol(suit) {
  if (!suit) return ''
  const symbols = {
    hearts: '♥',
    diamonds: '♦',
    spades: '♠',
    clubs: '♣'
  }
  return symbols[suit] || ''
}

function getTrickCardPosition(trickCard, index) {
  const totalCards = currentTrick.value.length
  const playerIndex = trickCard.playerIndex ?? index
  const myIndex = gameStore.players.findIndex(p => 
    gameStore.gameMode === 'single' 
      ? (p.isHuman && !p.isAI)
      : (p.id === gameStore.currentUser?.uid || (p.isHuman && !p.isAI))
  )
  
  const position = getPlayerPosition(playerIndex)
  let x = 0, y = 0
  const radius = 80
  
  if (position === 'top') {
    y = -radius
  } else if (position === 'bottom') {
    y = radius
  } else if (position === 'left') {
    x = -radius
  } else if (position === 'right') {
    x = radius
  }
  
  // If multiple cards from same position, spread them
  const samePositionCards = currentTrick.value.filter(t => 
    getPlayerPosition(t.playerIndex ?? currentTrick.value.indexOf(t)) === position
  )
  const samePositionIndex = samePositionCards.findIndex(t => 
    (t.playerIndex ?? currentTrick.value.indexOf(t)) === playerIndex
  )
  
  if (samePositionCards.length > 1) {
    if (position === 'top' || position === 'bottom') {
      x = (samePositionIndex - (samePositionCards.length - 1) / 2) * 30
    } else {
      y = (samePositionIndex - (samePositionCards.length - 1) / 2) * 30
    }
  }
  
  return {
    top: `calc(50% + ${y}px)`,
    left: `calc(50% + ${x}px)`,
    transform: 'translate(-50%, -50%)',
    zIndex: 10 + index
  }
}

function getCardRotation(playerIndex) {
  const myIndex = gameStore.players.findIndex(p => 
    gameStore.gameMode === 'single' 
      ? (p.isHuman && !p.isAI)
      : (p.id === gameStore.currentUser?.uid || (p.isHuman && !p.isAI))
  )
  
  if (myIndex === -1) return {}
  
  const position = getPlayerPosition(playerIndex)
  
  let rotation = 0
  if (position === 'top') {
    rotation = 180
  } else if (position === 'left') {
    rotation = 90
  } else if (position === 'right') {
    rotation = -90
  } else if (position === 'bottom') {
    rotation = 0
  }
  
  return {
    transform: `rotate(${rotation}deg)`
  }
}

function animateCardsToWinner(winnerIndex) {
  nextTick(() => {
    const winnerPosition = getPlayerPosition(winnerIndex)
    const cardWrappers = document.querySelectorAll('.trick-card-wrapper.animating-to-winner')
    const gameBoard = document.querySelector('.game-board')
    
    if (!gameBoard) return
    
    const boardRect = gameBoard.getBoundingClientRect()
    const winnerElement = document.querySelector(`.position-${winnerPosition}`)
    
    if (!winnerElement) return
    
    const winnerRect = winnerElement.getBoundingClientRect()
    
    const targetX = (winnerRect.left + winnerRect.width / 2) - (boardRect.left + boardRect.width / 2)
    const targetY = (winnerRect.top + winnerRect.height / 2) - (boardRect.top + boardRect.height / 2)
    
    cardWrappers.forEach((wrapper, index) => {
      const rect = wrapper.getBoundingClientRect()
      const currentX = (rect.left + rect.width / 2) - (boardRect.left + boardRect.width / 2)
      const currentY = (rect.top + rect.height / 2) - (boardRect.top + boardRect.height / 2)
      
      const deltaX = targetX - currentX
      const deltaY = targetY - currentY
      gsap.to(wrapper, {
        x: `+=${deltaX}`,
        y: `+=${deltaY}`,
        scale: 0.4,
        rotation: 0,
        opacity: 0.6,
        duration: 1.5,
        delay: index * 0.15,
        ease: 'power2.inOut',
        onComplete: () => {
          wrapper.style.opacity = '0'
          wrapper.style.visibility = 'hidden'
        }
      })
    })
  })
}

function isCardPlayable(card) {
  if (!isMyTurn.value) {
    return false
  }
  if (gameState.value.gameState !== 'playing') {
    return false
  }
  if (!currentPlayer.value?.hand || !card) {
    return false
  }
  
  if (currentTrick.value.length === 0) {
    return true
  }
  
  const leadCard = currentTrick.value[0]?.card
  if (!leadCard) {
    return true
  }
  
  const leadSuit = leadCard.suit
  const hasLeadSuit = currentPlayer.value.hand.some(c => c.suit === leadSuit)
  
  if (hasLeadSuit) {
    return card.suit === leadSuit
  }
  
  if (trumpRevealed.value && trumpSuit.value) {
    const hasTrump = currentPlayer.value.hand.some(c => c.suit === trumpSuit.value)
    if (hasTrump) {
      return card.suit === trumpSuit.value
    }
  }
  
  if (hiddenCard.value && !trumpRevealed.value) {
    return false
  }
  
  return true
}

function handleCardClick(card) {
  if (!card || !card.id) {
    return
  }
  
  if (!isMyTurn.value) {
    return
  }
  
  if (gameState.value.gameState !== 'playing') {
    return
  }
  
  if (isProcessingAction.value) {
    return
  }
  
  if (hiddenCard.value && !trumpRevealed.value && currentTrick.value.length > 0) {
    const leadCard = currentTrick.value[0]?.card
    if (leadCard && currentPlayer.value?.hand && !currentPlayer.value.hand.some(c => c.suit === leadCard.suit)) {
      showAlertModal('You cannot follow suit. Please reveal the hidden trump card first.', 'warning')
      return
    }
  }
  
  isProcessingAction.value = true
  
  const result = gameStore.playCard(card.id)
  
  if (result && result.success) {
    // Check if trick was completed
    if (result.trickComplete && displayedTrick.value.length === 4) {
      const winner = result.winner
      trickWinner.value = winner
      animatingToWinner.value = true
      winningCards.value = [...displayedTrick.value]
      
      // Animate cards to winner
      setTimeout(() => {
        animateCardsToWinner(winner)
      }, 1500)
      
      // Clear after animation
      setTimeout(() => {
        displayedTrick.value = []
        animatingToWinner.value = false
        trickWinner.value = null
        winningCards.value = []
      }, 4000)
    }
    
    const newState = gameStore.game.getGameState()
    
    if (result.trickComplete && result.completedTrick) {
      const winner = result.winner
      trickWinner.value = winner
      winningCards.value = [...result.completedTrick]
      
      displayedTrick.value = [...result.completedTrick]
      gameStateRef.value = { ...newState }
      soundManager.playSound('play')
      
      animatingToWinner.value = true
      
      setTimeout(() => {
        animateCardsToWinner(winner)
        soundManager.playSound('win')
      }, 1500)
      
      setTimeout(() => {
        const finalState = gameStore.game.getGameState()
        gameStateRef.value = { ...finalState }
        displayedTrick.value = []
        animatingToWinner.value = false
        trickWinner.value = null
        winningCards.value = []
        isProcessingAction.value = false
        
        if (gameStore.gameMode === 'single') {
          const updatedState = gameStore.game.getGameState()
          if (updatedState && updatedState.currentPlayerIndex >= 0) {
            const nextPlayer = gameStore.players[updatedState.currentPlayerIndex]
            if (nextPlayer && nextPlayer.isAI) {
              setTimeout(() => {
                gameStore.processAITurn()
              }, 1000)
            }
          }
        }
      }, 4000)
    } else {
      if (newState && newState.currentTrick && newState.currentTrick.length > 0) {
        displayedTrick.value = [...newState.currentTrick]
      }
      gameStateRef.value = { ...newState }
      soundManager.playSound('play')
      
      nextTick(() => {
        const updatedState = gameStore.game.getGameState()
        if (updatedState && updatedState.currentTrick && updatedState.currentTrick.length > 0) {
          displayedTrick.value = [...updatedState.currentTrick]
        }
        gameStateRef.value = { ...updatedState }
      })
      
      isProcessingAction.value = false
      
      if (gameStore.gameMode === 'single') {
        setTimeout(() => {
          const updatedState = gameStore.game.getGameState()
          if (updatedState && updatedState.currentPlayerIndex >= 0) {
            const nextPlayer = gameStore.players[updatedState.currentPlayerIndex]
            if (nextPlayer && nextPlayer.isAI) {
              setTimeout(() => {
                gameStore.processAITurn()
              }, 500)
            }
          }
        }, 2500)
      }
    }
  } else if (result && result.canRevealTrump) {
    alert('You cannot follow suit. Please reveal the hidden trump card first.')
    isProcessingAction.value = false
  } else {
    if (result && result.error) {
      showAlertModal(result.error, 'error')
    }
    isProcessingAction.value = false
  }
}

function revealTrumpCard() {
  if (isProcessingAction.value) return
  
  isProcessingAction.value = true
  const result = gameStore.revealTrump()
  if (result && result.success) {
    soundManager.playSound('play')
    gameStateRef.value = gameStore.game.getGameState()
    setTimeout(() => {
      gameStateRef.value = gameStore.game.getGameState()
      isProcessingAction.value = false
    }, 100)
  } else {
    if (result && result.error) {
      showAlertModal(result.error, 'error')
    }
    isProcessingAction.value = false
  }
}

function selectTrump(suit) {
  if (gameStore.selectTrump(suit)) {
    soundManager.playSound('play')
  }
}

function startAIChecker() {
  if (aiInterval) {
    clearInterval(aiInterval)
  }
  
  aiInterval = setInterval(() => {
    if (!gameStore.game) return
    
    const state = gameStore.game.getGameState()
    if (state && (state.gameState === 'selecting_trump' || state.gameState === 'playing')) {
      if (gameStore.gameMode === 'single') {
        const currentPlayerIndex = state.currentPlayerIndex
        if (currentPlayerIndex >= 0 && currentPlayerIndex < gameStore.players.length) {
          const currentPlayer = gameStore.players[currentPlayerIndex]
          if (currentPlayer && currentPlayer.isAI) {
            gameStore.processAITurn()
          }
        }
      }
    }
  }, 1000)
}

function animateCards() {
  setTimeout(() => {
    const cards = document.querySelectorAll('.playing-card')
    if (cards.length > 0) {
      gsap.from('.playing-card', {
        y: 100,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'back.out(1.7)'
      })
    }
  }, 100)
}

function startNextRound() {
  if (gameStore.game) {
    isLoading.value = true
    loadingMessage.value = 'Starting new round...'
    
    setTimeout(() => {
      gameStore.game.startNewRound()
      soundManager.playSound('shuffle')
      isLoading.value = false
      loadingMessage.value = ''
      animateCards()
    }, 500)
  }
}

function leaveGame() {
  // Check if game is in progress
  if (gameStore.game && gameState.value && gameState.value.gameState === 'playing') {
    showLeaveConfirm.value = true
    return
  }
  
  confirmLeave()
}

function confirmLeave() {
  showLeaveConfirm.value = false
  gameStore.resetGame()
  router.push('/menu')
}

function cancelLeave() {
  showLeaveConfirm.value = false
}

function showAlertModal(message, type = 'info') {
  alertMessage.value = message
  alertType.value = type
  showAlert.value = true
}

function closeAlert() {
  showAlert.value = false
  alertMessage.value = ''
}
</script>

