const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  bio: {
    type: String,
    maxlength: 200,
    default: ''
  },
  skills: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  },
  portfolio: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    language: {
      type: String,
      enum: ['fa', 'en'],
      default: 'fa'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      messages: {
        type: Boolean,
        default: true
      },
      tasks: {
        type: Boolean,
        default: true
      }
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
})

// Index for search functionality
userSchema.index({ username: 'text', fullName: 'text', skills: 'text' })
userSchema.index({ email: 1 })
userSchema.index({ username: 1 })

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Update last seen
userSchema.methods.updateLastSeen = function() {
  this.lastSeen = new Date()
  return this.save()
}

// Get public profile
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject()
  delete user.password
  delete user.verificationToken
  delete user.resetPasswordToken
  delete user.resetPasswordExpires
  return user
}

module.exports = mongoose.model('User', userSchema)