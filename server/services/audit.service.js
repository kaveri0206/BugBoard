const ActivityLog = require('../models/ActivityLog');
const logger = require('../utils/logger');

const recordActivity = async ({ actorId, action, entityType, entityId, oldValue, newValue, message }) => {
  try {
    return await ActivityLog.create({
      actor: actorId,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      message,
    });
  } catch (error) {
    logger.error('Failed to write activity audit record:', error.message);
  }
};

module.exports = { recordActivity };