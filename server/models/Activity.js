const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      enum: ['project', 'task', 'member'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for recent activity queries
activitySchema.index({ createdAt: -1 });

/**
 * Static helper to log an activity
 */
activitySchema.statics.logActivity = async function (user, action, entityType, entityId, details = '') {
  try {
    await this.create({ user, action, entityType, entityId, details });
  } catch (error) {
    console.error('Failed to log activity:', error.message);
  }
};

module.exports = mongoose.model('Activity', activitySchema);
