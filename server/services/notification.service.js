const Notification = require('../models/Notification');
const User = require('../models/User');
const { NOTIFICATION_TYPES } = require('../config/constants');
const { sendIssueAssignedNotification } = require('./email.service');
const logger = require('../utils/logger');

const createNotification = async ({ recipientId, type, title, message, relatedIssueId }) => {
  try {
    const notif = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      relatedIssue: relatedIssueId || null,
    });

    if (type === NOTIFICATION_TYPES.ISSUE_ASSIGNED && relatedIssueId) {
      const user = await User.findById(recipientId);
      const Issue = require('../models/Issue');
      const issue = await Issue.findById(relatedIssueId);
      if (user && issue) {
        sendIssueAssignedNotification(user, issue).catch((e) => logger.warn(e.message));
      }
    }

    return notif;
  } catch (error) {
    logger.error('Failed to create notification:', error.message);
  }
};

module.exports = { createNotification };