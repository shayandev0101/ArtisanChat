const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')
const { body, validationResult } = require('express-validator')

const router = express.Router()

// @route   GET /api/users/search
// @desc    Search users by username, fullName, or skills
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { query, skills, location, page = 1, limit = 20 } = req.query

    let searchQuery = {}

    // Text search
    if (query) {
      searchQuery.$or = [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
        { skills: { $in: [new RegExp(query, 'i')] } }
      ]
    }

    // Filter by skills
    if (skills) {
      const skillsArray = skills.split(',')
      searchQuery.skills = { $in: skillsArray }
    }

    // Filter by location
    if (location) {
      searchQuery.location = { $regex: location, $options: 'i' }
    }

    const users = await User.find(searchQuery)
      .select('username fullName bio skills location profilePicture isOnline lastSeen')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ isOnline: -1, lastSeen: -1 })

    const total = await User.countDocuments(searchQuery)

    res.json({
      success: true,
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    })

  } catch (error) {
    console.error('Search users error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/users/:userId
// @desc    Get user profile by ID
// @access  Private
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -resetPasswordToken -resetPasswordExpires -verificationToken')
      .populate('portfolio', 'title fileUrl thumbnailUrl category likes views createdAt')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check if current user is following this user
    const isFollowing = user.followers.includes(req.user.userId)

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        isFollowing,
        followerCount: user.followers.length,
        followingCount: user.following.length
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('bio')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Bio must be less than 200 characters'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array')
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

    const { fullName, bio, location, skills, profilePicture } = req.body

    const updateData = {}
    if (fullName) updateData.fullName = fullName
    if (bio !== undefined) updateData.bio = bio
    if (location !== undefined) updateData.location = location
    if (skills) updateData.skills = skills
    if (profilePicture) updateData.profilePicture = profilePicture

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    })

  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/users/:userId/follow
// @desc    Follow/unfollow a user
// @access  Private
router.post('/:userId/follow', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId
    const currentUserId = req.user.userId

    if (targetUserId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      })
    }

    const targetUser = await User.findById(targetUserId)
    const currentUser = await User.findById(currentUserId)

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const isFollowing = targetUser.followers.includes(currentUserId)

    if (isFollowing) {
      // Unfollow
      targetUser.followers = targetUser.followers.filter(
        id => id.toString() !== currentUserId
      )
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== targetUserId
      )
    } else {
      // Follow
      targetUser.followers.push(currentUserId)
      currentUser.following.push(targetUserId)
    }

    await targetUser.save()
    await currentUser.save()

    res.json({
      success: true,
      message: isFollowing ? 'User unfollowed' : 'User followed',
      isFollowing: !isFollowing,
      followerCount: targetUser.followers.length
    })

  } catch (error) {
    console.error('Follow/unfollow error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/users/:userId/followers
// @desc    Get user followers
// @access  Private
router.get('/:userId/followers', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const user = await User.findById(req.params.userId)
      .populate({
        path: 'followers',
        select: 'username fullName profilePicture bio skills isOnline lastSeen',
        options: {
          limit: limit * 1,
          skip: (page - 1) * limit,
          sort: { isOnline: -1, lastSeen: -1 }
        }
      })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      followers: user.followers,
      pagination: {
        current: page,
        total: user.followers.length
      }
    })

  } catch (error) {
    console.error('Get followers error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/users/:userId/following
// @desc    Get users that this user is following
// @access  Private
router.get('/:userId/following', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const user = await User.findById(req.params.userId)
      .populate({
        path: 'following',
        select: 'username fullName profilePicture bio skills isOnline lastSeen',
        options: {
          limit: limit * 1,
          skip: (page - 1) * limit,
          sort: { isOnline: -1, lastSeen: -1 }
        }
      })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      following: user.following,
      pagination: {
        current: page,
        total: user.following.length
      }
    })

  } catch (error) {
    console.error('Get following error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   PUT /api/users/settings
// @desc    Update user settings
// @access  Private
router.put('/settings', auth, async (req, res) => {
  try {
    const { theme, language, notifications } = req.body

    const updateData = {}
    if (theme) updateData['settings.theme'] = theme
    if (language) updateData['settings.language'] = language
    if (notifications) {
      if (notifications.email !== undefined) updateData['settings.notifications.email'] = notifications.email
      if (notifications.push !== undefined) updateData['settings.notifications.push'] = notifications.push
      if (notifications.messages !== undefined) updateData['settings.notifications.messages'] = notifications.messages
      if (notifications.tasks !== undefined) updateData['settings.notifications.tasks'] = notifications.tasks
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true }
    ).select('-password')

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: user.settings
    })

  } catch (error) {
    console.error('Update settings error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/users/suggestions
// @desc    Get user suggestions based on skills and connections
// @access  Private
router.get('/suggestions', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId)
    const { limit = 10 } = req.query

    // Find users with similar skills who are not already followed
    const suggestions = await User.find({
      _id: { $ne: req.user.userId },
      _id: { $nin: currentUser.following },
      skills: { $in: currentUser.skills }
    })
      .select('username fullName profilePicture bio skills location isOnline')
      .limit(limit * 1)
      .sort({ isOnline: -1, createdAt: -1 })

    res.json({
      success: true,
      suggestions
    })

  } catch (error) {
    console.error('Get suggestions error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router