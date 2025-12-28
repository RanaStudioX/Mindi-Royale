import { ref, onValue, set, get, remove, push } from 'firebase/database'
import { realtimeDb, isFirebaseConfigured } from '../config/firebase.js'
import { localMultiplayerService } from './localMultiplayer.js'

class RoomService {
  constructor() {
    this.rooms = new Map()
    this.listeners = new Map()
    this.useFirebase = false
    this.firebaseTested = false
    
    this.testFirebaseConnection()
  }

  async testFirebaseConnection() {
    if (!isFirebaseConfigured || !realtimeDb) {
      this.useFirebase = false
      this.firebaseTested = true
      return
    }

    try {
      const testRef = ref(realtimeDb, 'test_connection')
      
      const testPromise = set(testRef, { test: Date.now() })
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
      
      await Promise.race([testPromise, timeoutPromise])
      
      const removePromise = remove(testRef)
      const removeTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Remove timeout')), 3000)
      )
      await Promise.race([removePromise, removeTimeout])
      
      this.useFirebase = true
    } catch (error) {
      this.useFirebase = false
    } finally {
      this.firebaseTested = true
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
    if (!this.firebaseTested) {
      await this.testFirebaseConnection()
    }

    if (this.useFirebase && realtimeDb) {
      try {
        const roomCode = this.generateRoomCode()
        const roomId = `room_${roomCode}`
        const roomData = {
          code: roomCode,
          hostId: hostPlayer.id,
          players: [hostPlayer],
          status: 'waiting',
          createdAt: Date.now(),
          gameState: null
        }
        const roomRef = ref(realtimeDb, `rooms/${roomId}`)
        
        const setPromise = set(roomRef, roomData)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firebase write timeout')), 8000)
        )
        
        await Promise.race([setPromise, timeoutPromise])
        return { roomCode, roomId }
      } catch (error) {
        this.useFirebase = false
        return await localMultiplayerService.createRoom(hostPlayer)
      }
    } else {
      return await localMultiplayerService.createRoom(hostPlayer)
    }
  }

  async joinRoom(roomCode, player) {
    if (!this.firebaseTested) {
      await this.testFirebaseConnection()
    }

    if (this.useFirebase && realtimeDb) {
      try {
        const roomId = `room_${roomCode}`
        const roomRef = ref(realtimeDb, `rooms/${roomId}`)
        const snapshot = await get(roomRef)
        if (!snapshot.exists()) {
          throw new Error('Room not found')
        }
        const roomData = snapshot.val()

        if (roomData.players.length >= 4) {
          throw new Error('Room is full')
        }

        if (roomData.players.find(p => p.id === player.id)) {
          throw new Error('Already in room')
        }

        roomData.players.push(player)
        await set(roomRef, roomData)
        return roomData
      } catch (error) {
        if (error.message.includes('permission') || error.message.includes('database')) {
          return await localMultiplayerService.joinRoom(roomCode, player)
        }
        throw error
      }
    } else {
      return await localMultiplayerService.joinRoom(roomCode, player)
    }
  }

  async leaveRoom(roomCode, playerId) {
    if (this.useFirebase) {
      const roomId = `room_${roomCode}`
      const roomRef = ref(realtimeDb, `rooms/${roomId}`)
      const snapshot = await get(roomRef)
      if (!snapshot.exists()) return

      const roomData = snapshot.val()
      roomData.players = roomData.players.filter(p => p.id !== playerId)

      if (roomData.players.length === 0) {
        await remove(roomRef)
      } else {
        if (roomData.hostId === playerId && roomData.players.length > 0) {
          roomData.hostId = roomData.players[0].id
          roomData.players[0].isHost = true
        }
        await set(roomRef, roomData)
      }
    } else {
      await localMultiplayerService.leaveRoom(roomCode, playerId)
    }
  }

  subscribeToRoom(roomCode, callback) {
    if (!this.firebaseTested) {
      this.testFirebaseConnection()
    }

    if (this.useFirebase && realtimeDb) {
      try {
        const roomId = `room_${roomCode}`
        const roomRef = ref(realtimeDb, `rooms/${roomId}`)
        const unsubscribe = onValue(roomRef, (snapshot) => {
          if (snapshot.exists()) {
            callback(snapshot.val())
          } else {
            callback(null)
          }
        }, (error) => {
          this.useFirebase = false
          localMultiplayerService.subscribeToRoom(roomCode, callback)
        })
        this.listeners.set(roomCode, unsubscribe)
        return unsubscribe
      } catch (error) {
        this.useFirebase = false
        return localMultiplayerService.subscribeToRoom(roomCode, callback)
      }
    } else {
      return localMultiplayerService.subscribeToRoom(roomCode, callback)
    }
  }

  unsubscribeFromRoom(roomCode) {
    if (this.useFirebase && realtimeDb) {
      try {
        const unsubscribe = this.listeners.get(roomCode)
        if (unsubscribe) {
          unsubscribe()
          this.listeners.delete(roomCode)
        }
      } catch (error) {
      }
    }
    localMultiplayerService.unsubscribeFromRoom(roomCode)
  }

  async updateRoomStatus(roomCode, status, gameState = null) {
    if (this.useFirebase) {
      const roomId = `room_${roomCode}`
      const roomRef = ref(realtimeDb, `rooms/${roomId}`)
      const snapshot = await get(roomRef)
      if (!snapshot.exists()) return

      const roomData = snapshot.val()
      roomData.status = status
      if (gameState) {
        roomData.gameState = gameState
      }
      await set(roomRef, roomData)
    } else {
      await localMultiplayerService.updateRoomStatus(roomCode, status, gameState)
    }
  }

  async getRoom(roomCode) {
    if (this.useFirebase) {
      const roomId = `room_${roomCode}`
      const roomRef = ref(realtimeDb, `rooms/${roomId}`)
      const snapshot = await get(roomRef)
      if (snapshot.exists()) {
        return snapshot.val()
      }
      return null
    } else {
      return await localMultiplayerService.getRoom(roomCode)
    }
  }
}

export const roomService = new RoomService()

