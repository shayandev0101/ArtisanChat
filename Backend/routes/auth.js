const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const User = require('../models/User')
const auth = require('../middleware/auth')
const { body, validationResult } = require('express-validator')
const rateLimit = require('express-rate-limit')

const router = express.Router()

// Email transporter setup
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
})

// Register validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('fullName')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .trim(),
  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill must be selected')
]

// Login validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
]

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authLimiter, registerValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { username, email, password, fullName, bio, skills, location } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'User with this email already exists' 
          : 'Username is already taken'
      })
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create new user (unverified)
    const user = new User({
      username,
      email,
      password,
      fullName,
      bio: bio || '',
      skills: skills || [],
      location: location || '',
      isVerified: false,
      verificationToken: otp,
      verificationExpires: otpExpires
    })

    await user.save()

    // Send OTP email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'کد تایید ArtisanChat',
        html: `
          <div style="direction: rtl; font-family: Arial, sans-serif;">
            <h2>کد تایید حساب کاربری</h2>
            <p>سلام ${fullName}،</p>
            <p>کد تایید شما: <strong style="font-size: 24px; color: #3b82f6;">${otp}</strong></p>
            <p>این کد تا 10 دقیقه معتبر است.</p>
            <p>با تشکر،<br>تیم ArtisanChat</p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Email send error:', emailError)
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification code.',
      email: email,
      requiresVerification: true
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    })
  }
})

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP code
// @access  Public
router.post('/verify-otp', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
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

    const { email, otp } = req.body

    const user = await User.findOne({ 
      email,
      verificationToken: otp,
      verificationExpires: { $gt: new Date() }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code'
      })
    }

    // Verify user
    user.isVerified = true
    user.verificationToken = undefined
    user.verificationExpires = undefined
    user.isOnline = true
    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: user.getPublicProfile()
    })

  } catch (error) {
    console.error('OTP verification error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    })
  }
})

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP code
// @access  Public
router.post('/resend-otp', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
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

    const { email } = req.body

    const user = await User.findOne({ email, isVerified: false })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found or already verified'
      })
    }

    // Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

    user.verificationToken = otp
    user.verificationExpires = otpExpires
    await user.save()

    // Send OTP email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'کد تایید جدید ArtisanChat',
        html: `
          <div style="direction: rtl; font-family: Arial, sans-serif;">
            <h2>کد تایید جدید</h2>
            <p>سلام ${user.fullName}،</p>
            <p>کد تایید جدید شما: <strong style="font-size: 24px; color: #3b82f6;">${otp}</strong></p>
            <p>این کد تا 10 دقیقه معتبر است.</p>
            <p>با تشکر،<br>تیم ArtisanChat</p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Email send error:', emailError)
    }

    res.json({
      success: true,
      message: 'New OTP sent to your email'
    })

  } catch (error) {
    console.error('Resend OTP error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, loginValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Update user online status and last seen
    user.isOnline = true
    await user.updateLastSeen()

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    })
  }
})

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // Update user offline status
    const user = await User.findById(req.user.userId)
    if (user) {
      user.isOnline = false
      await user.updateLastSeen()
    }

    res.json({
      success: true,
      message: 'Logout successful'
    })

  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('portfolio', 'title fileUrl thumbnailUrl category')
      .select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      user: user
    })

  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Generate new token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      token,
      user: user.getPublicProfile()
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User with this email does not exist'
      })
    }

    // Generate reset token (in production, send email)
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    )

    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
    await user.save()

    // In production, send email with reset link
    console.log('Password reset token:', resetToken)

    res.json({
      success: true,
      message: 'Password reset instructions sent to your email'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router