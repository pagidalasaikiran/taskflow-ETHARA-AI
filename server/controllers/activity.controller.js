const Activity = require('../models/Activity');
const { successResponse } = require('../utils/apiResponse');

/**
 * @desc    Get recent activities
 * @route   GET /api/activities/recent
 * @access  Private
 */
const getRecentActivities = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const activities = await Activity.find()
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    return successResponse(res, 'Activities fetched successfully', { activities });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecentActivities };
