import { defineStore } from 'pinia'
import { MindiGame } from '../utils/gameEngine.js'
import { AIPlayer } from '../utils/aiPlayer.js'
import { ref, computed } from 'vue'

export const useGameStore = defineStore('game', () => {
  const game = ref(null)
  const currentUser = ref(null)
  const gameMode = ref('menu')
  const roomCode = ref(null)
  const players = ref([])
  const isHost = ref(false)
  const aiDifficulty = ref('medium')
  const soundEnabled = ref(true)

  const currentPlayer = computed(() => {
    if (!game.value) return null
    if (gameMode.value === 'single') {
      return players.value.find(p => p.isHuman && !p.isAI) || players.value[0]
    }
    if (!currentUser.value) return null
    const index = players.value.findIndex(p => p.id === currentUser.value.uid || (p.isHuman && !p.isAI))
    return index >= 0 ? players.value[index] : null
  })

  const isMyTurn = computed(() => {
    if (!game.value || !currentPlayer.value) return false
    const state = game.value.getGameState()
    let myIndex = -1
    if (gameMode.value === 'single') {
      myIndex = players.value.findIndex(p => p.isHuman && !p.isAI)
    } else {
      myIndex = players.value.findIndex(p => p.id === currentUser.value?.uid || (p.isHuman && !p.isAI))
    }
    return myIndex >= 0 && state.currentPlayerIndex === myIndex
  })

  function initializeGame(mode) {
    gameMode.value = mode
    const gamePlayers = []
    
    if (mode === 'single') {
      gamePlayers.push({
        id: 'human-0',
        name: 'You',
        isHuman: true,
        hand: []
      })
      for (let i = 1; i < 4; i++) {
        gamePlayers.push({
          id: `ai-${i}`,
          name: `Guest ${i}`,
          isHuman: false,
          isAI: true,
          difficulty: aiDifficulty.value,
          hand: []
        })
      }
    } else {
      if (players.value && players.value.length > 0) {
        const mappedPlayers = players.value.map(p => ({
          ...p,
          hand: []
        }))
        gamePlayers.push(...mappedPlayers)
      } else {
        for (let i = 0; i < 4; i++) {
          gamePlayers.push({
            id: `player-${i}`,
            name: `Player ${i + 1}`,
            isHuman: true,
            hand: []
          })
        }
      }
    }
    
    players.value = gamePlayers
    game.value = new MindiGame(gamePlayers, mode)
    return game.value.startNewRound()
  }

  function getMyPlayerIndex() {
    if (gameMode.value === 'single') {
      return players.value.findIndex(p => p.isHuman && !p.isAI)
    }
    return players.value.findIndex(p => p.id === currentUser.value?.uid || (p.isHuman && !p.isAI))
  }

  function playCard(cardId) {
    if (!game.value) return { success: false, error: 'Game not initialized' }
    const myIndex = getMyPlayerIndex()
    if (myIndex < 0) return { success: false, error: 'Player index not found' }
    if (!players.value[myIndex]) return { success: false, error: 'Player not found at index' }
    return game.value.playCard(cardId, myIndex)
  }

  function revealTrump() {
    if (!game.value) return { success: false, error: 'Game not initialized' }
    const myIndex = getMyPlayerIndex()
    if (myIndex < 0) return { success: false, error: 'Player index not found' }
    return game.value.revealTrump(myIndex)
  }

  function selectTrump(suit) {
    if (!game.value || !currentPlayer.value) return false
    const myIndex = getMyPlayerIndex()
    if (myIndex < 0) return false
    return game.value.selectTrump(suit, myIndex)
  }

  let isProcessingAITurn = false

  function processAITurn() {
    if (isProcessingAITurn) {
      return
    }
    
    if (!game.value) return
    
    const state = game.value.getGameState()
    if (!state || state.currentPlayerIndex === undefined) return
    
    const currentPlayer = players.value[state.currentPlayerIndex]
    
    if (!currentPlayer) {
      return
    }
    
    if (!currentPlayer.isAI) {
      return
    }
    
    isProcessingAITurn = true
    
    setTimeout(() => {
      if (!game.value) {
        isProcessingAITurn = false
        return
      }
      
      const currentState = game.value.getGameState()
      if (!currentState) {
        isProcessingAITurn = false
        return
      }
      
      const currentPlayerIndex = currentState.currentPlayerIndex
      if (currentPlayerIndex < 0 || currentPlayerIndex >= players.value.length) {
        isProcessingAITurn = false
        return
      }
      
      const player = players.value[currentPlayerIndex]
      
      if (!player || !player.isAI) {
        isProcessingAITurn = false
        return
      }
      
      try {
        if (currentState.gameState === 'selecting_trump') {
          setTimeout(() => {
            const ai = new AIPlayer(player.difficulty || 'medium')
            const availableSuits = ['hearts', 'diamonds', 'clubs', 'spades']
            const trump = ai.selectTrump(player.hand || [], availableSuits)
            const result = game.value.selectTrump(trump, currentPlayerIndex)
            if (result) {
              setTimeout(() => {
                isProcessingAITurn = false
                processAITurn()
              }, 2500)
            } else {
              isProcessingAITurn = false
            }
          }, 1800)
        } else if (currentState.gameState === 'playing') {
          if (!player.hand || player.hand.length === 0) {
            isProcessingAITurn = false
            return
          }
          
          setTimeout(() => {
            const ai = new AIPlayer(player.difficulty || 'medium')
            const trickArray = currentState.currentTrick || []
            const card = ai.playCard(
              player.hand || [],
              trickArray,
              currentState.trumpSuit,
              player.difficulty || 'medium'
            )
            
            if (!card || !card.id) {
              isProcessingAITurn = false
              return
            }
            
            const result = game.value.playCard(card.id, currentPlayerIndex)
            
            if (result && result.success) {
              setTimeout(() => {
                if (result.trickComplete) {
                  setTimeout(() => {
                    isProcessingAITurn = false
                    const nextState = game.value.getGameState()
                    if (nextState && nextState.currentPlayerIndex >= 0) {
                      const nextPlayer = players.value[nextState.currentPlayerIndex]
                      if (nextPlayer && nextPlayer.isAI) {
                        setTimeout(() => {
                          processAITurn()
                        }, 2000)
                      }
                    }
                  }, 4000)
                } else {
                  setTimeout(() => {
                    isProcessingAITurn = false
                    const nextState = game.value.getGameState()
                    if (nextState && nextState.currentPlayerIndex >= 0) {
                      const nextPlayer = players.value[nextState.currentPlayerIndex]
                      if (nextPlayer && nextPlayer.isAI) {
                        setTimeout(() => {
                          processAITurn()
                        }, 2800)
                      }
                    }
                  }, 2200)
                }
              }, 600)
            } else {
              isProcessingAITurn = false
            }
          }, 2000 + Math.random() * 1000) // AI thinking time (2-3 seconds) - shows "thinking" indicator
        } else {
          isProcessingAITurn = false
        }
      } catch (error) {
        console.error('AI turn error:', error)
        isProcessingAITurn = false
      }
    }, 1000) // Initial delay before AI starts (shows turn indicator)
  }
  

  function resetGame() {
    if (game.value) {
      game.value.reset()
    }
    players.value = []
    game.value = null
    gameMode.value = 'menu'
    roomCode.value = null
  }

  return {
    game,
    currentUser,
    gameMode,
    roomCode,
    players,
    isHost,
    aiDifficulty,
    soundEnabled,
    currentPlayer,
    isMyTurn,
    initializeGame,
    playCard,
      revealTrump,
      selectTrump,
      processAITurn,
      resetGame
  }
})

