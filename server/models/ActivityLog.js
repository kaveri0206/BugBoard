/**
 * @file ActivityLog.js
 * @description Mongoose model for system activity and audit history.
 */

const mongoose = require('mongoose');
const { ACTIVITY_ACTIONS } = require('../config/constants');

if (mongoose.models && mongoose.models.ActivityLog) {
  module.exports = mongoose.models.ActivityLog;
} else {
  const activityLogSchema = new mongoose.Schema(
    {
      action: {
        type: String,
        enum: Object.values(ACTIVITY_ACTIONS),
        required: [true, 'Action type is required'],
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required for audit logs'],
      },
      actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      issue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
      },
      project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
      details: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
      message: {
        type: String,
        default: '',
      },
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  );

  activityLogSchema.pre('validate', function (next) {
    if (!this.user) {
      this.user = this.actor || this.performedBy || (this.details && this.details.author);
    }
    if (this.user) {
      if (!this.actor) this.actor = this.user;
      if (!this.performedBy) this.performedBy = this.user;
    }
    next();
  });

  module.exports = mongoose.model('ActivityLog', activityLogSchema);
}