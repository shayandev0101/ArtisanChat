import { io } from 'socket.io-client'

class SocketManager {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.listeners = new Map()
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket
    }

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'
    
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    })

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id)
      this.isConnected = true
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      this.isConnected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this.isConnected = false
    })

    // Re-register all listeners
    this.listeners.forEach((callback, event) => {
      this.socket.on(event, callback)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    }
  }

  on(event, callback) {
    this.listeners.set(event, callback)
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event) {
    this.listeners.delete(event)
    if (this.socket) {
      this.socket.off(event)
    }
  }

  // Chat methods
  joinChat(chatId) {
    this.emit('join_chat', chatId)
  }

  leaveChat(chatId) {
    this.emit('leave_chat', chatId)
  }

  sendMessage(data) {
    this.emit('send_message', data)
  }

  startTyping(chatId) {
    this.emit('typing_start', chatId)
  }

  stopTyping(chatId) {
    this.emit('typing_stop', chatId)
  }

  markSeen(data) {
    this.emit('mark_seen', data)
  }

  // Portfolio methods
  likePortfolio(data) {
    this.emit('portfolio_like', data)
  }

  // Task methods
  updateTask(data) {
    this.emit('task_update', data)
  }

  // Group methods
  inviteToGroup(data) {
    this.emit('group_invite', data)
  }
}

export const socketManager = new SocketManager()
export default socketManager