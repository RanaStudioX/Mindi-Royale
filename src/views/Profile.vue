<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="profile-header glass-panel animate__animated animate__fadeInDown">
        <div class="profile-avatar">
          <div class="avatar-circle animate__animated animate__zoomIn" :style="{ background: profileIcon.color.bg, color: profileIcon.color.text }">
            {{ profileIcon.icon }}
          </div>
        </div>
        <div class="profile-info">
          <h2 class="animate__animated animate__fadeInLeft">
            <i class="bi bi-person-circle me-2 text-warning"></i>{{ userDisplayName }}
          </h2>
          <p class="user-email badge bg-info mt-2" v-if="!authStore.user?.isGuest">
            <i class="bi bi-envelope me-2"></i>{{ authStore.user?.email }}
          </p>
          <p class="user-type badge bg-secondary mt-2" v-if="authStore.user?.isGuest">
            <i class="bi bi-person me-2"></i>Guest Player
          </p>
        </div>
        <div class="profile-actions d-flex gap-2 flex-wrap">
          <router-link to="/menu" class="btn btn-outline-secondary animate__animated animate__fadeIn">
            <i class="bi bi-arrow-left me-2"></i>Back to Menu
          </router-link>
          <button @click="handleSignOut" class="btn btn-outline-danger animate__animated animate__fadeIn" v-if="!authStore.user?.isGuest">
            <i class="bi bi-box-arrow-right me-2"></i>Sign Out
          </button>
        </div>
      </div>
      
      <div class="stats-section">
        <div class="stats-grid row g-3">
          <div class="col-md-4 col-sm-6">
            <div class="stat-card glass-panel animate__animated animate__fadeInUp">
              <div class="stat-icon fs-1 mb-3">🎮</div>
              <div class="stat-value badge bg-primary fs-3 mb-2">{{ stats.gamesPlayed }}</div>
              <div class="stat-label text-uppercase small">Games Played</div>
            </div>
          </div>
          
          <div class="col-md-4 col-sm-6">
            <div class="stat-card glass-panel animate__animated animate__fadeInUp">
              <div class="stat-icon fs-1 mb-3">🏆</div>
              <div class="stat-value badge bg-success fs-3 mb-2">{{ stats.gamesWon }}</div>
              <div class="stat-label text-uppercase small">Games Won</div>
            </div>
          </div>
          
          <div class="col-md-4 col-sm-6">
            <div class="stat-card glass-panel animate__animated animate__fadeInUp">
              <div class="stat-icon fs-1 mb-3">⭐</div>
              <div class="stat-value badge bg-warning fs-3 mb-2">{{ winRate }}%</div>
              <div class="stat-label text-uppercase small">Win Rate</div>
            </div>
          </div>
          
          <div class="col-md-4 col-sm-6">
            <div class="stat-card glass-panel animate__animated animate__fadeInUp">
              <div class="stat-icon fs-1 mb-3">🎯</div>
              <div class="stat-value badge bg-info fs-3 mb-2">{{ stats.totalTricks }}</div>
              <div class="stat-label text-uppercase small">Total Tricks</div>
            </div>
          </div>
          
          <div class="col-md-4 col-sm-6">
            <div class="stat-card glass-panel animate__animated animate__fadeInUp">
              <div class="stat-icon fs-1 mb-3">💎</div>
              <div class="stat-value badge bg-warning fs-3 mb-2">{{ stats.mendikotWins }}</div>
              <div class="stat-label text-uppercase small">Mendikot Wins</div>
            </div>
          </div>
          
          <div class="col-md-4 col-sm-6">
            <div class="stat-card glass-panel animate__animated animate__fadeInUp">
              <div class="stat-icon fs-1 mb-3">⚡</div>
              <div class="stat-value badge bg-primary fs-3 mb-2">{{ stats.whitewashWins }}</div>
              <div class="stat-label text-uppercase small">Whitewash Wins</div>
            </div>
          </div>
          
          <div class="col-md-4 col-sm-6">
            <div class="stat-card glass-panel animate__animated animate__fadeInUp">
              <div class="stat-icon fs-1 mb-3">🔥</div>
              <div class="stat-value badge bg-danger fs-3 mb-2">{{ stats.longestWinStreak }}</div>
              <div class="stat-label text-uppercase small">Best Streak</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="achievements-section glass-panel animate__animated animate__fadeInUp">
        <h3 class="mb-4">
          <i class="bi bi-trophy-fill text-warning me-2"></i>Achievements
        </h3>
        <div class="achievements-grid row g-3">
          <div 
            v-for="(achievement, index) in achievements" 
            :key="achievement.id"
            class="col-md-4 col-sm-6"
          >
            <div 
              class="achievement-badge card h-100 animate__animated animate__fadeInUp"
              :class="{ 'unlocked border-warning': achievement.unlocked, 'border-secondary': !achievement.unlocked }"
              :style="`animation-delay: ${index * 0.1}s`"
            >
              <div class="card-body text-center">
                <div class="achievement-icon fs-1 mb-3">{{ achievement.icon }}</div>
                <div class="achievement-name fw-bold mb-2">{{ achievement.name }}</div>
                <div class="achievement-desc small text-muted">{{ achievement.description }}</div>
                <div v-if="achievement.unlocked" class="badge bg-warning text-dark mt-2">
                  <i class="bi bi-check-circle-fill me-1"></i>Unlocked
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="history-section glass-panel animate__animated animate__fadeInUp">
        <h3 class="mb-4">
          <i class="bi bi-clock-history me-2 text-info"></i>Match History
        </h3>
        <div v-if="matchHistory.length === 0" class="empty-history text-center py-5">
          <i class="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
          <p class="text-muted">No match history yet. Start playing to see your games!</p>
        </div>
        <div v-else class="history-list">
          <div
            v-for="(match, index) in matchHistory"
            :key="index"
            class="history-item list-group-item d-flex justify-content-between align-items-center animate__animated animate__fadeInLeft"
            :style="`animation-delay: ${index * 0.05}s`"
          >
            <div class="match-date">
              <i class="bi bi-calendar me-2"></i>{{ formatDate(match.date) }}
            </div>
            <div class="match-result badge" :class="{ 'bg-success': match.won, 'bg-danger': !match.won }">
              <i class="bi" :class="match.won ? 'bi-trophy-fill' : 'bi-x-circle-fill'"></i>
              {{ match.won ? 'Won' : 'Lost' }}
            </div>
            <div class="match-score badge bg-primary">
              <i class="bi bi-star-fill me-1"></i>{{ match.score }}
            </div>
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
@import '../assets/styles/views/shared-pages.css';

.profile-page {
  min-height: 100vh;
  padding: 40px 20px;
  position: relative;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
}

.profile-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 215, 0, 0.02) 2px, rgba(255, 215, 0, 0.02) 4px),
    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255, 215, 0, 0.02) 2px, rgba(255, 215, 0, 0.02) 4px);
  opacity: 0.3;
  animation: gridMove 20s linear infinite;
  z-index: 0;
  pointer-events: none;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(20px, 20px);
  }
}

.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
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
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(212, 175, 55, 0.3);
  border: 4px solid rgba(255, 215, 0, 0.4);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.avatar-circle::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(255, 215, 0, 0.2) 90deg,
    transparent 180deg,
    rgba(255, 215, 0, 0.2) 270deg,
    transparent 360deg
  );
  animation: avatarRotate 4s linear infinite;
}

@keyframes avatarRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.avatar-circle:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.5),
    0 0 50px rgba(212, 175, 55, 0.5);
  border-color: rgba(255, 215, 0, 0.7);
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
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
  animation: statShimmer 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes statShimmer {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0.6;
  }
}

.stat-card:hover {
  transform: translateY(-12px) scale(1.08);
  box-shadow: 
    0 20px 60px rgba(212, 175, 55, 0.4),
    0 0 40px rgba(212, 175, 55, 0.2),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.6);
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
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  opacity: 0.4;
  filter: grayscale(1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.achievement-badge.unlocked {
  opacity: 1;
  filter: grayscale(0);
  border-color: rgba(255, 215, 0, 0.5);
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%);
  box-shadow: 
    0 4px 16px rgba(212, 175, 55, 0.3),
    0 0 30px rgba(212, 175, 55, 0.1);
}

.achievement-badge.unlocked::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(255, 215, 0, 0.1) 90deg,
    transparent 180deg,
    rgba(255, 215, 0, 0.1) 270deg,
    transparent 360deg
  );
  animation: achievementRotate 6s linear infinite;
  pointer-events: none;
}

@keyframes achievementRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.achievement-badge:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.achievement-badge.unlocked:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 12px 32px rgba(212, 175, 55, 0.5);
  border-color: var(--accent-gold) !important;
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

