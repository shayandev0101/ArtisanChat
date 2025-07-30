const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Chat = require('../models/Chat')

// Store active connections
const activeUsers = new Map()

const socketHandler = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error('Authentication error'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
      const user = await User.findById(decoded.userId)
      
      if (!user) {
        return next(new Error('User not found'))
      }

      socket.userId = user._id.toString()
      socket.user = user
      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected`)

    // Add user to active users
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
      lastSeen: new Date()
    })

    // Update user online status
    User.findByIdAndUpdate(socket.userId, { 
      isOnline: true,
      lastSeen: new Date()
    }).exec()

    // Join user to their personal room
    socket.join(`user_${socket.userId}`)

    // Send online users to client
    socket.emit('online_users', Array.from(activeUsers.values()).map(u => ({
      userId: u.user._id,
      username: u.user.username,
      fullName: u.user.fullName,
      profilePicture: u.user.profilePicture,
      lastSeen: u.lastSeen
    })))

    // Broadcast user online status
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      username: socket.user.username,
      fullName: socket.user.fullName,
      profilePicture: socket.user.profilePicture
    })

    // Handle joining chat rooms
    socket.on('join_chat', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId)
        if (!chat || !chat.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Unauthorized to join this chat' })
          return
        }

        socket.join(`chat_${chatId}`)
        console.log(`User ${socket.user.username} joined chat ${chatId}`)
      } catch (error) {
        socket.emit('error', { message: 'Error joining chat' })
      }
    })

    // Handle leaving chat rooms
    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`)
      console.log(`User ${socket.user.username} left chat ${chatId}`)
    })

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, type = 'text', fileUrl, fileName } = data

        const chat = await Chat.findById(chatId)
        if (!chat || !chat.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Unauthorized to send message' })
          return
        }

        // Create new message
        const newMessage = {
          sender: socket.userId,
          content,
          type,
          fileUrl,
          fileName,
          seenBy: [{ user: socket.userId }]
        }

        chat.messages.push(newMessage)
        await chat.updateLastMessage(newMessage)

        // Populate sender info
        await chat.populate('messages.sender', 'username fullName profilePicture')

        const message = chat.messages[chat.messages.length - 1]

        // Send message to all participants in the chat
        io.to(`chat_${chatId}`).emit('new_message', {
          chatId,
          message: {
            _id: message._id,
            sender: message.sender,
            content: message.content,
            type: message.type,
            fileUrl: message.fileUrl,
            fileName: message.fileName,
            createdAt: message.createdAt,
            seenBy: message.seenBy
          }
        })

        // Send notification to offline users
        const offlineParticipants = chat.participants.filter(
          participantId => !activeUsers.has(participantId.toString()) && 
          participantId.toString() !== socket.userId
        )

        // Here you would send push notifications or email notifications
        // to offline participants

      } catch (error) {
        console.error('Send message error:', error)
        socket.emit('error', { message: 'Error sending message' })
      }
    })

    // Handle typing indicators
    socket.on('typing_start', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId)
        if (!chat || !chat.participants.includes(socket.userId)) {
          return
        }

        await chat.addTypingUser(socket.userId)
        
        // Notify other participants
        socket.to(`chat_${chatId}`).emit('user_typing', {
          chatId,
          userId: socket.userId,
          username: socket.user.username
        })
      } catch (error) {
        console.error('Typing start error:', error)
      }
    })

    socket.on('typing_stop', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId)
        if (!chat || !chat.participants.includes(socket.userId)) {
          return
        }

        await chat.removeTypingUser(socket.userId)
        
        // Notify other participants
        socket.to(`chat_${chatId}`).emit('user_stop_typing', {
          chatId,
          userId: socket.userId
        })
      } catch (error) {
        console.error('Typing stop error:', error)
      }
    })

    // Handle message seen status
    socket.on('mark_seen', async (data) => {
      try {
        const { chatId, messageId } = data

        const chat = await Chat.findById(chatId)
        if (!chat || !chat.participants.includes(socket.userId)) {
          return
        }

        const message = chat.messages.id(messageId)
        if (!message) {
          return
        }

        // Add user to seenBy if not already there
        const alreadySeen = message.seenBy.some(
          seen => seen.user.toString() === socket.userId
        )

        if (!alreadySeen) {
          message.seenBy.push({ user: socket.userId })
          await chat.save()

          // Notify other participants
          socket.to(`chat_${chatId}`).emit('message_seen', {
            chatId,
            messageId,
            seenBy: {
              user: socket.userId,
              username: socket.user.username,
              seenAt: new Date()
            }
          })
        }
      } catch (error) {
        console.error('Mark seen error:', error)
      }
    })

    // Handle portfolio likes
    socket.on('portfolio_like', (data) => {
      const { portfolioId, userId, action } = data
      
      // Notify portfolio owner
      if (activeUsers.has(userId)) {
        io.to(`user_${userId}`).emit('portfolio_liked', {
          portfolioId,
          likedBy: {
            userId: socket.userId,
            username: socket.user.username,
            fullName: socket.user.fullName,
            profilePicture: socket.user.profilePicture
          },
          action
        })
      }
    })

    // Handle task updates
    socket.on('task_update', (data) => {
      const { groupId, taskId, update } = data
      
      // Notify group members
      socket.to(`group_${groupId}`).emit('task_updated', {
        taskId,
        update,
        updatedBy: {
          userId: socket.userId,
          username: socket.user.username,
          fullName: socket.user.fullName
        }
      })
    })

    // Handle group invitations
    socket.on('group_invite', (data) => {
      const { userId, groupId, groupName } = data
      
      // Notify invited user
      if (activeUsers.has(userId)) {
        io.to(`user_${userId}`).emit('group_invitation', {
          groupId,
          groupName,
          invitedBy: {
            userId: socket.userId,
            username: socket.user.username,
            fullName: socket.user.fullName,
            profilePicture: socket.user.profilePicture
          }
        })
      }
    })

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.username} disconnected`)

      // Remove from active users
      activeUsers.delete(socket.userId)

      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, { 
        isOnline: false,
        lastSeen: new Date()
      })

      // Broadcast user offline status
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        lastSeen: new Date()
      })

      // Clean up typing indicators for all chats
      try {
        const userChats = await Chat.find({ participants: socket.userId })
        for (const chat of userChats) {
          await chat.removeTypingUser(socket.userId)
          await chat.cleanTypingUsers()
        }
      } catch (error) {
        console.error('Cleanup error:', error)
      }
    })

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  })

  // Clean up typing indicators periodically
  setInterval(async () => {
    try {
      const chats = await Chat.find({ 'typingUsers.0': { $exists: true } })
      for (const chat of chats) {
        await chat.cleanTypingUsers()
      }
    } catch (error) {
      console.error('Periodic cleanup error:', error)
    }
  }, 10000) // Every 10 seconds
}

module.exports = socketHandler