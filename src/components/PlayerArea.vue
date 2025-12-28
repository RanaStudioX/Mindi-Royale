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

<style scoped>
.player-area {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  z-index: 20;
}

.position-top {
  top: 0.625rem;
  left: 50%;
  transform: translateX(-50%);
}

.position-bottom {
  bottom: 0.625rem;
  left: 50%;
  transform: translateX(-50%);
}

.position-left {
  left: calc(50% - 40rem);
  top: 50%;
  transform: translateY(-50%);
}

.position-right {
  right: calc(50% - 40rem);
  top: 50%;
  transform: translateY(-50%);
}

.is-current-turn {
  filter: brightness(1.2);
}

.is-current-turn .player-info {
  border-color: var(--accent-gold);
  box-shadow: 0 0 1.5rem rgba(212, 175, 55, 0.5), 0 0.25rem 1.25rem rgba(0, 0, 0, 0.4);
  background: rgba(15, 20, 40, 0.95);
}

.player-info {
  padding: 0.75rem 1.125rem;
  margin-bottom: 0.625rem;
  min-width: 12.5rem;
  max-width: 15rem;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: flex-start;
  flex-wrap: nowrap;
  background: rgba(15, 20, 40, 0.9);
  border: 0.09375rem solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.3), inset 0 0.0625rem 0 rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.player-info:hover {
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0.375rem 1.25rem rgba(0, 0, 0, 0.4);
}

.player-avatar-icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.375rem;
  flex-shrink: 0;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.4), inset 0 0.0625rem 0 rgba(255, 255, 255, 0.2);
  border: 0.15625rem solid rgba(255, 255, 255, 0.25);
  transition: all 0.3s ease;
}

.player-avatar-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 0.375rem 1rem rgba(0, 0, 0, 0.5);
}

.player-info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-start;
}

.player-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  letter-spacing: 0.01875rem;
}

.player-stats {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 0.75rem;
  color: var(--text-secondary);
  gap: 0.5rem;
  flex-wrap: wrap;
}

.team-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 0.625rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.03125rem;
  text-transform: uppercase;
}

.team-1 {
  background: rgba(74, 144, 226, 0.3);
  color: var(--accent-blue);
  border: 0.0625rem solid var(--accent-blue);
}

.team-2 {
  background: rgba(231, 76, 60, 0.3);
  color: #e74c3c;
  border: 0.0625rem solid #e74c3c;
}

.ai-badge {
  position: absolute;
  top: 0.375rem;
  right: 0.375rem;
  background: var(--accent-blue);
  color: white;
  padding: 0.1875rem 0.5rem;
  border-radius: 0.625rem;
  font-size: 0.5625rem;
  font-weight: 600;
  z-index: 10;
}

.turn-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.375rem;
  padding: 0.375rem 0.875rem;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.15) 100%);
  border: 0.09375rem solid var(--accent-gold);
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent-gold);
  box-shadow: 0 0.125rem 0.5rem rgba(212, 175, 55, 0.3);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0.125rem 0.5rem rgba(212, 175, 55, 0.3);
  }
  50% {
    box-shadow: 0 0.25rem 1rem rgba(212, 175, 55, 0.5);
  }
}

.thinking-spinner {
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  border: 0.125rem solid rgba(74, 144, 226, 0.3);
  border-top-color: var(--accent-blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 0.25rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.pulse-dot {
  width: 0.5rem;
  height: 0.5rem;
  background: var(--accent-gold);
  border-radius: 50%;
  animation: pulse-dot 1.5s infinite;
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.player-cards {
  display: flex;
  gap: 0.1875rem;
  perspective: 62.5rem;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.5rem 0.25rem;
  scroll-behavior: smooth;
}


.player-cards::-webkit-scrollbar {
  height: 0.25rem;
}

.player-cards::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.125rem;
}

.player-cards::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.5);
  border-radius: 0.125rem;
}

.player-hand-card {
  width: 3.125rem;
  height: 4.375rem;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 1 !important;
  visibility: visible !important;
}

.player-hand-card :deep(.playing-card) {
  width: 3.125rem !important;
  height: 4.375rem !important;
  border-radius: 0.375rem !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.player-hand-card :deep(.card-inner) {
  display: flex !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.player-hand-card :deep(.card-rank-top),
.player-hand-card :deep(.card-rank-bottom) {
  font-size: 0.625rem !important;
  line-height: 1 !important;
  padding: 0.125rem 0.25rem !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.player-hand-card :deep(.card-suit-center) {
  font-size: 1.25rem !important;
  line-height: 1 !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.player-hand-card:hover:not(.card-disabled) {
  z-index: 10;
}

.player-hand-card:hover:not(.card-disabled) :deep(.playing-card) {
  transform: translateY(-0.5rem) scale(1.1);
}

@media (max-width: 48rem) {
  .player-info {
    min-width: 8.75rem;
    padding: 0.5rem 0.75rem;
  }
  
  .player-name {
    font-size: 0.875rem;
  }
}
</style>

