class SoundManager {
  constructor() {
    this.enabled = true
    this.audioContext = null
    this.sounds = {}
    this.init()
  }

  init() {
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
      this.audioContext = new (AudioContext || webkitAudioContext)()
    }
  }

  playSound(type) {
    if (!this.enabled || !this.audioContext) return

    const frequencies = {
      deal: [200, 250, 300],
      play: [400, 450],
      win: [500, 600, 700],
      shuffle: [150, 200, 250, 300]
    }

    const freq = frequencies[type] || [300]
    const now = this.audioContext.currentTime
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    if (type === 'deal' || type === 'shuffle') {
      freq.forEach((f, i) => {
        const osc = this.audioContext.createOscillator()
        const gain = this.audioContext.createGain()
        osc.connect(gain)
        gain.connect(this.audioContext.destination)
        osc.frequency.value = f
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.1, now + i * 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2)
        osc.start(now + i * 0.1)
        osc.stop(now + i * 0.1 + 0.2)
      })
    } else {
      oscillator.frequency.value = freq[0]
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.1, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
      oscillator.start(now)
      oscillator.stop(now + 0.2)
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled
  }
}

export const soundManager = new SoundManager()

