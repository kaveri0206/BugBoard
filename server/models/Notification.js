/**
 * @file Notification.js
 * @description Mongoose model for user notifications.
 */

const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../config/constants');

if (mongoose.models && mongoose.models.Notification) {
  module.exports = mongoose.models.Notification;
} else {
  const notificationSchema = new mongoose.Schema(
    {
      recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Recipient is required'],
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      type: {
        type: String,
        enum: Object.values(NOTIFICATION_TYPES),
        default: NOTIFICATION_TYPES.SYSTEM,
      },
      title: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      issue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
      },
      isRead: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  );

  module.exports = mongoose.model('Notification', notificationSchema);
}