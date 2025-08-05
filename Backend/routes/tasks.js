const express = require('express')
const Task = require('../models/Task')
const Group = require('../models/Group')
const auth = require('../middleware/auth')
const { body, validationResult } = require('express-validator')

const router = express.Router()

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', auth, [
  body('title').isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('group').notEmpty().withMessage('Group ID is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('category').optional().isIn(['design', 'development', 'content', 'review', 'meeting', 'other']).withMessage('Invalid category')
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
      group,
      assignedTo,
      dueDate,
      startDate,
      priority = 'medium',
      category = 'other',
      tags,
      subtasks,
      estimatedHours
    } = req.body

    // Check if user is member of the group
    const groupDoc = await Group.findById(group)
    if (!groupDoc) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      })
    }

    const isMember = groupDoc.members.some(
      member => member.user.toString() === req.user.userId
    )

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this group.'
      })
    }

    const task = new Task({
      title,
      description,
      group,
      assignedTo,
      createdBy: req.user.userId,
      dueDate,
      startDate,
      priority,
      category,
      tags: tags || [],
      subtasks: subtasks || [],
      timeTracking: {
        estimatedHours
      }
    })

    await task.save()
    await task.populate('assignedTo', 'username fullName profilePicture')
    await task.populate('createdBy', 'username fullName profilePicture')
    await task.populate('group', 'name')

    // Add activity log
    await task.addActivity(req.user.userId, 'created', 'Task created')

    // Add task to group
    await Group.findByIdAndUpdate(group, {
      $push: { tasks: task._id }
    })

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    })

  } catch (error) {
    console.error('Create task error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/tasks/group/:groupId
// @desc    Get tasks for a group
// @access  Private
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const { status, assignedTo, priority, page = 1, limit = 20 } = req.query
    const { groupId } = req.params

    // Check if user is member of the group
    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      })
    }

    const isMember = group.members.some(
      member => member.user.toString() === req.user.userId
    )

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    let query = { group: groupId }

    if (status) {
      query.status = status
    }

    if (assignedTo) {
      query.assignedTo = assignedTo
    }

    if (priority) {
      query.priority = priority
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'username fullName profilePicture')
      .populate('createdBy', 'username fullName profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Task.countDocuments(query)

    res.json({
      success: true,
      tasks,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    })

  } catch (error) {
    console.error('Get tasks error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/tasks/:taskId
// @desc    Get single task
// @access  Private
router.get('/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignedTo', 'username fullName profilePicture')
      .populate('createdBy', 'username fullName profilePicture')
      .populate('group', 'name')
      .populate('comments.user', 'username fullName profilePicture')
      .populate('activities.user', 'username fullName profilePicture')

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    // Check if user has access to this task
    const group = await Group.findById(task.group._id)
    const isMember = group.members.some(
      member => member.user.toString() === req.user.userId
    )

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    res.json({
      success: true,
      task
    })

  } catch (error) {
    console.error('Get task error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   PUT /api/tasks/:taskId
// @desc    Update task
// @access  Private
router.put('/:taskId', auth, [
  body('title').optional().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').optional().isIn(['pending', 'in-progress', 'review', 'completed', 'cancelled']).withMessage('Invalid status')
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

    const task = await Task.findById(req.params.taskId)

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    // Check if user has permission to update task
    const group = await Group.findById(task.group)
    const canModerate = group.canModerate(req.user.userId)
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user.userId
    const isCreator = task.createdBy.toString() === req.user.userId

    if (!canModerate && !isAssigned && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    const {
      title,
      description,
      assignedTo,
      dueDate,
      startDate,
      priority,
      category,
      tags,
      status
    } = req.body

    if (title) task.title = title
    if (description !== undefined) task.description = description
    if (assignedTo !== undefined) task.assignedTo = assignedTo
    if (dueDate !== undefined) task.dueDate = dueDate
    if (startDate !== undefined) task.startDate = startDate
    if (priority) task.priority = priority
    if (category) task.category = category
    if (tags) task.tags = tags

    // Handle status change
    if (status && status !== task.status) {
      await task.updateStatus(status, req.user.userId)
    } else {
      await task.save()
    }

    // Handle assignment change
    if (assignedTo && assignedTo !== task.assignedTo?.toString()) {
      await task.assignTo(assignedTo, req.user.userId)
    }

    await task.populate('assignedTo', 'username fullName profilePicture')
    await task.populate('createdBy', 'username fullName profilePicture')
    await task.populate('group', 'name')

    res.json({
      success: true,
      message: 'Task updated successfully',
      task
    })

  } catch (error) {
    console.error('Update task error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   DELETE /api/tasks/:taskId
// @desc    Delete task
// @access  Private
router.delete('/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    // Check if user has permission to delete task
    const group = await Group.findById(task.group)
    const canModerate = group.canModerate(req.user.userId)
    const isCreator = task.createdBy.toString() === req.user.userId

    if (!canModerate && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    await Task.findByIdAndDelete(req.params.taskId)

    // Remove task from group
    await Group.findByIdAndUpdate(task.group, {
      $pull: { tasks: req.params.taskId }
    })

    res.json({
      success: true,
      message: 'Task deleted successfully'
    })

  } catch (error) {
    console.error('Delete task error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/tasks/:taskId/comment
// @desc    Add comment to task
// @access  Private
router.post('/:taskId/comment', auth, [
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

    const task = await Task.findById(req.params.taskId)

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    // Check if user has access to this task
    const group = await Group.findById(task.group)
    const isMember = group.members.some(
      member => member.user.toString() === req.user.userId
    )

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    await task.addComment(req.user.userId, req.body.content)
    await task.populate('comments.user', 'username fullName profilePicture')

    const newComment = task.comments[task.comments.length - 1]

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

// @route   PUT /api/tasks/:taskId/status
// @desc    Update task status
// @access  Private
router.put('/:taskId/status', auth, [
  body('status').isIn(['pending', 'in-progress', 'review', 'completed', 'cancelled']).withMessage('Invalid status')
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

    const task = await Task.findById(req.params.taskId)

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    // Check if user has permission to update status
    const group = await Group.findById(task.group)
    const canModerate = group.canModerate(req.user.userId)
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user.userId

    if (!canModerate && !isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    await task.updateStatus(req.body.status, req.user.userId)
    await task.populate('assignedTo', 'username fullName profilePicture')
    await task.populate('createdBy', 'username fullName profilePicture')

    res.json({
      success: true,
      message: 'Task status updated successfully',
      task
    })

  } catch (error) {
    console.error('Update task status error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/tasks/group/:groupId/overdue
// @desc    Get overdue tasks for a group
// @access  Private
router.get('/group/:groupId/overdue', auth, async (req, res) => {
  try {
    const { groupId } = req.params

    // Check if user is member of the group
    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      })
    }

    const isMember = group.members.some(
      member => member.user.toString() === req.user.userId
    )

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    const tasks = await Task.getOverdue(groupId)

    res.json({
      success: true,
      tasks
    })

  } catch (error) {
    console.error('Get overdue tasks error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/tasks/group/:groupId/due-soon
// @desc    Get tasks due soon for a group
// @access  Private
router.get('/group/:groupId/due-soon', auth, async (req, res) => {
  try {
    const { groupId } = req.params
    const { days = 3 } = req.query

    // Check if user is member of the group
    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      })
    }

    const isMember = group.members.some(
      member => member.user.toString() === req.user.userId
    )

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    const tasks = await Task.getDueSoon(groupId, days)

    res.json({
      success: true,
      tasks
    })

  } catch (error) {
    console.error('Get due soon tasks error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router