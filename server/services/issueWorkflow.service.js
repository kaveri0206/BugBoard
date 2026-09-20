const { ISSUE_STATUS, ROLES } = require('../config/constants');
const ApiError = require('../utils/apiError');

/**
 * Validates whether a given status transition is permitted based on user role and state machine.
 */
const validateTransition = (currentStatus, targetStatus, user, assigneeId) => {
  if (currentStatus === targetStatus) return true;

  const role = user.role;
  const isAssignee = assigneeId && assigneeId.toString() === user._id.toString();

  const allowedTransitions = {
    [ISSUE_STATUS.OPEN]: [ISSUE_STATUS.IN_PROGRESS, ISSUE_STATUS.CLOSED],
    [ISSUE_STATUS.IN_PROGRESS]: [ISSUE_STATUS.TESTING, ISSUE_STATUS.OPEN],
    [ISSUE_STATUS.TESTING]: [ISSUE_STATUS.RESOLVED, ISSUE_STATUS.REOPENED],
    [ISSUE_STATUS.RESOLVED]: [ISSUE_STATUS.CLOSED, ISSUE_STATUS.REOPENED],
    [ISSUE_STATUS.CLOSED]: [ISSUE_STATUS.REOPENED],
    [ISSUE_STATUS.REOPENED]: [ISSUE_STATUS.IN_PROGRESS, ISSUE_STATUS.CLOSED],
  };

  const validNextStates = allowedTransitions[currentStatus] || [];
  if (!validNextStates.includes(targetStatus)) {
    throw new ApiError(
      422,
      `Invalid workflow transition from '${currentStatus}' to '${targetStatus}'. Allowed next: [${validNextStates.join(', ')}]`
    );
  }

  // Role permissions enforcement
  if (role === ROLES.ADMIN) return true;

  if (role === ROLES.DEVELOPER) {
    if (targetStatus === ISSUE_STATUS.IN_PROGRESS && !isAssignee) {
      throw new ApiError(403, 'Developers can only move issues assigned to them into In Progress.');
    }
    if ([ISSUE_STATUS.RESOLVED, ISSUE_STATUS.CLOSED].includes(targetStatus)) {
      throw new ApiError(403, 'Developers are not authorized to mark issues Resolved or Closed. Hand off to Testing.');
    }
  }

  if (role === ROLES.TESTER) {
    if (targetStatus === ISSUE_STATUS.IN_PROGRESS) {
      throw new ApiError(403, 'Testers cannot move issues into In Progress.');
    }
  }

  return true;
};

module.exports = { validateTransition };