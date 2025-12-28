<template>
  <div v-if="show" class="loading-overlay" :class="{ 'loading-fullscreen': fullscreen }">
    <div class="loading-spinner">
      <div class="spinner"></div>
      <div v-if="message" class="loading-message">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import '../assets/styles/components/loading-spinner.css'

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
})
</script>

