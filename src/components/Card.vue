<template>
  <div
    :class="['playing-card', { 'card-selected': isSelected, 'card-playable': isPlayable, 'card-disabled': isDisabled, 'card-face-down': isFaceDown }]"
    @click="handleClick"
    :style="cardStyle"
  >
    <div class="card-inner" v-if="!isFaceDown">
      <div class="card-rank-top">{{ card.rank }}</div>
      <div class="card-suit-center" :class="`suit-${card.suit}`">
        <span v-if="card.suit === 'hearts'">♥</span>
        <span v-else-if="card.suit === 'diamonds'">♦</span>
        <span v-else-if="card.suit === 'spades'">♠</span>
        <span v-else-if="card.suit === 'clubs'">♣</span>
      </div>
      <div class="card-rank-bottom">{{ card.rank }}</div>
    </div>
    <div class="card-back" v-else>
      <div class="card-back-pattern"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  card: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isPlayable: {
    type: Boolean,
    default: false
  },
  isDisabled: {
    type: Boolean,
    default: false
  },
  isTrump: {
    type: Boolean,
    default: false
  },
  isFaceDown: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const cardStyle = computed(() => {
  const styles = {}
  if (props.isTrump) {
    styles.border = '2px solid var(--accent-gold)'
    styles.boxShadow = '0 0 15px rgba(212, 175, 55, 0.5)'
  }
  return styles
})

function handleClick() {
  if (props.isDisabled) {
    return
  }
  emit('click', props.card)
}
</script>

<style scoped>
.playing-card {
  width: 85px;
  height: 119px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%);
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 6px 12px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  user-select: none;
  margin: 0;
  border: 2px solid rgba(0, 0, 0, 0.15);
  backface-visibility: hidden;
  transform-style: preserve-3d;
  flex-shrink: 0;
  flex-grow: 0;
}

.playing-card:hover:not(.card-disabled) {
  transform: translateY(-16px) scale(1.12);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.card-selected {
  transform: translateY(-16px) scale(1.1);
  box-shadow: 0 0 25px rgba(74, 144, 226, 0.8);
  border: 2px solid var(--accent-blue);
}

.card-playable {
  border: 3px solid var(--accent-green) !important;
  box-shadow: 0 0 20px rgba(46, 204, 113, 0.7), 0 6px 12px rgba(0, 0, 0, 0.4) !important;
  animation: pulse 2s infinite;
  cursor: pointer !important;
}

.card-disabled {
  opacity: 0.4;
  cursor: not-allowed !important;
  filter: grayscale(0.6);
  transform: scale(0.95);
}

.card-disabled:hover {
  transform: scale(0.95) !important;
}

.card-face-down {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  cursor: pointer;
}

.card-face-down:hover:not(.card-disabled) {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
}

.card-face-down .card-inner {
  display: none;
}

.card-face-down .card-back {
  display: block;
}

.card-back {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
}

.card-back-pattern {
  width: 100%;
  height: 100%;
  background: 
    repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.1) 0px,
      rgba(255, 255, 255, 0.1) 2px,
      transparent 2px,
      transparent 8px
    ),
    repeating-linear-gradient(
      -45deg,
      rgba(255, 255, 255, 0.1) 0px,
      rgba(255, 255, 255, 0.1) 2px,
      transparent 2px,
      transparent 8px
    );
  position: relative;
}

.card-back-pattern::before {
  content: '🃏';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  opacity: 0.3;
}

.card-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px;
  color: #1a1a1a;
  font-weight: bold;
}

.card-rank-top,
.card-rank-bottom {
  font-size: 16px;
  line-height: 1;
}

.card-rank-bottom {
  transform: rotate(180deg);
}

.card-suit-center {
  font-size: 32px;
  text-align: center;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.suit-hearts,
.suit-diamonds {
  color: #e74c3c;
}

.suit-spades,
.suit-clubs {
  color: #1a1a1a;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(46, 204, 113, 0.7), 0 6px 12px rgba(0, 0, 0, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(46, 204, 113, 1), 0 8px 16px rgba(0, 0, 0, 0.5);
  }
}

@media (max-width: 768px) {
  .playing-card {
    width: 60px;
    height: 84px;
  }
  
  .card-rank-top,
  .card-rank-bottom {
    font-size: 12px;
  }
  
  .card-suit-center {
    font-size: 24px;
  }
}
</style>

