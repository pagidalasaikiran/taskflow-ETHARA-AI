const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Get all projects (admin=all, member=assigned)
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search = '', status = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = {};
    if (req.user.role === 'member') {
      filter.teamMembers = req.user._id;
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (status) {
      filter.status = status;
    }

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('createdBy', 'name email avatar')
        .populate('teamMembers', 'name email avatar role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Project.countDocuments(filter),
    ]);

    // Calculate progress for each project
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ project: project._id });
        const completedTasks = await Task.countDocuments({ project: project._id, status: 'completed' });
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        return {
          ...project.toObject(),
          totalTasks,
          completedTasks,
          progress,
        };
      })
    );

    return successResponse(res, 'Projects fetched successfully', {
      projects: projectsWithProgress,
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
 * @desc    Get single project
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('teamMembers', 'name email avatar role');

    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    // Check access for members
    if (req.user.role === 'member' && !project.teamMembers.some((m) => m._id.toString() === req.user._id.toString())) {
      return errorResponse(res, 'Not authorized to view this project', 403);
    }

    // Get tasks and calculate progress
    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email avatar')
      .sort({ createdAt: -1 });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return successResponse(res, 'Project fetched successfully', {
      project: {
        ...project.toObject(),
        tasks,
        totalTasks,
        completedTasks,
        progress,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create project
 * @route   POST /api/projects
 * @access  Private (Admin)
 */
const createProject = async (req, res, next) => {
  try {
    const { title, description, teamMembers, status } = req.body;

    const project = await Project.create({
      title,
      description,
      teamMembers: teamMembers || [],
      status: status || 'active',
      createdBy: req.user._id,
    });

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email avatar')
      .populate('teamMembers', 'name email avatar role');

    await Activity.logActivity(
      req.user._id,
      'created',
      'project',
      project._id,
      `Created project "${title}"`
    );

    return successResponse(res, 'Project created successfully', {
      project: { ...populated.toObject(), totalTasks: 0, completedTasks: 0, progress: 0 },
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private (Admin)
 */
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('createdBy', 'name email avatar')
      .populate('teamMembers', 'name email avatar role');

    // Recalculate progress
    const totalTasks = await Task.countDocuments({ project: updated._id });
    const completedTasks = await Task.countDocuments({ project: updated._id, status: 'completed' });
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    await Activity.logActivity(
      req.user._id,
      'updated',
      'project',
      updated._id,
      `Updated project "${updated.title}"`
    );

    return successResponse(res, 'Project updated successfully', {
      project: { ...updated.toObject(), totalTasks, completedTasks, progress },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private (Admin)
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    // Cascade delete all tasks in this project
    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(req.params.id);

    await Activity.logActivity(
      req.user._id,
      'deleted',
      'project',
      project._id,
      `Deleted project "${project.title}"`
    );

    return successResponse(res, 'Project and associated tasks deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add member to project
 * @route   POST /api/projects/:id/members
 * @access  Private (Admin)
 */
const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    if (project.teamMembers.includes(userId)) {
      return errorResponse(res, 'User is already a member of this project', 400);
    }

    project.teamMembers.push(userId);
    await project.save();

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email avatar')
      .populate('teamMembers', 'name email avatar role');

    await Activity.logActivity(
      req.user._id,
      'added_member',
      'member',
      project._id,
      `Added a member to project "${project.title}"`
    );

    return successResponse(res, 'Member added successfully', { project: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove member from project
 * @route   DELETE /api/projects/:id/members/:userId
 * @access  Private (Admin)
 */
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    const memberIndex = project.teamMembers.indexOf(req.params.userId);
    if (memberIndex === -1) {
      return errorResponse(res, 'User is not a member of this project', 400);
    }

    project.teamMembers.splice(memberIndex, 1);
    await project.save();

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email avatar')
      .populate('teamMembers', 'name email avatar role');

    await Activity.logActivity(
      req.user._id,
      'removed_member',
      'member',
      project._id,
      `Removed a member from project "${project.title}"`
    );

    return successResponse(res, 'Member removed successfully', { project: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
