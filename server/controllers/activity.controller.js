/**
 * @file activity.controller.js
 * @description Controller for the Immutable System Audit Trail and defect activity streams.
 */

const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   GET /api/v1/activities
 * @route   GET /api/v1/activities/audit
 * @desc    Paginated audit log records for the administrative security ledger
 */
const getAuditLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const skip = (page - 1) * limit;

  const totalRecords = await ActivityLog.countDocuments().catch(() => 0);

  let logs = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({ path: 'user', select: 'name email role' })
    .populate({ path: 'actor', select: 'name email role' })
    .populate({ path: 'issue', select: 'issueKey title' })
    .populate({ path: 'project', select: 'name key' })
    .lean()
    .catch(() => []);

  // Format logs defensively so actor and entityType are guaranteed
  const formattedLogs = logs.map((log) => ({
    ...log,
    actor: log.actor || log.user || { name: 'System Administrator' },
    entityType: log.issue ? 'Defect Issue' : log.project ? 'Project' : 'Security / User',
    message: log.message || `Action ${log.action} performed`,
  }));

  const totalPages = Math.ceil(totalRecords / limit) || 1;

  const meta = {
    page,
    limit,
    totalPages,
    totalRecords,
  };

  return res.status(200).json({
    success: true,
    data: {
      logs: formattedLogs,
    },
    meta,
    logs: formattedLogs,
  });
});

/**
 * @route   GET /api/v1/activities/issues/:issueId
 * @desc    Defect-specific activity history
 */
const getIssueActivities = asyncHandler(async (req, res) => {
  const { issueId } = req.params;

  const activities = await ActivityLog.find({ issue: issueId })
    .sort({ createdAt: -1 })
    .populate({ path: 'user', select: 'name email role' })
    .populate({ path: 'actor', select: 'name email role' })
    .lean()
    .catch(() => []);

  return res.status(200).json({
    success: true,
    data: { activities },
    activities,
  });
});

module.exports = {
  getAuditLogs,
  getIssueActivities,
};