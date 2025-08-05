const express = require('express')
const Portfolio = require('../models/Portfolio')
const User = require('../models/User')
const auth = require('../middleware/auth')
const { body, validationResult } = require('express-validator')

const router = express.Router()

// @route   POST /api/portfolios
// @desc    Create new portfolio
// @access  Private
router.post('/', auth, [
  body('title').isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('fileUrl').notEmpty().withMessage('File URL is required'),
  body('category').isIn([
    'graphic-design', 'photography', 'illustration', 'web-design', 
    'ui-ux', 'branding', 'animation', 'video', 'writing', 'other'
  ]).withMessage('Invalid category')
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

    const {
      title,
      description,
      fileUrl,
      fileName,
      fileSize,
      fileType,
      thumbnailUrl,
      tags,
      category,
      metadata,
      visibility = 'public',
      allowComments = true,
      allowDownload = false
    } = req.body

    const portfolio = new Portfolio({
      user: req.user.userId,
      title,
      description,
      fileUrl,
      fileName,
      fileSize,
      fileType,
      thumbnailUrl,
      tags: tags || [],
      category,
      metadata,
      visibility,
      allowComments,
      allowDownload
    })

    await portfolio.save()
    await portfolio.populate('user', 'username fullName profilePicture')

    // Add portfolio to user's portfolio array
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { portfolio: portfolio._id }
    })

    res.status(201).json({
      success: true,
      message: 'Portfolio created successfully',
      portfolio
    })

  } catch (error) {
    console.error('Create portfolio error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/portfolios/:userId
// @desc    Get user portfolios
// @access  Public
router.get('/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, tags } = req.query
    const { userId } = req.params

    let query = { user: userId, visibility: 'public' }

    // If requesting own portfolios, show all
    if (req.user && req.user.userId === userId) {
      delete query.visibility
    }

    if (category) {
      query.category = category
    }

    if (tags) {
      const tagArray = tags.split(',')
      query.tags = { $in: tagArray }
    }

    const portfolios = await Portfolio.find(query)
      .populate('user', 'username fullName profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Portfolio.countDocuments(query)

    res.json({
      success: true,
      portfolios,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    })

  } catch (error) {
    console.error('Get portfolios error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/portfolios/single/:portfolioId
// @desc    Get single portfolio
// @access  Public
router.get('/single/:portfolioId', async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.portfolioId)
      .populate('user', 'username fullName profilePicture')
      .populate('comments.user', 'username fullName profilePicture')

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      })
    }

    // Add view if user is authenticated
    if (req.user) {
      await portfolio.addView(req.user.userId, req.ip)
    }

    res.json({
      success: true,
      portfolio
    })

  } catch (error) {
    console.error('Get portfolio error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   PUT /api/portfolios/:portfolioId
// @desc    Update portfolio
// @access  Private
router.put('/:portfolioId', auth, [
  body('title').optional().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters')
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

    const portfolio = await Portfolio.findById(req.params.portfolioId)

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      })
    }

    // Check ownership
    if (portfolio.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    const { title, description, tags, category, visibility, allowComments, allowDownload } = req.body

    if (title) portfolio.title = title
    if (description !== undefined) portfolio.description = description
    if (tags) portfolio.tags = tags
    if (category) portfolio.category = category
    if (visibility) portfolio.visibility = visibility
    if (allowComments !== undefined) portfolio.allowComments = allowComments
    if (allowDownload !== undefined) portfolio.allowDownload = allowDownload

    await portfolio.save()
    await portfolio.populate('user', 'username fullName profilePicture')

    res.json({
      success: true,
      message: 'Portfolio updated successfully',
      portfolio
    })

  } catch (error) {
    console.error('Update portfolio error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   DELETE /api/portfolios/:portfolioId
// @desc    Delete portfolio
// @access  Private
router.delete('/:portfolioId', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.portfolioId)

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      })
    }

    // Check ownership
    if (portfolio.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    await Portfolio.findByIdAndDelete(req.params.portfolioId)

    // Remove from user's portfolio array
    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { portfolio: req.params.portfolioId }
    })

    res.json({
      success: true,
      message: 'Portfolio deleted successfully'
    })

  } catch (error) {
    console.error('Delete portfolio error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/portfolios/:portfolioId/like
// @desc    Like/unlike portfolio
// @access  Private
router.post('/:portfolioId/like', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.portfolioId)

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      })
    }

    const existingLike = portfolio.likes.find(
      like => like.user.toString() === req.user.userId
    )

    if (existingLike) {
      // Unlike
      await portfolio.removeLike(req.user.userId)
      res.json({
        success: true,
        message: 'Portfolio unliked',
        liked: false,
        likeCount: portfolio.likes.length
      })
    } else {
      // Like
      await portfolio.addLike(req.user.userId)
      res.json({
        success: true,
        message: 'Portfolio liked',
        liked: true,
        likeCount: portfolio.likes.length
      })
    }

  } catch (error) {
    console.error('Like portfolio error:', error)
    
    if (error.message === 'User has already liked this portfolio') {
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

// @route   POST /api/portfolios/:portfolioId/comment
// @desc    Add comment to portfolio
// @access  Private
router.post('/:portfolioId/comment', auth, [
  body('content').isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters')
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

    const portfolio = await Portfolio.findById(req.params.portfolioId)

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      })
    }

    if (!portfolio.allowComments) {
      return res.status(403).json({
        success: false,
        message: 'Comments are disabled for this portfolio'
      })
    }

    await portfolio.addComment(req.user.userId, req.body.content)
    await portfolio.populate('comments.user', 'username fullName profilePicture')

    const newComment = portfolio.comments[portfolio.comments.length - 1]

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment
    })

  } catch (error) {
    console.error('Add comment error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/portfolios/popular
// @desc    Get popular portfolios
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const portfolios = await Portfolio.getPopular(limit)

    res.json({
      success: true,
      portfolios
    })

  } catch (error) {
    console.error('Get popular portfolios error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/portfolios/trending
// @desc    Get trending portfolios
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const { days = 7, limit = 10 } = req.query

    const portfolios = await Portfolio.getTrending(days, limit)

    res.json({
      success: true,
      portfolios
    })

  } catch (error) {
    console.error('Get trending portfolios error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router