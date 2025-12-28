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

function handleClick() {
  if (props.isDisabled) {
    return
  }
  emit('click', props.card)
}
</script>


