class LocalMultiplayerService {
  constructor() {
    this.rooms = new Map()
    this.listeners = new Map()
    this.storageKey = 'mindi_royale_rooms'
    this.loadFromStorage()
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        Object.entries(data).forEach(([key, value]) => {
          this.rooms.set(key, value)
        })
      }
    } catch (error) {
    }
  }

  saveToStorage() {
    try {
      const data = Object.fromEntries(this.rooms)
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
    }
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  async createRoom(hostPlayer) {
    try {
      const roomCode = this.generateRoomCode()
      const roomId = `room_${roomCode}`
      const roomData = {
        code: roomCode,
        hostId: hostPlayer.id,
        players: [hostPlayer],
        status: 'waiting',
        createdAt: Date.now(),
        gameState: null,
        lastUpdated: Date.now()
      }

      this.rooms.set(roomId, roomData)
      this.saveToStorage()
      this.broadcastRoomUpdate(roomCode, roomData)

      return { roomCode, roomId }
    } catch (error) {
      throw error
    }
  }

  async joinRoom(roomCode, player) {
    const roomId = `room_${roomCode}`
    const roomData = this.rooms.get(roomId)

    if (!roomData) {
      throw new Error('Room not found. Make sure the room code is correct.')
    }

    if (roomData.players.length >= 4) {
      throw new Error('Room is full (4 players maximum)')
    }

    if (roomData.players.find(p => p.id === player.id)) {
      throw new Error('You are already in this room')
    }

    roomData.players.push(player)
    roomData.lastUpdated = Date.now()
    this.rooms.set(roomId, roomData)
    this.saveToStorage()
    this.broadcastRoomUpdate(roomCode, roomData)

    return roomData
  }

  async leaveRoom(roomCode, playerId) {
    const roomId = `room_${roomCode}`
    const roomData = this.rooms.get(roomId)

    if (!roomData) return

    roomData.players = roomData.players.filter(p => p.id !== playerId)
    roomData.lastUpdated = Date.now()

    if (roomData.players.length === 0) {
      this.rooms.delete(roomId)
    } else {
      if (roomData.hostId === playerId && roomData.players.length > 0) {
        roomData.hostId = roomData.players[0].id
        roomData.players[0].isHost = true
      }
      this.rooms.set(roomId, roomData)
    }

    this.saveToStorage()
    this.broadcastRoomUpdate(roomCode, roomData)
  }

  subscribeToRoom(roomCode, callback) {
    const roomId = `room_${roomCode}`
    
    const checkInterval = setInterval(() => {
      const roomData = this.rooms.get(roomId)
      if (roomData) {
        callback(roomData)
      } else {
        const stored = localStorage.getItem(this.storageKey)
        if (stored) {
          try {
            const allRooms = JSON.parse(stored)
            const data = allRooms[roomId]
            if (data) {
              this.rooms.set(roomId, data)
              callback(data)
            } else {
              callback(null)
            }
          } catch (e) {
            callback(null)
          }
        } else {
          callback(null)
        }
      }
    }, 500)

    const unsubscribe = () => {
      clearInterval(checkInterval)
      this.listeners.delete(roomCode)
    }
    
    this.listeners.set(roomCode, unsubscribe)
    
    const initialData = this.rooms.get(roomId)
    if (initialData) {
      callback(initialData)
    }

    window.addEventListener('mindi-room-update', (e) => {
      if (e.detail.roomCode === roomCode) {
        callback(e.detail.roomData)
      }
    })

    window.addEventListener('mindi-storage-update', () => {
      this.loadFromStorage()
      const data = this.rooms.get(roomId)
      if (data) {
        callback(data)
      }
    })

    return unsubscribe
  }

  unsubscribeFromRoom(roomCode) {
    const unsubscribe = this.listeners.get(roomCode)
    if (unsubscribe) {
      unsubscribe()
      this.listeners.delete(roomCode)
    }
  }

  async updateRoomStatus(roomCode, status, gameState = null) {
    const roomId = `room_${roomCode}`
    const roomData = this.rooms.get(roomId)

    if (!roomData) return

    roomData.status = status
    if (gameState) {
      roomData.gameState = gameState
    }
    roomData.lastUpdated = Date.now()

    this.rooms.set(roomId, roomData)
    this.saveToStorage()
    this.broadcastRoomUpdate(roomCode, roomData)
  }

  async getRoom(roomCode) {
    const roomId = `room_${roomCode}`
    return this.rooms.get(roomId) || null
  }

  broadcastRoomUpdate(roomCode, roomData) {
    window.dispatchEvent(new CustomEvent('mindi-room-update', {
      detail: { roomCode, roomData }
    }))
  }

  cleanupOldRooms() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    for (const [roomId, roomData] of this.rooms.entries()) {
      if (roomData.lastUpdated < oneHourAgo) {
        this.rooms.delete(roomId)
      }
    }
    this.saveToStorage()
  }
}

export const localMultiplayerService = new LocalMultiplayerService()

setInterval(() => {
  localMultiplayerService.cleanupOldRooms()
}, 5 * 60 * 1000)

window.addEventListener('storage', (e) => {
  if (e.key === localMultiplayerService.storageKey) {
    localMultiplayerService.loadFromStorage()
    window.dispatchEvent(new CustomEvent('mindi-storage-update'))
  }
})

