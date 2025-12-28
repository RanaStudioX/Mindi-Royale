<template>
  <div class="game-table-container">
    <div class="game-table">
      <div class="table-center">
        <div class="trick-cards">
          <TransitionGroup name="card-play" tag="div" class="trick-cards-container">
            <div
              v-for="(trickCard, index) in currentTrick"
              :key="`${trickCard.card.id}-${index}`"
              class="trick-card-wrapper"
              :style="getCardPosition(trickCard, index)"
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
  if (!props.getPlayerPosition || trickCard.playerIndex === undefined || trickCard.playerIndex === null) {
    return getDefaultPosition(index, props.currentTrick.length)
  }
  
  const position = props.getPlayerPosition(trickCard.playerIndex)
  const offset = 80
  
  let top = '50%'
  let left = '50%'
  let x = 0
  let y = 0
  
  switch (position) {
    case 'top':
      y = -offset
      x = 0
      break
    case 'right':
      x = offset
      y = 0
      break
    case 'bottom':
      y = offset
      x = 0
      break
    case 'left':
      x = -offset
      y = 0
      break
    default:
      return getDefaultPosition(index, props.currentTrick.length)
  }
  
  return {
    top: `calc(50% + ${y}px)`,
    left: `calc(50% + ${x}px)`,
    transform: 'translate(-50%, -50%)',
    zIndex: 10 + index
  }
}

function getDefaultPosition(index, totalCards) {
  if (totalCards === 1) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10
    }
  }
  
  const angle = (index * (360 / totalCards)) * (Math.PI / 180)
  const radius = totalCards === 2 ? 40 : totalCards === 3 ? 50 : 60
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

<style scoped>
.game-table-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 80rem);
  height: calc(100% - 300px);
  min-width: 500px;
  min-height: 400px;
  max-width: 800px;
  max-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
}

.game-table {
  width: 100%;
  height: 100%;
  aspect-ratio: 1.4;
  background: linear-gradient(135deg, #1a3a2e 0%, #0f251f 50%, #0a1f1a 100%);
  border: 8px solid #2d4a3a;
  border-radius: 12px;
  position: relative;
  box-shadow: 
    inset 0 0 120px rgba(0, 0, 0, 0.8),
    0 10px 40px rgba(0, 0, 0, 0.7),
    0 0 0 3px rgba(212, 175, 55, 0.2),
    inset 0 2px 6px rgba(255, 255, 255, 0.08);
}

.game-table::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 8px;
  background: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 20px,
      rgba(255, 255, 255, 0.02) 20px,
      rgba(255, 255, 255, 0.02) 21px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 20px,
      rgba(255, 255, 255, 0.02) 20px,
      rgba(255, 255, 255, 0.02) 21px
    );
  pointer-events: none;
}

.game-table::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 80%;
  background: rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

.table-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 75%;
  height: 75%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  z-index: 1;
}


.trick-cards {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trick-cards-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.trick-card-wrapper {
  position: absolute;
  z-index: 5;
}

.played-card {
  animation: cardPlay 1s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center;
  animation-fill-mode: both;
}

@keyframes cardPlay {
  0% {
    transform: translate(-50%, -50%) scale(0.3) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.15) rotate(10deg);
  }
  100% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    opacity: 1;
  }
}

.card-play-enter-active {
  transition: all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-play-enter-from {
  transform: translate(-50%, -50%) scale(0.3) rotate(-180deg);
  opacity: 0;
}

.card-play-enter-to {
  transform: translate(-50%, -50%) scale(1) rotate(0deg);
  opacity: 1;
}

.card-play-leave-active {
  transition: all 0.8s ease-in;
  transition-delay: 0.5s;
}

.card-play-leave-from {
  transform: translate(-50%, -50%) scale(1) rotate(0deg);
  opacity: 1;
}

.card-play-leave-to {
  transform: translate(-50%, -50%) scale(0.5) rotate(180deg);
  opacity: 0;
}

.card-play-move {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.trick-card-wrapper {
  transition: all 0.6s ease;
}

@media (max-width: 768px) {
  .game-table {
    width: 95%;
  }
  
  .trump-suit {
    font-size: 24px;
  }
}
</style>

