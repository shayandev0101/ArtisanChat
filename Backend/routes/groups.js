const express = require('express')
const Group = require('../models/Group')
const Chat = require('../models/Chat')
const auth = require('../middleware/auth')
const { body, validationResult } = require('express-validator')

const router = express.Router()

// @route   POST /api/groups
// @desc    Create new group
// @access  Private
router.post('/', auth, [
  body('name').isLength({ min: 1, max: 100 }).withMessage('Group name must be 1-100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('members').optional().isArray().withMessage('Members must be an array')
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

    const { name, description, members = [], avatar, category, tags } = req.body

    // Create group chat first
    const chat = new Chat({
      type: 'group',
      participants: [req.user.userId, ...members],
      name,
      description,
      admins: [req.user.userId]
    })
    await chat.save()

    // Create group
    const group = new Group({
      name,
      description,
      admin: req.user.userId,
      members: [
        { user: req.user.userId, role: 'admin' },
        ...members.map(memberId => ({ user: memberId, role: 'member' }))
      ],
      chat: chat._id,
      avatar,
      category,
      tags
    })

    await group.save()
    await group.populate('members.user', 'username fullName profilePicture')
    await group.populate('admin', 'username fullName profilePicture')

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      group
    })

  } catch (error) {
    console.error('Create group error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/groups/:groupId
// @desc    Get group details
// @access  Private
router.get('/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('members.user', 'username fullName profilePicture isOnline lastSeen')
      .populate('admin', 'username fullName profilePicture')
      .populate('tasks')

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      })
    }

    // Check if user is member
    const isMember = group.members.some(
      member => member.user._id.toString() === req.user.userId
    )

    if (!isMember && !group.settings.isPrivate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    res.json({
      success: true,
      group
    })

  } catch (error) {
    console.error('Get group error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   PUT /api/groups/:groupId
// @desc    Update group
// @access  Private
router.put('/:groupId', auth, [
  body('name').optional().isLength({ min: 1, max: 100 }).withMessage('Group name must be 1-100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
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

    const group = await Group.findById(req.params.groupId)
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      })
    }

    // Check if user can modify group
    if (!group.canModerate(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    const { name, description, avatar, category, tags, settings } = req.body

    if (name) group.name = name
    if (description !== undefined) group.description = description
    if (avatar) group.avatar = avatar
    if (category) group.category = category
    if (tags) group.tags = tags
    if (settings) group.settings = { ...group.settings, ...settings }

    await group.save()
    await group.populate('members.user', 'username fullName profilePicture')
    await group.populate('admin', 'username fullName profilePicture')

    res.json({
      success: true,
      message: 'Group updated successfully',
      group
    })

  } catch (error) {
    console.error('Update group error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/groups/:groupId/members
// @desc    Add member to group
// @access  Private
router.post('/:groupId/members', auth, [
  body('userId').notEmpty().withMessage('User ID is required')
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

    const { userId } = req.body
    const group = await Group.findById(req.params.groupId)

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      })
    }

    // Check permissions
    const canInvite = group.canModerate(req.user.userId) || 
                     (group.settings.allowMemberInvite && 
                      group.members.some(m => m.user.toString() === req.user.userId))

    if (!canInvite) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    // Check if group is at capacity
    if (group.members.length >= group.settings.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Group is at maximum capacity'
      })
    }

    await group.addMember(userId)
    
    // Add to group chat
    const chat = await Chat.findById(group.chat)
    if (chat && !chat.participants.includes(userId)) {
      chat.participants.push(userId)
      await chat.save()
    }

    await group.populate('members.user', 'username fullName profilePicture')

    res.json({
      success: true,
      message: 'Member added successfully',
      group
    })

  } catch (error) {
    console.error('Add member error:', error)
    
    if (error.message === 'User is already a member of this group') {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   DELETE /api/groups/:groupId/members/:userId
// @desc    Remove member from group
// @access  Private
router.delete('/:groupId/members/:userId', auth, async (req, res) => {
  try {
    const { groupId, userId } = req.params
    const group = await Group.findById(groupId)

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      })
    }

    // Check permissions (admin, moderator, or self)
    const canRemove = group.canModerate(req.user.userId) || 
                     req.user.userId === userId

    if (!canRemove) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    // Can't remove group admin
    if (userId === group.admin.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove group admin'
      })
    }

    await group.removeMember(userId)
    
    // Remove from group chat
    const chat = await Chat.findById(group.chat)
    if (chat) {
      chat.participants = chat.participants.filter(
        p => p.toString() !== userId
      )
      await chat.save()
    }

    await group.populate('members.user', 'username fullName profilePicture')

    res.json({
      success: true,
      message: 'Member removed successfully',
      group
    })

  } catch (error) {
    console.error('Remove member error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   PUT /api/groups/:groupId/members/:userId
// @desc    Update member role
// @access  Private
router.put('/:groupId/members/:userId', auth, [
  body('role').isIn(['admin', 'moderator', 'member']).withMessage('Invalid role')
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

    const { groupId, userId } = req.params
    const { role } = req.body

    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      })
    }

    // Only admin can change roles
    if (group.admin.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can change member roles'
      })
    }

    await group.updateMemberRole(userId, role)
    await group.populate('members.user', 'username fullName profilePicture')

    res.json({
      success: true,
      message: 'Member role updated successfully',
      group
    })

  } catch (error) {
    console.error('Update member role error:', error)
    
    if (error.message === 'User is not a member of this group') {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/groups/search
// @desc    Search groups
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { query, category, page = 1, limit = 20 } = req.query

    let searchQuery = { 'settings.isPrivate': false }

    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    }

    if (category) {
      searchQuery.category = category
    }

    const groups = await Group.find(searchQuery)
      .populate('admin', 'username fullName profilePicture')
      .select('name description avatar category tags memberCount createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const total = await Group.countDocuments(searchQuery)

    res.json({
      success: true,
      groups,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    })

  } catch (error) {
    console.error('Search groups error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router