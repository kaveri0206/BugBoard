const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const Project = require('../models/Project');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { ISSUE_STATUS, ROLES } = require('../config/constants');

const getDashboardSummary = asyncHandler(async (req, res) => {
  const matchStage = {};
  if (req.user.role !== ROLES.ADMIN) {
    const accessibleProjects = await Project.find({ members: req.user._id }).distinct('_id');
    matchStage.project = { $in: accessibleProjects };
  }

  const now = new Date();

  const [
    totalIssues,
    openIssues,
    inProgressIssues,
    testingIssues,
    resolvedIssues,
    closedIssues,
    criticalIssues,
    urgentIssues,
    myAssignedIssues,
    overdueIssues,
  ] = await Promise.all([
    Issue.countDocuments(matchStage),
    Issue.countDocuments({ ...matchStage, status: ISSUE_STATUS.OPEN }),
    Issue.countDocuments({ ...matchStage, status: ISSUE_STATUS.IN_PROGRESS }),
    Issue.countDocuments({ ...matchStage, status: ISSUE_STATUS.TESTING }),
    Issue.countDocuments({ ...matchStage, status: ISSUE_STATUS.RESOLVED }),
    Issue.countDocuments({ ...matchStage, status: ISSUE_STATUS.CLOSED }),
    Issue.countDocuments({ ...matchStage, severity: 'Critical' }),
    Issue.countDocuments({ ...matchStage, priority: 'Urgent' }),
    Issue.countDocuments({ ...matchStage, assignee: req.user._id }),
    Issue.countDocuments({
      ...matchStage,
      dueDate: { $lt: now },
      status: { $nin: [ISSUE_STATUS.RESOLVED, ISSUE_STATUS.CLOSED] },
    }),
  ]);

  return ApiResponse.success(
    res,
    {
      totalIssues,
      openIssues,
      inProgressIssues,
      testingIssues,
      resolvedIssues,
      closedIssues,
      criticalIssues,
      urgentIssues,
      myAssignedIssues,
      overdueIssues,
    },
    'Dashboard statistics retrieved'
  );
});

const getAnalyticsMetrics = asyncHandler(async (req, res) => {
  const matchStage = {};
  if (req.user.role !== ROLES.ADMIN) {
    const accessibleProjects = await Project.find({ members: req.user._id }).distinct('_id');
    matchStage.project = { $in: accessibleProjects };
  }

  // 1. Issues by Status
  const statusDistribution = await Issue.aggregate([
    { $match: matchStage },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // 2. Issues by Priority
  const priorityDistribution = await Issue.aggregate([
    { $match: matchStage },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);

  // 3. Issues by Severity
  const severityDistribution = await Issue.aggregate([
    { $match: matchStage },
    { $group: { _id: '$severity', count: { $sum: 1 } } },
  ]);

  // 4. Developer Workload
  const developerWorkload = await Issue.aggregate([
    { $match: { ...matchStage, assignee: { $ne: null } } },
    { $group: { _id: '$assignee', count: { $sum: 1 } } },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 1,
        count: 1,
        name: '$user.name',
        email: '$user.email',
      },
    },
  ]);

  return ApiResponse.success(
    res,
    {
      statusDistribution,
      priorityDistribution,
      severityDistribution,
      developerWorkload,
    },
    'Analytics aggregations computed'
  );
});

module.exports = { getDashboardSummary, getAnalyticsMetrics };