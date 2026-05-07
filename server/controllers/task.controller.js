const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Get all tasks (with filters, search, pagination)
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      priority = '',
      assignedTo = '',
      project = '',
      sort = '-createdAt',
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = {};
    if (req.user.role === 'member') {
      filter.assignedTo = req.user._id;
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (status) {
      filter.status = status;
    }
    if (priority) {
      filter.priority = priority;
    }
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }
    if (project) {
      filter.project = project;
    }

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('assignedTo', 'name email avatar')
        .populate('project', 'title')
        .populate('createdBy', 'name email avatar')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(filter),
    ]);

    return successResponse(res, 'Tasks fetched successfully', {
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single task
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'title')
      .populate('createdBy', 'name email avatar');

    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    return successResponse(res, 'Task fetched successfully', { task });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, status, assignedTo, project } = req.body;

    // Verify project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return errorResponse(res, 'Project not found', 404);
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate: dueDate || null,
      status: status || 'todo',
      assignedTo: assignedTo || null,
      project,
      createdBy: req.user._id,
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'title')
      .populate('createdBy', 'name email avatar');

    await Activity.logActivity(
      req.user._id,
      'created',
      'task',
      task._id,
      `Created task "${title}" in project "${projectExists.title}"`
    );

    return successResponse(res, 'Task created successfully', { task: populated }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private (Admin=any, Member=own tasks only)
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    // Members can only update their own tasks
    if (
      req.user.role === 'member' &&
      task.assignedTo?.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 'You can only update tasks assigned to you', 403);
    }

    // Members can only update status
    if (req.user.role === 'member') {
      const allowedFields = ['status'];
      const updateFields = Object.keys(req.body);
      const isValid = updateFields.every((field) => allowedFields.includes(field));
      if (!isValid) {
        return errorResponse(res, 'Members can only update task status', 403);
      }
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'title')
      .populate('createdBy', 'name email avatar');

    // Log status changes
    if (req.body.status && req.body.status !== task.status) {
      await Activity.logActivity(
        req.user._id,
        'status_changed',
        'task',
        updated._id,
        `Changed task "${updated.title}" status from "${task.status}" to "${req.body.status}"`
      );
    } else {
      await Activity.logActivity(
        req.user._id,
        'updated',
        'task',
        updated._id,
        `Updated task "${updated.title}"`
      );
    }

    return successResponse(res, 'Task updated successfully', { task: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private (Admin)
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    await Task.findByIdAndDelete(req.params.id);

    await Activity.logActivity(
      req.user._id,
      'deleted',
      'task',
      task._id,
      `Deleted task "${task.title}"`
    );

    return successResponse(res, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get tasks by project
 * @route   GET /api/tasks/project/:projectId
 * @access  Private
 */
const getTasksByProject = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status = '', priority = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { project: req.params.projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Members can only see tasks assigned to them
    if (req.user.role === 'member') {
      filter.assignedTo = req.user._id;
    }

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('assignedTo', 'name email avatar')
        .populate('createdBy', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(filter),
    ]);

    return successResponse(res, 'Tasks fetched successfully', {
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/tasks/stats
 * @access  Private
 */
const getTaskStats = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'member') {
      filter.assignedTo = req.user._id;
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [
      totalTasks,
      completedTasks,
      todoTasks,
      inProgressTasks,
      overdueTasks,
      highPriority,
      mediumPriority,
      lowPriority,
      completedThisWeek,
    ] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: 'completed' }),
      Task.countDocuments({ ...filter, status: 'todo' }),
      Task.countDocuments({ ...filter, status: 'in-progress' }),
      Task.countDocuments({
        ...filter,
        status: { $ne: 'completed' },
        dueDate: { $lt: now },
      }),
      Task.countDocuments({ ...filter, priority: 'high' }),
      Task.countDocuments({ ...filter, priority: 'medium' }),
      Task.countDocuments({ ...filter, priority: 'low' }),
      Task.countDocuments({
        ...filter,
        status: 'completed',
        updatedAt: { $gte: startOfWeek },
      }),
    ]);

    // Upcoming deadlines (next 7 days, not completed)
    const upcomingDeadlines = await Task.find({
      ...filter,
      status: { $ne: 'completed' },
      dueDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
    })
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'title')
      .sort({ dueDate: 1 })
      .limit(5);

    // Recent tasks
    const recentTasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    return successResponse(res, 'Stats fetched successfully', {
      stats: {
        totalTasks,
        completedTasks,
        todoTasks,
        inProgressTasks,
        overdueTasks,
        completedThisWeek,
        priorities: { high: highPriority, medium: mediumPriority, low: lowPriority },
      },
      upcomingDeadlines,
      recentTasks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTasksByProject,
  getTaskStats,
};
