<template>
  <div class="game-page">
    <LoadingSpinner 
      :show="isLoading" 
      :message="loadingMessage"
      :fullscreen="true"
    />
    
    <div class="game-header glass-panel">
      <div class="game-info">
        <div class="round-info">Round {{ roundNumber }}</div>
        <div class="teams-info">
          <div class="team-info team-1">
            <span>Team 1:</span>
            <span>{{ gameState.teamTens?.[0] || 0 }}/4 tens | {{ gameState.teamScores?.[0] || 0 }} tricks</span>
          </div>
          <div class="team-info team-2">
            <span>Team 2:</span>
            <span>{{ gameState.teamTens?.[1] || 0 }}/4 tens | {{ gameState.teamScores?.[1] || 0 }} tricks</span>
          </div>
        </div>
        <div v-if="trumpSuit && trumpRevealed" class="trump-display">
          Trump: <span :class="`suit-${trumpSuit}`">{{ getSuitSymbol(trumpSuit) }}</span>
        </div>
        <div v-else-if="hiddenCard && !trumpRevealed" class="trump-display">
          <span class="trump-hidden-badge">Trump: Hidden</span>
        </div>
      </div>
      <button @click="leaveGame" class="leave-game-btn">Leave Game</button>
    </div>
    
    <div class="game-board">
      <div class="trump-corner-indicator">
        <div v-if="trumpSuit && trumpRevealed" class="trump-indicator glass-panel">
          <div class="trump-label">Trump</div>
          <div class="trump-suit" :class="`suit-${trumpSuit}`">{{ getSuitSymbol(trumpSuit) }}</div>
        </div>
        <div v-else-if="hiddenCard && !trumpRevealed" class="hidden-card-indicator glass-panel">
          <div class="hidden-card-label">Hidden Trump</div>
          <div class="hidden-card-back">
            <div class="card-back-pattern"></div>
          </div>
        </div>
      </div>
      
      <GameTable 
        :current-trick="currentTrick" 
        :trump-suit="trumpSuit" 
        :hidden-card="hiddenCard"
        :trump-revealed="trumpRevealed"
        :players="gameStore.players"
        :get-player-position="getPlayerPosition"
      />
      
      <PlayerArea
        v-for="(player, index) in gameStore.players"
        :key="player.id"
        :player="player"
        :position="getPlayerPosition(index)"
        :is-current-turn="gameState.currentPlayerIndex === index"
        :tricks-won="getTricksWon(index)"
        :score="gameState.scores[index]"
        :hide-a-i-badge="gameStore.gameMode === 'single'"
        :show-actual-cards="player.id === currentPlayer?.id && sortedHand.length > 0"
        :actual-cards="player.id === currentPlayer?.id ? sortedHand : null"
        :is-card-playable="player.id === currentPlayer?.id ? isCardPlayable : null"
        :handle-card-click="player.id === currentPlayer?.id ? handleCardClick : null"
        :is-disabled="!isMyTurn || gameState.gameState !== 'playing'"
        :trump-suit="trumpSuit"
        :trump-revealed="trumpRevealed"
      />
    </div>
    
    <div v-if="gameState.gameState === 'playing' && isMyTurn && hiddenCard && !trumpRevealed && currentTrick.length > 0 && currentPlayer && currentPlayer.hand && !currentPlayer.hand.some(c => c.suit === currentTrick[0]?.card?.suit)" class="trump-reveal-prompt glass-panel">
      <h3>Cannot Follow Suit</h3>
      <p class="instruction-text">You cannot follow suit. Click the button below to reveal the hidden trump card, then you can play any card.</p>
      <button @click="revealTrumpCard" class="btn btn-primary" :disabled="isProcessingAction">
        {{ isProcessingAction ? 'Revealing...' : 'Reveal Trump Card' }}
      </button>
    </div>
    
    <div v-if="gameState.gameState === 'selecting_trump' && isMyTurn" class="trump-selection glass-panel">
      <h3>Select Trump Suit</h3>
      <div class="suit-buttons">
        <button
          v-for="suit in ['hearts', 'diamonds', 'clubs', 'spades']"
          :key="suit"
          @click="selectTrump(suit)"
          class="btn btn-secondary suit-btn"
        >
          <span :class="`suit-${suit}`">
            <span v-if="suit === 'hearts'">♥</span>
            <span v-else-if="suit === 'diamonds'">♦</span>
            <span v-else-if="suit === 'spades'">♠</span>
            <span v-else-if="suit === 'clubs'">♣</span>
          </span>
          {{ suit }}
        </button>
      </div>
    </div>
    
    
    <div v-if="gameState.gameState === 'mendikot'" class="round-summary glass-panel mendikot-win">
      <h2>🎉 MENDIKOT! 🎉</h2>
      <h3>Team {{ gameState.winnerTeam === 0 ? '1' : '2' }} captured all 4 tens!</h3>
      <div class="scores-list">
        <div class="team-scores">
          <div class="team-score">
            <h4>Team 1 (Players 1 & 3)</h4>
            <div class="team-stats">
              <span>{{ gameState.teamTens?.[0] || 0 }}/4 tens</span>
              <span>{{ gameState.teamScores?.[0] || 0 }} tricks</span>
            </div>
          </div>
          <div class="team-score">
            <h4>Team 2 (Players 2 & 4)</h4>
            <div class="team-stats">
              <span>{{ gameState.teamTens?.[1] || 0 }}/4 tens</span>
              <span>{{ gameState.teamScores?.[1] || 0 }} tricks</span>
            </div>
          </div>
        </div>
      </div>
      <button @click="startNextRound" class="btn btn-primary">New Round</button>
    </div>
    
    <div v-if="gameState.gameState === 'whitewash'" class="round-summary glass-panel whitewash-win">
      <h2>🏆 52-CARD MENDIKOT! 🏆</h2>
      <h3>Team {{ gameState.winnerTeam === 0 ? '1' : '2' }} won all 13 tricks!</h3>
      <div class="scores-list">
        <div class="team-scores">
          <div class="team-score">
            <h4>Team 1 (Players 1 & 3)</h4>
            <div class="team-stats">
              <span>{{ gameState.teamTens?.[0] || 0 }}/4 tens</span>
              <span>{{ gameState.teamScores?.[0] || 0 }} tricks</span>
            </div>
          </div>
          <div class="team-score">
            <h4>Team 2 (Players 2 & 4)</h4>
            <div class="team-stats">
              <span>{{ gameState.teamTens?.[1] || 0 }}/4 tens</span>
              <span>{{ gameState.teamScores?.[1] || 0 }} tricks</span>
            </div>
          </div>
        </div>
      </div>
      <button @click="startNextRound" class="btn btn-primary">New Round</button>
    </div>
    
    <div v-if="gameState.gameState === 'round_complete'" class="round-summary glass-panel">
      <h3>Round Complete!</h3>
      <div v-if="gameState.roundWinner !== undefined" class="round-winner">
        <h4>Team {{ gameState.roundWinner === 0 ? '1' : '2' }} Wins!</h4>
      </div>
      <div class="scores-list">
        <div class="team-scores">
          <div class="team-score">
            <h4>Team 1 (Players 1 & 3)</h4>
            <div class="team-stats">
              <span>{{ gameState.teamTens?.[0] || 0 }}/4 tens</span>
              <span>{{ gameState.teamScores?.[0] || 0 }} tricks</span>
            </div>
          </div>
          <div class="team-score">
            <h4>Team 2 (Players 2 & 4)</h4>
            <div class="team-stats">
              <span>{{ gameState.teamTens?.[1] || 0 }}/4 tens</span>
              <span>{{ gameState.teamScores?.[1] || 0 }} tricks</span>
            </div>
          </div>
        </div>
        <div class="player-details">
          <div v-for="(player, index) in gameStore.players" :key="index" class="score-item">
            <span>{{ player.name }}</span>
            <span>{{ gameState.scores[index] }} tricks | {{ gameState.tensCaptured?.[index] || 0 }} tens</span>
          </div>
        </div>
      </div>
      <button @click="startNextRound" class="btn btn-primary">Next Round</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, TransitionGroup } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore.js'
import { sortCards, getValidCards } from '../utils/cards.js'
import { soundManager } from '../utils/sounds.js'
import Card from '../components/Card.vue'
import PlayerArea from '../components/PlayerArea.vue'
import GameTable from '../components/GameTable.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import gsap from 'gsap'

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
const currentTrick = computed(() => {
  if (displayedTrick.value.length > 0) {
    return displayedTrick.value
  }
  return gameState.value.currentTrick || []
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
    
    if (gameStore.gameMode === 'single') {
      startAIChecker()
      setTimeout(() => {
        gameStore.processAITurn()
      }, 1000)
    }
    
    animateCards()
  }, 800)
})

onUnmounted(() => {
  if (aiInterval) {
    clearInterval(aiInterval)
  }
})

watch(() => [gameState.value.currentPlayerIndex, gameState.value.gameState, gameState.value.trumpRevealed], ([newIndex, newState, trumpRevealed]) => {
  const newGameState = gameStore.game?.getGameState()
  if (newGameState) {
    if (newGameState.currentTrick && newGameState.currentTrick.length > 0) {
      displayedTrick.value = newGameState.currentTrick
    }
    gameStateRef.value = newGameState
  }
  if (gameStore.gameMode === 'single') {
    if (newState === 'playing' || newState === 'selecting_trump') {
      if (newIndex >= 0 && newIndex < gameStore.players.length) {
        const currentPlayer = gameStore.players[newIndex]
        if (currentPlayer && currentPlayer.isAI) {
          setTimeout(() => {
            gameStore.processAITurn()
          }, 1000)
        }
      }
    }
  }
}, { immediate: false })


function getPlayerPosition(index) {
  const positions = ['top', 'right', 'bottom', 'left']
  const myIndex = gameStore.players.findIndex(p => 
    gameStore.gameMode === 'single' 
      ? (p.isHuman && !p.isAI)
      : (p.id === gameStore.currentUser?.uid || (p.isHuman && !p.isAI))
  )
  if (myIndex === -1) return positions[index]
  const offset = (index - myIndex + 4) % 4
  return positions[offset]
}

function getTricksWon(playerIndex) {
  if (!gameStore.game) return 0
  const history = gameStore.game.trickHistory || []
  return history.filter(t => t.winner === playerIndex).length
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
      alert('You cannot follow suit. Please reveal the hidden trump card first.')
      return
    }
  }
  
  isProcessingAction.value = true
  
  const result = gameStore.playCard(card.id)
  
  if (result && result.success) {
    const newState = gameStore.game.getGameState()
    displayedTrick.value = newState.currentTrick || []
    gameStateRef.value = newState
    soundManager.playSound('play')
    if (result.trickComplete) {
      setTimeout(() => {
        soundManager.playSound('win')
        setTimeout(() => {
          const finalState = gameStore.game.getGameState()
          gameStateRef.value = finalState
          setTimeout(() => {
            displayedTrick.value = []
            isProcessingAction.value = false
          }, 500)
        }, 4500)
      }, 1500)
    } else {
      gameStateRef.value = newState
      isProcessingAction.value = false
    }
  } else if (result && result.canRevealTrump) {
    alert('You cannot follow suit. Please reveal the hidden trump card first.')
    isProcessingAction.value = false
  } else {
    if (result && result.error) {
      alert(result.error)
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
      alert(result.error)
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
  gameStore.resetGame()
  router.push('/menu')
}
</script>

