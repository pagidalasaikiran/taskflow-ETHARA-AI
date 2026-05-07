const User = require('../models/User');
const { successResponse } = require('../utils/apiResponse');

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/users
 * @access  Private (Admin)
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    return successResponse(res, 'Users fetched successfully', { users });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get team members (for dropdowns/assignment)
 * @route   GET /api/users/team
 * @access  Private
 */
const getTeamMembers = async (req, res, next) => {
  try {
    const users = await User.find().select('name email avatar role').sort({ name: 1 });
    return successResponse(res, 'Team members fetched successfully', { users });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getTeamMembers };
