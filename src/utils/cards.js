export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades']
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

export function createDeck() {
  const deck = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: `${suit}-${rank}` })
    }
  }
  return shuffleDeck(deck)
}

export function shuffleDeck(deck) {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function sortCards(cards, trumpSuit = null) {
  const sorted = [...cards].sort((a, b) => {
    if (trumpSuit) {
      const aIsTrump = a.suit === trumpSuit
      const bIsTrump = b.suit === trumpSuit
      if (aIsTrump && !bIsTrump) return -1
      if (!aIsTrump && bIsTrump) return 1
      if (aIsTrump && bIsTrump) {
        return getRankValue(b.rank) - getRankValue(a.rank)
      }
    }
    if (a.suit !== b.suit) {
      return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit)
    }
    return getRankValue(b.rank) - getRankValue(a.rank)
  })
  return sorted
}

export function getRankValue(rank) {
  const values = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
  }
  return values[rank] || 0
}

export function getValidCards(hand, leadCard, trumpSuit, trumpRevealed = true) {
  if (!leadCard) return hand
  
  const leadSuit = leadCard.suit
  const hasLeadSuit = hand.some(card => card.suit === leadSuit)
  
  if (hasLeadSuit) {
    return hand.filter(card => card.suit === leadSuit)
  }
  
  if (trumpRevealed && trumpSuit) {
    const hasTrump = hand.some(card => card.suit === trumpSuit)
    if (hasTrump) {
      return hand.filter(card => card.suit === trumpSuit)
    }
  }
  
  return hand
}

export function getCardWinner(cards, trumpSuit) {
  if (cards.length !== 4) return 0
  
  const leadSuit = cards[0].suit
  let winner = cards[0]
  let winnerIndex = 0
  
  for (let i = 1; i < cards.length; i++) {
    const card = cards[i]
    const isTrump = trumpSuit && card.suit === trumpSuit
    const winnerIsTrump = trumpSuit && winner.suit === trumpSuit
    
    if (isTrump && !winnerIsTrump) {
      winner = card
      winnerIndex = i
    } else if (isTrump && winnerIsTrump) {
      if (getRankValue(card.rank) > getRankValue(winner.rank)) {
        winner = card
        winnerIndex = i
      }
    } else if (!isTrump && !winnerIsTrump && card.suit === leadSuit) {
      if (getRankValue(card.rank) > getRankValue(winner.rank)) {
        winner = card
        winnerIndex = i
      }
    }
  }
  
  return winnerIndex
}

