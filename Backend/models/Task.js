const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
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
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'review', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: Date,
  startDate: Date,
  completedAt: Date,
  // Task categorization
  category: {
    type: String,
    enum: ['design', 'development', 'content', 'review', 'meeting', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  // Attachments and files
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Comments and updates
  comments: [{
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
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Activity log
  activities: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      enum: ['created', 'updated', 'assigned', 'status_changed', 'commented', 'completed'],
      required: true
    },
    details: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Time tracking
  timeTracking: {
    estimatedHours: Number,
    actualHours: Number,
    timeEntries: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      startTime: Date,
      endTime: Date,
      duration: Number, // in minutes
      description: String
    }]
  },
  // Subtasks
  subtasks: [{
    title: {
      type: String,
      required: true,
      maxlength: 100
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: Date
  }],
  // Dependencies
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked_by'],
      required: true
    }
  }]
}, {
  timestamps: true
})

// Indexes
taskSchema.index({ group: 1 })
taskSchema.index({ assignedTo: 1 })
taskSchema.index({ createdBy: 1 })
taskSchema.index({ status: 1 })
taskSchema.index({ dueDate: 1 })
taskSchema.index({ priority: 1 })
taskSchema.index({ title: 'text', description: 'text' })

// Virtual for completion percentage
taskSchema.virtual('completionPercentage').get(function() {
  if (this.subtasks.length === 0) {
    return this.status === 'completed' ? 100 : 0
  }
  
  const completedSubtasks = this.subtasks.filter(subtask => subtask.completed).length
  return Math.round((completedSubtasks / this.subtasks.length) * 100)
})

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed') return false
  return new Date() > this.dueDate
})

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null
  const now = new Date()
  const due = new Date(this.dueDate)
  const diffTime = due - now
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Add activity log entry
taskSchema.methods.addActivity = function(userId, action, details = '') {
  this.activities.push({
    user: userId,
    action: action,
    details: details
  })
  return this.save()
}

// Update status with activity log
taskSchema.methods.updateStatus = function(newStatus, userId) {
  const oldStatus = this.status
  this.status = newStatus
  
  if (newStatus === 'completed') {
    this.completedAt = new Date()
  }
  
  return this.addActivity(userId, 'status_changed', `Status changed from ${oldStatus} to ${newStatus}`)
}

// Assign task to user
taskSchema.methods.assignTo = function(userId, assignedBy) {
  this.assignedTo = userId
  return this.addActivity(assignedBy, 'assigned', `Task assigned to user`)
}

// Add comment
taskSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content
  })
  return this.addActivity(userId, 'commented', 'Added a comment')
}

// Complete subtask
taskSchema.methods.completeSubtask = function(subtaskId, userId) {
  const subtask = this.subtasks.id(subtaskId)
  if (!subtask) {
    throw new Error('Subtask not found')
  }
  
  subtask.completed = true
  subtask.completedBy = userId
  subtask.completedAt = new Date()
  
  return this.save()
}

// Get tasks by status for a group
taskSchema.statics.getByStatus = function(groupId, status) {
  return this.find({ group: groupId, status: status })
    .populate('assignedTo', 'username fullName profilePicture')
    .populate('createdBy', 'username fullName profilePicture')
    .sort({ createdAt: -1 })
}

// Get overdue tasks for a group
taskSchema.statics.getOverdue = function(groupId) {
  return this.find({
    group: groupId,
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] }
  })
    .populate('assignedTo', 'username fullName profilePicture')
    .sort({ dueDate: 1 })
}

// Get tasks due soon (within next 3 days)
taskSchema.statics.getDueSoon = function(groupId, days = 3) {
  const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  
  return this.find({
    group: groupId,
    dueDate: { $lte: futureDate, $gte: new Date() },
    status: { $nin: ['completed', 'cancelled'] }
  })
    .populate('assignedTo', 'username fullName profilePicture')
    .sort({ dueDate: 1 })
}

module.exports = mongoose.model('Task', taskSchema)