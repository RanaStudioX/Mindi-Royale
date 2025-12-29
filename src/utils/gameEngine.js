import { createDeck, sortCards, getValidCards, getCardWinner } from './cards.js'

export class MindiGame {
  constructor(players, gameMode = 'multiplayer') {
    this.players = players
    this.gameMode = gameMode
    this.deck = []
    this.trumpSuit = null
    this.hiddenCard = null
    this.currentTrick = []
    this.trickHistory = []
    this.currentPlayerIndex = 0
    this.roundNumber = 0
    this.scores = players.map(() => 0)
    this.tensCaptured = players.map(() => 0)
    this.teamScores = [0, 0]
    this.teamTens = [0, 0]
    this.gameState = 'waiting'
    this.dealerIndex = 0
    this.trumpMode = 'bandh'
    this.trumpRevealed = false
    this.setupTeams()
  }

  setupTeams() {
    this.teams = [
      [0, 2],
      [1, 3]
    ]
  }

  getTeamIndex(playerIndex) {
    return this.teams[0].includes(playerIndex) ? 0 : 1
  }

  getPartnerIndex(playerIndex) {
    const team = this.teams.find(t => t.includes(playerIndex))
    return team ? team.find(p => p !== playerIndex) : -1
  }

  startNewRound() {
    this.roundNumber++
    this.deck = createDeck()
    this.trumpSuit = null
    this.trumpRevealed = false
    this.currentTrick = []
    this.trickHistory = []
    
    const randomIndex = Math.floor(Math.random() * this.deck.length)
    this.hiddenCard = { card: this.deck[randomIndex], playerIndex: null }
    this.deck.splice(randomIndex, 1)
    
    const hands = this.dealCards()
    this.players.forEach((player, index) => {
      player.hand = hands[index]
      player.hand = sortCards(player.hand)
    })
    
    const aceOfSpadesIndex = this.findPlayerWithAceOfSpades()
    this.currentPlayerIndex = aceOfSpadesIndex >= 0 ? aceOfSpadesIndex : (this.dealerIndex + 1) % this.players.length
    
    this.gameState = 'playing'
    return { hands, dealerIndex: this.dealerIndex }
  }

  findPlayerWithAceOfSpades() {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].hand && this.players[i].hand.some(c => c.suit === 'spades' && c.rank === 'A')) {
        return i
      }
    }
    return -1
  }

  dealCards() {
    const hands = this.players.map(() => [])
    const cardsPerPlayer = Math.floor(this.deck.length / this.players.length)
    
    for (let i = 0; i < cardsPerPlayer; i++) {
      for (let j = 0; j < this.players.length; j++) {
        const playerIndex = (this.dealerIndex + 1 + j) % this.players.length
        if (this.deck.length > 0) {
          hands[playerIndex].push(this.deck.pop())
        }
      }
    }
    return hands
  }

  revealTrump(playerIndex) {
    if (!this.hiddenCard || this.trumpRevealed) return { success: false, error: 'Trump already revealed or no hidden card' }
    if (playerIndex !== this.currentPlayerIndex) return { success: false, error: 'Not your turn' }
    
    const player = this.players[playerIndex]
    const leadCard = this.currentTrick.length === 0 ? null : this.currentTrick[0].card
    
    if (leadCard && player.hand.some(c => c.suit === leadCard.suit)) {
      return { success: false, error: 'You must follow suit if you have a card of the same suit' }
    }
    
    this.trumpRevealed = true
    this.trumpSuit = this.hiddenCard.card.suit
    
    this.players.forEach(p => {
      if (p.hand) {
        p.hand = sortCards(p.hand, this.trumpSuit)
      }
    })
    
    return { success: true, trumpSuit: this.trumpSuit }
  }

  selectTrump(suit, playerIndex) {
    if (this.gameState !== 'selecting_trump') return false
    if (playerIndex !== this.currentPlayerIndex) return false
    
    this.trumpSuit = suit
    this.gameState = 'playing'
    this.currentPlayerIndex = (this.dealerIndex + 1) % this.players.length
    
    this.players.forEach(player => {
      if (player.hand) {
        player.hand = sortCards(player.hand, this.trumpSuit)
      }
    })
    
    return true
  }

  playCard(cardId, playerIndex) {
    if (this.gameState !== 'playing') return { success: false, error: 'Game not in playing state' }
    if (playerIndex !== this.currentPlayerIndex) return { success: false, error: 'Not your turn' }
    
    const player = this.players[playerIndex]
    const cardIndex = player.hand.findIndex(c => c.id === cardId)
    
    if (cardIndex === -1) return { success: false, error: 'Card not in hand' }
    
    const card = player.hand[cardIndex]
    const leadCard = this.currentTrick.length === 0 ? null : this.currentTrick[0]?.card
    
    if (!leadCard) {
      player.hand.splice(cardIndex, 1)
      this.currentTrick.push({ card, playerIndex, playedAt: Date.now() })
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length
      return { success: true, trickComplete: false }
    }
    
    const effectiveTrump = this.trumpRevealed ? this.trumpSuit : null
    const validCards = getValidCards(player.hand, leadCard, effectiveTrump, this.trumpRevealed)
    
    if (!validCards.find(c => c.id === cardId)) {
      if (leadCard && !player.hand.some(c => c.suit === leadCard.suit)) {
        if (this.hiddenCard && !this.trumpRevealed) {
          return { success: false, error: 'Cannot follow suit. You must reveal the hidden trump card first.', canRevealTrump: true }
        }
      } else {
        return { success: false, error: 'Invalid card play - must follow suit if possible' }
      }
    }
    
    player.hand.splice(cardIndex, 1)
    this.currentTrick.push({ card, playerIndex, playedAt: Date.now() })
    
    if (this.currentTrick.length === this.players.length) {
      const effectiveTrumpForWinner = this.trumpRevealed ? this.trumpSuit : null
      const winnerIndex = getCardWinner(
        this.currentTrick.map(t => t.card),
        effectiveTrumpForWinner
      )
      const trickWinner = this.currentTrick[winnerIndex].playerIndex
      const winnerTeam = this.getTeamIndex(trickWinner)
      
      const completedTrick = [...this.currentTrick]
      
      this.trickHistory.push({
        cards: this.currentTrick.map(t => t.card),
        winner: trickWinner,
        winnerTeam: winnerTeam,
        round: this.roundNumber
      })
      
      const trickCards = this.currentTrick.map(t => t.card)
      const tensInTrick = trickCards.filter(c => c.rank === '10').length
      this.tensCaptured[trickWinner] += tensInTrick
      this.teamTens[winnerTeam] += tensInTrick
      this.scores[trickWinner]++
      this.teamScores[winnerTeam]++
      
      if (this.teamTens[winnerTeam] === 4) {
        this.currentPlayerIndex = trickWinner
        this.currentTrick = []
        this.gameState = 'mendikot'
        return { success: true, trickComplete: true, winner: trickWinner, winnerTeam: winnerTeam, mendikot: true, roundComplete: true, completedTrick: completedTrick }
      }
      
      if (this.teamScores[winnerTeam] === 13) {
        this.currentPlayerIndex = trickWinner
        this.currentTrick = []
        this.gameState = 'whitewash'
        return { success: true, trickComplete: true, winner: trickWinner, winnerTeam: winnerTeam, whitewash: true, roundComplete: true, completedTrick: completedTrick }
      }
      
      this.currentPlayerIndex = trickWinner
      this.currentTrick = []
      
      if (this.players[0].hand.length === 0) {
        this.gameState = 'round_complete'
        const roundWinner = this.getRoundWinner()
        const losingTeam = roundWinner === 0 ? 1 : 0
        const dealerTeam = this.getTeamIndex(this.dealerIndex)
        
        if (losingTeam === dealerTeam) {
          if (this.teamScores[losingTeam] === 0) {
            this.dealerIndex = this.getPartnerIndex(this.dealerIndex)
          }
        } else {
          this.dealerIndex = (this.dealerIndex + 1) % this.players.length
        }
        return { success: true, trickComplete: true, winner: trickWinner, winnerTeam: winnerTeam, roundComplete: true, roundWinner: roundWinner, completedTrick: completedTrick }
      }
      
      return { success: true, trickComplete: true, winner: trickWinner, winnerTeam: winnerTeam, completedTrick: completedTrick }
    }
    
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length
    return { success: true, trickComplete: false }
  }

  getGameState() {
    return {
      gameState: this.gameState,
      currentPlayerIndex: this.currentPlayerIndex,
      currentTrick: this.currentTrick,
      trickHistory: this.trickHistory,
      scores: this.scores,
      tensCaptured: this.tensCaptured,
      teamScores: this.teamScores,
      teamTens: this.teamTens,
      trumpSuit: this.trumpSuit,
      hiddenCard: this.hiddenCard,
      trumpRevealed: this.trumpRevealed,
      roundNumber: this.roundNumber,
      dealerIndex: this.dealerIndex,
      teams: this.teams
    }
  }

  getRoundWinner() {
    const team0Tens = this.teamTens[0]
    const team1Tens = this.teamTens[1]
    
    if (team0Tens >= 3) return 0
    if (team1Tens >= 3) return 1
    if (team0Tens === 2 && team1Tens === 2) {
      return this.teamScores[0] >= 7 ? 0 : 1
    }
    return team0Tens > team1Tens ? 0 : 1
  }

  resetTeamScores() {
    this.teamScores = [0, 0]
    this.teamTens = [0, 0]
  }

  reset() {
    this.roundNumber = 0
    this.scores = this.players.map(() => 0)
    this.tensCaptured = this.players.map(() => 0)
    this.teamScores = [0, 0]
    this.teamTens = [0, 0]
    this.gameState = 'waiting'
    this.dealerIndex = 0
    this.trumpRevealed = false
  }
}

