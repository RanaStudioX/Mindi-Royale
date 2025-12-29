<template>
  <div :class="['player-area', `position-${position}`, { 'is-current-turn': isCurrentTurn, 'is-winner': isWinner }]">
    <div class="player-info">
      <div class="player-avatar-icon" 
           :style="{ background: profileIcon.color.bg, color: profileIcon.color.text }">
        {{ profileIcon.icon }}
      </div>
      <div class="player-info-content">
        <div class="player-name">{{ player.name }}</div>
        <div class="player-stats">
          <div class="tricks-counter">
            <div class="trick-cards-display">
              <div 
                v-for="n in Math.min(tricksWon, 13)" 
                :key="n"
                class="trick-card-icon"
                :style="{ animationDelay: `${n * 0.1}s` }"
              >
                <i class="bi bi-suit-spade-fill"></i>
              </div>
            </div>
            <div class="tricks-count-wrapper">
              <span class="tricks-number" :key="tricksWon">{{ tricksWon }}</span>
              <span class="tricks-label">tricks</span>
            </div>
          </div>
          <span class="team-badge" :class="`team-${getTeamNumber()}`">T{{ getTeamNumber() }}</span>
        </div>
        <div v-if="isCurrentTurn" class="turn-indicator">
          <span v-if="player.isAI" class="d-flex align-items-center thinking-container">
            <div class="thinking-orb">
              <div class="orb-core"></div>
              <div class="orb-ring orb-ring-1"></div>
              <div class="orb-ring orb-ring-2"></div>
              <div class="orb-ring orb-ring-3"></div>
              <div class="orb-particle orb-particle-1"></div>
              <div class="orb-particle orb-particle-2"></div>
              <div class="orb-particle orb-particle-3"></div>
            </div>
          </span>
          <span v-else class="d-flex align-items-center">
            <span class="pulse-dot me-1"></span>
            <span>Your Turn</span>
          </span>
        </div>
      </div>
    </div>
    <div v-if="showActualCards && actualCards && actualCards.length > 0" class="player-cards">
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
        :style="{ transform: `rotate(${(index - actualCards.length / 2) * 1}deg)` }"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref, nextTick } from 'vue'
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
  }
})

function onCardClick(card) {
  if (!props.handleCardClick) return
  props.handleCardClick(card)
}

const profileIcon = computed(() => {
  return getProfileIcon(props.player.id, props.player.name)
})

function getTeamNumber() {
  const playerIndex = parseInt(props.player.id?.split('-')[1]) || 0
  return playerIndex % 2 === 0 ? 1 : 2
}

const prevTricks = ref(props.tricksWon)
watch(() => props.tricksWon, (newTricks, oldTricks) => {
  if (newTricks > oldTricks) {
    nextTick(() => {
      const counter = document.querySelector(`.player-area.position-${props.position} .tricks-counter`)
      if (counter) {
        counter.classList.add('trick-celebration')
        setTimeout(() => {
          counter.classList.remove('trick-celebration')
        }, 1000)
      }
    })
  }
  prevTricks.value = newTricks
})
</script>

