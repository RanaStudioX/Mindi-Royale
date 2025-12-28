import { getValidCards, getRankValue, getCardWinner } from './cards.js'

export class AIPlayer {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty
  }

  selectTrump(hand, availableSuits) {
    const suitCounts = {}
    availableSuits.forEach(suit => {
      suitCounts[suit] = hand.filter(c => c.suit === suit).length
    })
    
    let bestSuit = availableSuits[0]
    let maxCount = suitCounts[bestSuit]
    
    for (const suit of availableSuits) {
      if (suitCounts[suit] > maxCount) {
        maxCount = suitCounts[suit]
        bestSuit = suit
      }
    }
    
    return bestSuit
  }

  selectCardToHide(hand) {
    const suitCounts = {}
    hand.forEach(card => {
      suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1
    })
    
    let bestSuit = hand[0].suit
    let maxCount = suitCounts[bestSuit]
    
    for (const suit in suitCounts) {
      if (suitCounts[suit] > maxCount) {
        maxCount = suitCounts[suit]
        bestSuit = suit
      }
    }
    
    const cardsOfBestSuit = hand.filter(c => c.suit === bestSuit)
    const lowCards = cardsOfBestSuit.filter(c => getRankValue(c.rank) < 10)
    
    if (lowCards.length > 0) {
      return lowCards[Math.floor(Math.random() * lowCards.length)]
    }
    
    return cardsOfBestSuit[0]
  }

  playCard(hand, currentTrick, trumpSuit, difficulty = null) {
    const diff = difficulty || this.difficulty
    const trickArray = currentTrick || []
    const leadCard = trickArray.length === 0 ? null : (trickArray[0]?.card || trickArray[0])
    const validCards = getValidCards(hand, leadCard, trumpSuit)
    
    if (validCards.length === 0) return hand[0] || hand
    
    if (diff === 'easy') {
      return this.playEasy(validCards, trickArray, trumpSuit)
    } else if (diff === 'hard') {
      return this.playHard(validCards, trickArray, trumpSuit, hand)
    } else {
      return this.playMedium(validCards, trickArray, trumpSuit)
    }
  }

  playEasy(validCards, currentTrick, trumpSuit) {
    return validCards[Math.floor(Math.random() * validCards.length)]
  }

  playMedium(validCards, currentTrick, trumpSuit) {
    if (!currentTrick || currentTrick.length === 0) {
      const lowCards = validCards.filter(c => getRankValue(c.rank) < 10)
      if (lowCards.length > 0) {
        return lowCards[Math.floor(Math.random() * lowCards.length)]
      }
      return validCards[0]
    }
    
    const playedCards = currentTrick.map(t => t?.card || t).filter(Boolean)
    if (playedCards.length === 0) {
      return validCards[0]
    }
    
    const winnerIndex = getCardWinner(playedCards, trumpSuit)
    const currentWinner = playedCards[winnerIndex]
    const leadCard = playedCards[0]
    
    if (!currentWinner || !leadCard) {
      return validCards[0]
    }
    
    const canWin = validCards.some(card => {
      if (card.suit === trumpSuit && currentWinner.suit !== trumpSuit) return true
      if (card.suit === trumpSuit && currentWinner.suit === trumpSuit) {
        return getRankValue(card.rank) > getRankValue(currentWinner.rank)
      }
      if (card.suit === leadCard.suit && currentWinner.suit !== trumpSuit) {
        return getRankValue(card.rank) > getRankValue(currentWinner.rank)
      }
      return false
    })
    
    if (canWin) {
      const winningCards = validCards.filter(card => {
        if (card.suit === trumpSuit && currentWinner.suit !== trumpSuit) return true
        if (card.suit === trumpSuit && currentWinner.suit === trumpSuit) {
          return getRankValue(card.rank) > getRankValue(currentWinner.rank)
        }
        if (card.suit === leadCard.suit && currentWinner.suit !== trumpSuit) {
          return getRankValue(card.rank) > getRankValue(currentWinner.rank)
        }
        return false
      })
      return winningCards[0] || validCards[0]
    }
    
    const lowCards = validCards.filter(c => getRankValue(c.rank) < 10)
    if (lowCards.length > 0) {
      return lowCards[Math.floor(Math.random() * lowCards.length)]
    }
    
    return validCards[0]
  }

  playHard(validCards, currentTrick, trumpSuit, fullHand) {
    if (!currentTrick || currentTrick.length === 0) {
      const highCards = validCards.filter(c => getRankValue(c.rank) >= 12)
      if (highCards.length > 0 && Math.random() > 0.3) {
        return highCards[0]
      }
      const lowCards = validCards.filter(c => getRankValue(c.rank) < 8)
      if (lowCards.length > 0) {
        return lowCards[Math.floor(Math.random() * lowCards.length)]
      }
      return validCards[0]
    }
    
    const playedCards = currentTrick.map(t => t?.card || t).filter(Boolean)
    if (playedCards.length === 0) {
      return validCards[0]
    }
    
    const winnerIndex = getCardWinner(playedCards, trumpSuit)
    const currentWinner = playedCards[winnerIndex]
    const leadCard = playedCards[0]
    
    if (!currentWinner || !leadCard) {
      return validCards[0]
    }
    const remainingPlayers = 4 - currentTrick.length
    
    const canWin = validCards.some(card => {
      if (card.suit === trumpSuit && currentWinner.suit !== trumpSuit) return true
      if (card.suit === trumpSuit && currentWinner.suit === trumpSuit) {
        return getRankValue(card.rank) > getRankValue(currentWinner.rank)
      }
      if (card.suit === leadCard.suit && currentWinner.suit !== trumpSuit) {
        return getRankValue(card.rank) > getRankValue(currentWinner.rank)
      }
      return false
    })
    
    if (canWin) {
      const trumpCards = validCards.filter(c => c.suit === trumpSuit)
      if (trumpCards.length > 0 && currentWinner.suit !== trumpSuit) {
        const lowTrumps = trumpCards.filter(c => getRankValue(c.rank) < 12)
        if (lowTrumps.length > 0 && remainingPlayers > 1) {
          return lowTrumps[0]
        }
        return trumpCards[0]
      }
      
      const winningCards = validCards.filter(card => {
        if (card.suit === trumpSuit && currentWinner.suit !== trumpSuit) return true
        if (card.suit === trumpSuit && currentWinner.suit === trumpSuit) {
          return getRankValue(card.rank) > getRankValue(currentWinner.rank)
        }
        if (card.suit === leadCard.suit && currentWinner.suit !== trumpSuit) {
          return getRankValue(card.rank) > getRankValue(currentWinner.rank)
        }
        return false
      })
      
      if (winningCards.length > 0) {
        winningCards.sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank))
        return winningCards[0]
      }
    }
    
    const lowCards = validCards.filter(c => getRankValue(c.rank) < 9)
    if (lowCards.length > 0) {
      lowCards.sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank))
      return lowCards[0]
    }
    
    validCards.sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank))
    return validCards[0]
  }
}

