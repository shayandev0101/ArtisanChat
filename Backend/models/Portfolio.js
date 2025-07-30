const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 300
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
})

const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: String,
  fileSize: Number,
  fileType: {
    type: String,
    enum: ['image', 'video', 'document', 'design'],
    required: true
  },
  thumbnailUrl: String,
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  category: {
    type: String,
    enum: [
      'graphic-design',
      'photography',
      'illustration',
      'web-design',
      'ui-ux',
      'branding',
      'animation',
      'video',
      'writing',
      'other'
    ],
    required: true
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [commentSchema],
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    },
    ip: String
  }],
  // Portfolio metadata
  metadata: {
    dimensions: {
      width: Number,
      height: Number
    },
    duration: Number, // for videos
    software: String, // e.g., "Photoshop", "Figma"
    client: String,
    projectDate: Date
  },
  // Privacy settings
  visibility: {
    type: String,
    enum: ['public', 'private', 'followers'],
    default: 'public'
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  allowDownload: {
    type: Boolean,
    default: false
  },
  // Featured status
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredAt: Date,
  // Analytics
  analytics: {
    totalViews: {
      type: Number,
      default: 0
    },
    uniqueViews: {
      type: Number,
      default: 0
    },
    totalLikes: {
      type: Number,
      default: 0
    },
    totalComments: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
})

// Indexes for better performance
portfolioSchema.index({ user: 1 })
portfolioSchema.index({ category: 1 })
portfolioSchema.index({ tags: 1 })
portfolioSchema.index({ createdAt: -1 })
portfolioSchema.index({ 'analytics.totalViews': -1 })
portfolioSchema.index({ 'analytics.totalLikes': -1 })
portfolioSchema.index({ title: 'text', description: 'text', tags: 'text' })

// Virtual for like count
portfolioSchema.virtual('likeCount').get(function() {
  return this.likes.length
})

// Virtual for comment count
portfolioSchema.virtual('commentCount').get(function() {
  return this.comments.length
})

// Add like
portfolioSchema.methods.addLike = function(userId) {
  const existingLike = this.likes.find(
    like => like.user.toString() === userId.toString()
  )
  
  if (existingLike) {
    throw new Error('User has already liked this portfolio')
  }
  
  this.likes.push({ user: userId })
  this.analytics.totalLikes = this.likes.length
  return this.save()
}

// Remove like
portfolioSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(
    like => like.user.toString() !== userId.toString()
  )
  this.analytics.totalLikes = this.likes.length
  return this.save()
}

// Add comment
portfolioSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content
  })
  this.analytics.totalComments = this.comments.length
  return this.save()
}

// Add view
portfolioSchema.methods.addView = function(userId, ip) {
  // Check if user has already viewed (for unique views)
  const existingView = this.views.find(
    view => view.user && view.user.toString() === userId.toString()
  )
  
  this.views.push({
    user: userId,
    ip: ip
  })
  
  this.analytics.totalViews = this.views.length
  
  if (!existingView) {
    this.analytics.uniqueViews += 1
  }
  
  return this.save()
}

// Get popular portfolios
portfolioSchema.statics.getPopular = function(limit = 10) {
  return this.find({ visibility: 'public' })
    .sort({ 'analytics.totalLikes': -1, 'analytics.totalViews': -1 })
    .limit(limit)
    .populate('user', 'username fullName profilePicture')
}

// Get trending portfolios (based on recent activity)
portfolioSchema.statics.getTrending = function(days = 7, limit = 10) {
  const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  
  return this.find({
    visibility: 'public',
    createdAt: { $gte: dateThreshold }
  })
    .sort({ 'analytics.totalLikes': -1, 'analytics.totalViews': -1 })
    .limit(limit)
    .populate('user', 'username fullName profilePicture')
}

module.exports = mongoose.model('Portfolio', portfolioSchema)