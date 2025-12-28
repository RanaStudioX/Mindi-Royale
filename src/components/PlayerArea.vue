<template>
  <div :class="['player-area', `position-${position}`, { 'is-current-turn': isCurrentTurn, 'is-winner': isWinner }]">
    <div class="player-info glass-panel">
      <div class="player-avatar-icon" :style="{ background: profileIcon.color.bg, color: profileIcon.color.text }">
        {{ profileIcon.icon }}
      </div>
      <div class="player-info-content">
        <div class="player-name">{{ player.name }}</div>
        <div class="player-stats">
          <span class="tricks-won">{{ tricksWon }} tricks</span>
          <span class="team-badge" :class="`team-${getTeamNumber()}`">Team {{ getTeamNumber() }}</span>
        </div>
        <div v-if="isCurrentTurn" class="turn-indicator">
          <div class="pulse-dot"></div>
          <span v-if="player.isAI">
            <span class="thinking-spinner"></span>
            Thinking...
          </span>
          <span v-else>Your Turn</span>
        </div>
      </div>
      <div v-if="player.isAI && !hideAIBadge" class="ai-badge">AI</div>
    </div>
    <div v-if="showActualCards && actualCards" class="player-cards">
      <Card
        v-for="(card, index) in actualCards"
        :key="card.id"
        :card="card"
        :is-playable="isCardPlayable ? isCardPlayable(card) : false"
        :is-trump="card.suit === trumpSuit && trumpRevealed"
        :is-disabled="isDisabled"
        :is-face-down="false"
        size="small"
        @click="onCardClick(card)"
        class="player-hand-card"
        :style="{ transform: `rotate(${(index - actualCards.length / 2) * 2}deg)` }"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Card from './Card.vue'
import { getProfileIcon } from '../utils/profileIcons.js'
import '../assets/styles/components/player-area.css'

const props = defineProps({
  player: {
    type: Object,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  isCurrentTurn: {
    type: Boolean,
    default: false
  },
  isWinner: {
    type: Boolean,
    default: false
  },
  tricksWon: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  hideAIBadge: {
    type: Boolean,
    default: false
  },
  showActualCards: {
    type: Boolean,
    default: false
  },
  actualCards: {
    type: Array,
    default: null
  },
  isCardPlayable: {
    type: Function,
    default: null
  },
  handleCardClick: {
    type: Function,
    default: null
  },
  isDisabled: {
    type: Boolean,
    default: false
  },
  trumpSuit: {
    type: String,
    default: null
  },
  trumpRevealed: {
    type: Boolean,
    default: false
  },
  flippedCards: {
    type: Object,
    default: null
  }
})


const profileIcon = computed(() => {
  return getProfileIcon(props.player.id, props.player.name)
})

function getTeamNumber() {
  const playerIndex = parseInt(props.player.id?.split('-')[1]) || 0
  return playerIndex % 2 === 0 ? 1 : 2
}

function onCardClick(card) {
  if (!props.handleCardClick) return
  props.handleCardClick(card)
}
</script>

