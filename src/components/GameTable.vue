<template>
  <div class="game-table-container">
    <div class="game-table">
      <div class="table-center">
        <div class="trick-cards">
          <TransitionGroup name="card-play" tag="div" class="trick-cards-container">
            <div
              v-for="(trickCard, index) in currentTrick"
              :key="`${trickCard.card.id}-${index}`"
              class="trick-card-wrapper animate__animated animate__zoomIn"
              :style="getCardPosition(trickCard, index)"
              :class="`animate__delay-${index * 0.1}s`"
            >
              <Card
                :card="trickCard.card"
                :is-trump="trickCard.card.suit === trumpSuit"
                class="played-card"
              />
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, TransitionGroup } from 'vue'
import Card from './Card.vue'
import '../assets/styles/components/game-table.css'

const props = defineProps({
  currentTrick: {
    type: Array,
    default: () => []
  },
  trumpSuit: {
    type: String,
    default: null
  },
  hiddenCard: {
    type: Object,
    default: null
  },
  trumpRevealed: {
    type: Boolean,
    default: false
  },
  players: {
    type: Array,
    default: () => []
  },
  getPlayerPosition: {
    type: Function,
    default: null
  }
})

function getCardPosition(trickCard, index) {
  const totalCards = props.currentTrick.length
  
  if (totalCards === 1) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10
    }
  }
  
  const radius = totalCards === 2 ? 45 : totalCards === 3 ? 60 : 75
  const angle = (index * (360 / totalCards)) * (Math.PI / 180)
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius
  
  return {
    top: `calc(50% + ${y}px)`,
    left: `calc(50% + ${x}px)`,
    transform: 'translate(-50%, -50%)',
    zIndex: 10 + index
  }
}

</script>

