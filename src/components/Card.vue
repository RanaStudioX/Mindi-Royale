<template>
  <div
    :class="['playing-card', { 
      'card-selected': isSelected, 
      'card-playable': isPlayable, 
      'card-disabled': isDisabled, 
      'card-face-down': isFaceDown,
      'card-clicked': isClicked
    }]"
    @click="handleClick"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mouseenter="onMouseEnter"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    :style="cardStyle"
  >
    <span class="ripple-effect" v-if="showRipple"></span>
    <div class="card-inner" v-if="!isFaceDown">
      <div class="card-rank-top">{{ card.rank }}</div>
      <div class="card-suit-center" :class="`suit-${card.suit}`">
        <span v-if="card.suit === 'hearts'" class="suit-icon">♥</span>
        <span v-else-if="card.suit === 'diamonds'" class="suit-icon">♦</span>
        <span v-else-if="card.suit === 'spades'" class="suit-icon">♠</span>
        <span v-else-if="card.suit === 'clubs'" class="suit-icon">♣</span>
      </div>
      <div class="card-rank-bottom">{{ card.rank }}</div>
      <div v-if="isTrump" class="trump-badge">
        <i class="bi bi-star-fill"></i>
      </div>
    </div>
    <div class="card-back" v-else>
      <div class="card-back-pattern"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import '../assets/styles/components/card.css'

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
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'small'].includes(value)
  }
})

const emit = defineEmits(['click'])

const isClicked = ref(false)
const showRipple = ref(false)

const cardStyle = computed(() => {
  const styles = {}
  if (props.isTrump) {
    styles.border = '2px solid var(--accent-gold)'
    styles.boxShadow = '0 0 15px rgba(212, 175, 55, 0.5)'
  }
  if (props.size === 'small') {
    styles['--card-width'] = '3.125rem'
    styles['--card-height'] = '4.375rem'
    styles['--card-border-radius'] = '0.375rem'
    styles['--card-rank-font-size'] = '0.625rem'
    styles['--card-suit-font-size'] = '1.25rem'
    styles['--card-padding'] = '0.125rem 0.25rem'
  } else {
    styles['--card-width'] = '85px'
    styles['--card-height'] = '119px'
    styles['--card-border-radius'] = '12px'
    styles['--card-rank-font-size'] = '16px'
    styles['--card-suit-font-size'] = '32px'
    styles['--card-padding'] = '8px'
  }
  return styles
})

function handleClick(event) {
  if (props.isDisabled) {
    return
  }
  
  // Create ripple effect
  showRipple.value = true
  const card = event.currentTarget
  const rect = card.getBoundingClientRect()
  const ripple = card.querySelector('.ripple-effect')
  
  if (ripple) {
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
  }
  
  // Click animation
  isClicked.value = true
  setTimeout(() => {
    isClicked.value = false
    showRipple.value = false
  }, 300)
  
  emit('click', props.card)
}

function onMouseDown(event) {
  if (!props.isDisabled && props.isPlayable) {
    event.currentTarget.style.transform = 'translateY(-12px) scale(1.08)'
  }
}

function onMouseUp(event) {
  if (!props.isDisabled && props.isPlayable) {
    event.currentTarget.style.transform = ''
  }
}

function onMouseEnter(event) {
  // Card hover effect handled by CSS
}

function onMouseMove(event) {
  if (props.isDisabled) return
  
  const card = event.currentTarget
  const rect = card.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  
  card.style.setProperty('--mouse-x', `${x}%`)
  card.style.setProperty('--mouse-y', `${y}%`)
}

function onMouseLeave(event) {
  event.target.style.transform = ''
  const card = event.currentTarget
  card.style.removeProperty('--mouse-x')
  card.style.removeProperty('--mouse-y')
}
</script>


