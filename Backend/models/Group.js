const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  settings: {
    isPrivate: {
      type: Boolean,
      default: false
    },
    allowMemberInvite: {
      type: Boolean,
      default: true
    },
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    maxMembers: {
      type: Number,
      default: 100
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['design', 'photography', 'writing', 'development', 'marketing', 'other'],
    default: 'other'
  }
}, {
  timestamps: true
})

// Indexes
groupSchema.index({ name: 'text', description: 'text', tags: 'text' })
groupSchema.index({ admin: 1 })
groupSchema.index({ 'members.user': 1 })
groupSchema.index({ category: 1 })

// Add member to group
groupSchema.methods.addMember = function(userId, role = 'member') {
  const existingMember = this.members.find(
    member => member.user.toString() === userId.toString()
  )
  
  if (existingMember) {
    throw new Error('User is already a member of this group')
  }
  
  this.members.push({
    user: userId,
    role: role
  })
  
  return this.save()
}

// Remove member from group
groupSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(
    member => member.user.toString() !== userId.toString()
  )
  return this.save()
}

// Update member role
groupSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(
    member => member.user.toString() === userId.toString()
  )
  
  if (!member) {
    throw new Error('User is not a member of this group')
  }
  
  member.role = newRole
  return this.save()
}

// Check if user is admin or moderator
groupSchema.methods.canModerate = function(userId) {
  if (this.admin.toString() === userId.toString()) {
    return true
  }
  
  const member = this.members.find(
    member => member.user.toString() === userId.toString()
  )
  
  return member && (member.role === 'admin' || member.role === 'moderator')
}

// Get member count
groupSchema.virtual('memberCount').get(function() {
  return this.members.length
})

module.exports = mongoose.model('Group', groupSchema)