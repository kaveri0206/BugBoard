const mongoose = require('mongoose');
const { ACTIVITY_ACTIONS } = require('../config/constants');

const activityLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: Object.values(ACTIVITY_ACTIONS),
      required: true,
    },
    entityType: {
      type: String,
      enum: ['Issue', 'Project', 'Comment', 'User'],
      required: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ entityId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);