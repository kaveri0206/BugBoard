const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getIssueActivities = asyncHandler(async (req, res) => {
  const { issueId } = req.params;
  const activities = await ActivityLog.find({ entityId: issueId })
    .populate('actor', 'name email avatar role')
    .sort({ createdAt: -1 });

  return ApiResponse.success(res, { activities }, 'Issue timeline retrieved');
});

const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const [logs, totalRecords] = await Promise.all([
    ActivityLog.find()
      .populate('actor', 'name email avatar role')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    ActivityLog.countDocuments(),
  ]);

  return ApiResponse.success(res, { logs }, 'Audit logs retrieved', 200, {
    page: pageNum,
    limit: limitNum,
    totalRecords,
    totalPages: Math.ceil(totalRecords / limitNum),
  });
});

module.exports = { getIssueActivities, getAuditLogs };