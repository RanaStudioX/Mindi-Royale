const profileIcons = [
  '🃏', '👑', '🎯', '⚡', '🔥', '💎', '🌟', '🎲',
  '🎪', '🎭', '🎨', '🎸', '🎺', '🎻', '🥇', '🏅',
  '🎖️', '⭐', '✨', '💫', '🌙', '☀️', '🌈', '🌠',
  '🎊', '🎉', '🎈', '🎁', '🎀', '🎂', '🍀', '🌺'
]

const iconColors = [
  { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', text: '#1a1a1a' },
  { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', text: '#1a1a1a' },
  { bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', text: '#1a1a1a' },
  { bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', text: '#1a1a1a' },
  { bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', text: '#1a1a1a' },
  { bg: 'linear-gradient(135deg, #ff8a80 0%, #ea6100 100%)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', text: '#1a1a1a' },
  { bg: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', text: '#1a1a1a' }
]

export function getProfileIcon(playerId, playerName) {
  if (!playerId && !playerName) return { icon: '🃏', color: iconColors[0] }
  
  const seed = playerId ? hashString(playerId) : hashString(playerName || '')
  const iconIndex = seed % profileIcons.length
  const colorIndex = seed % iconColors.length
  
  return {
    icon: profileIcons[iconIndex],
    color: iconColors[colorIndex]
  }
}

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function getPlayerInitial(name) {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

