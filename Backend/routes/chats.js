const express = require('express')
const Chat = require('../models/Chat')
const User = require('../models/User')
const auth = require('../middleware/auth')
const { body, validationResult } = require('express-validator')

const router = express.Router()

// @route   GET /api/chats
// @desc    Get user's chats
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const chats = await Chat.find({
      participants: req.user.userId
    })
      .populate('participants', 'username fullName profilePicture isOnline lastSeen')
      .populate('lastMessage.sender', 'username fullName profilePicture')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    // Format chats for frontend
    const formattedChats = chats.map(chat => {
      const otherParticipants = chat.participants.filter(
        p => p._id.toString() !== req.user.userId
      )
      
      return {
        _id: chat._id,
        type: chat.type,
        name: chat.type === 'group' 
          ? chat.name 
          : otherParticipants.map(p => p.fullName).join(', '),
        participants: chat.participants,
        lastMessage: chat.lastMessage,
        updatedAt: chat.updatedAt,
        unreadCount: 0 // TODO: Calculate unread messages
      }
    })

    res.json({
      success: true,
      chats: formattedChats,
      pagination: {
        current: page,
        total: chats.length
      }
    })

  } catch (error) {
    console.error('Get chats error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/chats
// @desc    Create new chat
// @access  Private
router.post('/', auth, [
  body('type').isIn(['private', 'group']).withMessage('Invalid chat type'),
  body('participants').isArray({ min: 1 }).withMessage('At least one participant required'),
  body('name').optional().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { type, participants, name, description } = req.body

    // Add current user to participants if not included
    const allParticipants = [...new Set([req.user.userId, ...participants])]

    // For private chats, check if chat already exists
    if (type === 'private' && allParticipants.length === 2) {
      const existingChat = await Chat.findOne({
        type: 'private',
        participants: { $all: allParticipants, $size: 2 }
      })

      if (existingChat) {
        return res.json({
          success: true,
          message: 'Chat already exists',
          chat: existingChat
        })
      }
    }

    // Verify all participants exist
    const users = await User.find({ _id: { $in: allParticipants } })
    if (users.length !== allParticipants.length) {
      return res.status(400).json({
        success: false,
        message: 'Some participants not found'
      })
    }

    const chat = new Chat({
      type,
      participants: allParticipants,
      name: type === 'group' ? name : undefined,
      description: type === 'group' ? description : undefined,
      admins: type === 'group' ? [req.user.userId] : undefined
    })

    await chat.save()
    await chat.populate('participants', 'username fullName profilePicture isOnline lastSeen')

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      chat
    })

  } catch (error) {
    console.error('Create chat error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/chats/:chatId/messages
// @desc    Get chat messages
// @access  Private
router.get('/:chatId/messages', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query
    const { chatId } = req.params

    const chat = await Chat.findById(chatId)
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      })
    }

    // Check if user is participant
    if (!chat.participants.includes(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    // Get messages with pagination
    const messages = chat.messages
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice((page - 1) * limit, page * limit)
      .reverse()

    // Populate sender info
    await chat.populate('messages.sender', 'username fullName profilePicture')

    res.json({
      success: true,
      messages: messages,
      pagination: {
        current: page,
        total: Math.ceil(chat.messages.length / limit),
        hasMore: chat.messages.length > page * limit
      }
    })

  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/chats/:chatId/messages
// @desc    Send message
// @access  Private
router.post('/:chatId/messages', auth, [
  body('content').notEmpty().withMessage('Message content is required'),
  body('type').optional().isIn(['text', 'image', 'video', 'file', 'portfolio']).withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { chatId } = req.params
    const { content, type = 'text', fileUrl, fileName, fileSize } = req.body

    const chat = await Chat.findById(chatId)
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      })
    }

    // Check if user is participant
    if (!chat.participants.includes(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    const newMessage = {
      sender: req.user.userId,
      content,
      type,
      fileUrl,
      fileName,
      fileSize,
      seenBy: [{ user: req.user.userId }]
    }

    chat.messages.push(newMessage)
    await chat.updateLastMessage(newMessage)
    await chat.populate('messages.sender', 'username fullName profilePicture')

    const message = chat.messages[chat.messages.length - 1]

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    })

  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   PUT /api/chats/:chatId/messages/:messageId/seen
// @desc    Mark message as seen
// @access  Private
router.put('/:chatId/messages/:messageId/seen', auth, async (req, res) => {
  try {
    const { chatId, messageId } = req.params

    const chat = await Chat.findById(chatId)
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      })
    }

    // Check if user is participant
    if (!chat.participants.includes(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    const message = chat.messages.id(messageId)
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      })
    }

    // Add user to seenBy if not already there
    const alreadySeen = message.seenBy.some(
      seen => seen.user.toString() === req.user.userId
    )

    if (!alreadySeen) {
      message.seenBy.push({ user: req.user.userId })
      await chat.save()
    }

    res.json({
      success: true,
      message: 'Message marked as seen'
    })

  } catch (error) {
    console.error('Mark seen error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   DELETE /api/chats/:chatId
// @desc    Delete chat
// @access  Private
router.delete('/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params

    const chat = await Chat.findById(chatId)
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      })
    }

    // Check permissions
    if (chat.type === 'group') {
      if (!chat.admins.includes(req.user.userId)) {
        return res.status(403).json({
          success: false,
          message: 'Only group admins can delete the chat'
        })
      }
    } else {
      if (!chat.participants.includes(req.user.userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        })
      }
    }

    await Chat.findByIdAndDelete(chatId)

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    })

  } catch (error) {
    console.error('Delete chat error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router