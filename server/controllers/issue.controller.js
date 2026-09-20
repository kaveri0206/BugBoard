const Issue = require('../models/Issue');
const Project = require('../models/Project');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { validateTransition } = require('../services/issueWorkflow.service');
const { recordActivity } = require('../services/audit.service');
const { createNotification } = require('../services/notification.service');
const { findDuplicates } = require('../services/duplicateDetection.service');
const {
  ACTIVITY_ACTIONS,
  NOTIFICATION_TYPES,
  ISSUE_STATUS,
  ROLES,
} = require('../config/constants');

const createIssue = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.body.project);
  if (!project) throw new ApiError(404, 'Selected project does not exist');

  if (
    req.user.role !== ROLES.ADMIN &&
    !project.members.some((m) => m.toString() === req.user._id.toString())
  ) {
    throw new ApiError(403, 'Forbidden: You are not a member of this project.');
  }

  // Atomic counter increment for key generation (e.g. BUG-1, BUG-2)
  const updatedProject = await Project.findByIdAndUpdate(
    project._id,
    { $inc: { issueCounter: 1 } },
    { new: true }
  );

  const issueKey = `${updatedProject.projectKey}-${updatedProject.issueCounter}`;

  const issue = await Issue.create({
    ...req.body,
    issueKey,
    reporter: req.user._id,
    status: ISSUE_STATUS.OPEN,
  });

  await recordActivity({
    actorId: req.user._id,
    action: ACTIVITY_ACTIONS.CREATED,
    entityType: 'Issue',
    entityId: issue._id,
    newValue: issue,
    message: `Issue [${issue.issueKey}] created: "${issue.title}"`,
  });

  if (issue.assignee) {
    await createNotification({
      recipientId: issue.assignee,
      type: NOTIFICATION_TYPES.ISSUE_ASSIGNED,
      title: 'New Issue Assigned',
      message: `You were assigned to [${issue.issueKey}] ${issue.title}`,
      relatedIssueId: issue._id,
    });
  }

  return ApiResponse.created(res, { issue }, 'Issue created successfully');
});

const getIssues = asyncHandler(async (req, res) => {
  const {
    project,
    status,
    priority,
    severity,
    assignee,
    reporter,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const query = {};

  if (project) query.project = project;
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (severity) query.severity = severity;
  if (assignee) query.assignee = assignee;
  if (reporter) query.reporter = reporter;

  // Project isolation for non-admins if project is not explicitly queried
  if (req.user.role !== ROLES.ADMIN && !project) {
    const accessibleProjects = await Project.find({ members: req.user._id }).distinct('_id');
    query.project = { $in: accessibleProjects };
  }

  if (search) {
    query.$or = [
      { issueKey: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [issues, totalRecords] = await Promise.all([
    Issue.find(query)
      .populate('project', 'name projectKey')
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Issue.countDocuments(query),
  ]);

  return ApiResponse.success(res, { issues }, 'Issues fetched successfully', 200, {
    page: pageNum,
    limit: limitNum,
    totalRecords,
    totalPages: Math.ceil(totalRecords / limitNum),
  });
});

const getIssueById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = id.includes('-') ? { issueKey: id.toUpperCase() } : { _id: id };

  const issue = await Issue.findOne(query)
    .populate('project', 'name projectKey members')
    .populate('assignee', 'name email avatar role')
    .populate('reporter', 'name email avatar role');

  if (!issue) throw new ApiError(404, 'Issue not found');

  return ApiResponse.success(res, { issue }, 'Issue details retrieved');
});

const updateIssue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const issue = await Issue.findById(id);
  if (!issue) throw new ApiError(404, 'Issue not found');

  const oldValues = { ...issue.toObject() };
  Object.assign(issue, req.body);
  await issue.save();

  await recordActivity({
    actorId: req.user._id,
    action: ACTIVITY_ACTIONS.UPDATED,
    entityType: 'Issue',
    entityId: issue._id,
    oldValue: oldValues,
    newValue: issue.toObject(),
    message: `Issue [${issue.issueKey}] attributes updated.`,
  });

  return ApiResponse.success(res, { issue }, 'Issue updated successfully');
});

const transitionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status: targetStatus } = req.body;

  const issue = await Issue.findById(id);
  if (!issue) throw new ApiError(404, 'Issue not found');

  const oldStatus = issue.status;

  // Strict state machine validation
  validateTransition(oldStatus, targetStatus, req.user, issue.assignee);

  issue.status = targetStatus;
  if (targetStatus === ISSUE_STATUS.RESOLVED) issue.resolvedAt = new Date();
  if (targetStatus === ISSUE_STATUS.CLOSED) issue.closedAt = new Date();

  await issue.save();

  await recordActivity({
    actorId: req.user._id,
    action: ACTIVITY_ACTIONS.STATUS_CHANGED,
    entityType: 'Issue',
    entityId: issue._id,
    oldValue: { status: oldStatus },
    newValue: { status: targetStatus },
    message: `Status moved from "${oldStatus}" to "${targetStatus}"`,
  });

  // Notify assignee and reporter
  const notifyList = [issue.assignee, issue.reporter].filter(
    (uid) => uid && uid.toString() !== req.user._id.toString()
  );

  for (const recipient of notifyList) {
    await createNotification({
      recipientId: recipient,
      type: NOTIFICATION_TYPES.STATUS_CHANGED,
      title: 'Issue Status Changed',
      message: `[${issue.issueKey}] was updated to ${targetStatus}`,
      relatedIssueId: issue._id,
    });
  }

  return ApiResponse.success(res, { issue }, 'Status updated successfully');
});

const assignIssue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { assigneeId } = req.body;

  const issue = await Issue.findById(id);
  if (!issue) throw new ApiError(404, 'Issue not found');

  const oldAssignee = issue.assignee;
  issue.assignee = assigneeId || null;
  await issue.save();

  await recordActivity({
    actorId: req.user._id,
    action: ACTIVITY_ACTIONS.ASSIGNED,
    entityType: 'Issue',
    entityId: issue._id,
    oldValue: { assignee: oldAssignee },
    newValue: { assignee: issue.assignee },
    message: `Assignee changed for [${issue.issueKey}]`,
  });

  if (assigneeId && assigneeId.toString() !== req.user._id.toString()) {
    await createNotification({
      recipientId: assigneeId,
      type: NOTIFICATION_TYPES.ISSUE_ASSIGNED,
      title: 'Issue Assigned',
      message: `You were assigned [${issue.issueKey}] ${issue.title}`,
      relatedIssueId: issue._id,
    });
  }

  return ApiResponse.success(res, { issue }, 'Assignee updated successfully');
});

const checkDuplicateIssues = asyncHandler(async (req, res) => {
  const { projectId, title, description } = req.body;
  if (!projectId || !title) {
    throw new ApiError(400, 'projectId and title are required for duplicate checking');
  }

  const duplicates = await findDuplicates(projectId, title, description || '');
  return ApiResponse.success(res, { duplicates }, 'Duplicate check completed');
});

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  transitionStatus,
  assignIssue,
  checkDuplicateIssues,
};