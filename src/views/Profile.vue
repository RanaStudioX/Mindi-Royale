<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="profile-header glass-panel">
        <div class="profile-avatar">
          <div class="avatar-circle" :style="{ background: profileIcon.color.bg, color: profileIcon.color.text }">
            {{ profileIcon.icon }}
          </div>
        </div>
        <div class="profile-info">
          <h2>{{ userDisplayName }}</h2>
          <p class="user-email" v-if="!authStore.user?.isGuest">{{ authStore.user?.email }}</p>
          <p class="user-type" v-if="authStore.user?.isGuest">Guest Player</p>
        </div>
        <div class="profile-actions">
          <router-link to="/menu" class="btn btn-secondary">Back to Menu</router-link>
          <button @click="handleSignOut" class="btn btn-secondary" v-if="!authStore.user?.isGuest">Sign Out</button>
        </div>
      </div>
      
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card glass-panel">
            <div class="stat-icon">🎮</div>
            <div class="stat-value">{{ stats.gamesPlayed }}</div>
            <div class="stat-label">Games Played</div>
          </div>
          
          <div class="stat-card glass-panel">
            <div class="stat-icon">🏆</div>
            <div class="stat-value">{{ stats.gamesWon }}</div>
            <div class="stat-label">Games Won</div>
          </div>
          
          <div class="stat-card glass-panel">
            <div class="stat-icon">⭐</div>
            <div class="stat-value">{{ winRate }}%</div>
            <div class="stat-label">Win Rate</div>
          </div>
          
          <div class="stat-card glass-panel">
            <div class="stat-icon">🎯</div>
            <div class="stat-value">{{ stats.totalTricks }}</div>
            <div class="stat-label">Total Tricks</div>
          </div>
          
          <div class="stat-card glass-panel">
            <div class="stat-icon">💎</div>
            <div class="stat-value">{{ stats.mendikotWins }}</div>
            <div class="stat-label">Mendikot Wins</div>
          </div>
          
          <div class="stat-card glass-panel">
            <div class="stat-icon">⚡</div>
            <div class="stat-value">{{ stats.whitewashWins }}</div>
            <div class="stat-label">Whitewash Wins</div>
          </div>
          
          <div class="stat-card glass-panel">
            <div class="stat-icon">🔥</div>
            <div class="stat-value">{{ stats.longestWinStreak }}</div>
            <div class="stat-label">Best Streak</div>
          </div>
        </div>
      </div>
      
      <div class="achievements-section glass-panel">
        <h3>Achievements</h3>
        <div class="achievements-grid">
          <div 
            v-for="achievement in achievements" 
            :key="achievement.id"
            class="achievement-badge"
            :class="{ 'unlocked': achievement.unlocked }"
          >
            <div class="achievement-icon">{{ achievement.icon }}</div>
            <div class="achievement-name">{{ achievement.name }}</div>
            <div class="achievement-desc">{{ achievement.description }}</div>
          </div>
        </div>
      </div>
      
      <div class="history-section glass-panel">
        <h3>Match History</h3>
        <div v-if="matchHistory.length === 0" class="empty-history">
          <p>No match history yet. Start playing to see your games!</p>
        </div>
        <div v-else class="history-list">
          <div
            v-for="(match, index) in matchHistory"
            :key="index"
            class="history-item"
          >
            <div class="match-date">{{ formatDate(match.date) }}</div>
            <div class="match-result" :class="{ 'won': match.won, 'lost': !match.won }">
              {{ match.won ? 'Won' : 'Lost' }}
            </div>
            <div class="match-score">{{ match.score }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'
import { getProfileIcon } from '../utils/profileIcons.js'

const router = useRouter()
const authStore = useAuthStore()

const stats = ref({
  gamesPlayed: 0,
  gamesWon: 0,
  totalTricks: 0,
  mendikotWins: 0,
  whitewashWins: 0,
  bestRound: 0,
  totalTens: 0,
  winStreak: 0,
  longestWinStreak: 0
})

const matchHistory = ref([])
const achievements = ref([])

const userDisplayName = computed(() => {
  return authStore.user?.displayName || 'Guest Player'
})

const profileIcon = computed(() => {
  const userId = authStore.user?.uid || authStore.user?.id
  return getProfileIcon(userId, userDisplayName.value)
})

const winRate = computed(() => {
  if (stats.value.gamesPlayed === 0) return 0
  return Math.round((stats.value.gamesWon / stats.value.gamesPlayed) * 100)
})

function formatDate(timestamp) {
  if (!timestamp) return 'N/A'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString()
}

async function handleSignOut() {
  await authStore.signOut()
  router.push('/')
}

function loadStats() {
  if (authStore.user?.isGuest) {
    const savedStats = localStorage.getItem('guestStats')
    if (savedStats) {
      stats.value = { ...stats.value, ...JSON.parse(savedStats) }
    }
    
    const savedHistory = localStorage.getItem('guestHistory')
    if (savedHistory) {
      matchHistory.value = JSON.parse(savedHistory)
    }
  }
  
  checkAchievements()
}

function checkAchievements() {
  const allAchievements = [
    { id: 'first_win', icon: '🎉', name: 'First Victory', description: 'Win your first game', unlocked: stats.value.gamesWon > 0 },
    { id: 'mendikot_master', icon: '💎', name: 'Mendikot Master', description: 'Win 5 Mendikot games', unlocked: stats.value.mendikotWins >= 5 },
    { id: 'whitewash_king', icon: '⚡', name: 'Whitewash King', description: 'Win 3 Whitewash games', unlocked: stats.value.whitewashWins >= 3 },
    { id: 'win_streak', icon: '🔥', name: 'On Fire', description: 'Win streak of 5 games', unlocked: stats.value.longestWinStreak >= 5 },
    { id: 'century', icon: '🎯', name: 'Century Club', description: 'Win 100 tricks total', unlocked: stats.value.totalTricks >= 100 },
    { id: 'perfect_round', icon: '⭐', name: 'Perfect Round', description: 'Win a round with 13 tricks', unlocked: stats.value.bestRound >= 13 },
    { id: 'veteran', icon: '🏆', name: 'Veteran Player', description: 'Play 50 games', unlocked: stats.value.gamesPlayed >= 50 },
    { id: 'champion', icon: '👑', name: 'Champion', description: 'Win 25 games', unlocked: stats.value.gamesWon >= 25 }
  ]
  
  achievements.value = allAchievements
}

loadStats()
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 40px 20px;
}

.profile-container {
  max-width: 1000px;
  margin: 0 auto;
}

.profile-header {
  padding: 40px;
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.profile-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border: 4px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.avatar-circle:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}

.profile-info {
  flex: 1;
  min-width: 200px;
}

.profile-info h2 {
  font-size: 32px;
  margin-bottom: 8px;
}

.user-email {
  color: var(--text-secondary);
  font-size: 16px;
}

.user-type {
  color: var(--accent-blue);
  font-size: 14px;
  font-weight: 600;
}

.profile-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stats-section {
  margin-bottom: 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.stat-card {
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.stat-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--accent-gold);
  margin-bottom: 8px;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.history-section {
  padding: 40px;
}

.history-section h3 {
  margin-bottom: 24px;
  font-size: 24px;
}

.empty-history {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid var(--glass-border);
}

.match-date {
  color: var(--text-secondary);
  font-size: 14px;
}

.match-result {
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.match-result.won {
  background: rgba(46, 204, 113, 0.2);
  color: var(--accent-green);
}

.match-result.lost {
  background: rgba(231, 76, 60, 0.2);
  color: var(--accent-red);
}

.match-score {
  color: var(--text-primary);
  font-weight: 600;
}

.achievements-section {
  padding: 40px;
  margin-bottom: 40px;
}

.achievements-section h3 {
  margin-bottom: 24px;
  font-size: 24px;
  color: var(--accent-gold);
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.achievement-badge {
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
  opacity: 0.4;
  filter: grayscale(1);
}

.achievement-badge.unlocked {
  opacity: 1;
  filter: grayscale(0);
  border-color: var(--accent-gold);
  background: rgba(212, 175, 55, 0.1);
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.2);
}

.achievement-badge:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.achievement-badge.unlocked:hover {
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4);
}

.achievement-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.achievement-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.achievement-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-actions {
    width: 100%;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .history-item {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>

