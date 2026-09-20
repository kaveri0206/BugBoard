const Comment = require('../models/Comment');
const Issue = require('../models/Issue');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { recordActivity } = require('../services/audit.service');
const { createNotification } = require('../services/notification.service');
const {
  ACTIVITY_ACTIONS,
  NOTIFICATION_TYPES,
  ROLES,
} = require('../config/constants');

const addComment = asyncHandler(async (req, res) => {
  const { id: issueId } = req.params;
  const { content } = req.body;

  const issue = await Issue.findById(issueId);
  if (!issue) throw new ApiError(404, 'Issue not found');

  // Detect @mentions (e.g., @john or @user@domain.com)
  const mentionMatches = content.match(/@([a-zA-Z0-9._-]+)/g) || [];
  const mentionedUsernames = mentionMatches.map((m) => m.slice(1).toLowerCase());

  const mentionedUsers = await User.find({
    $or: [
      { name: { $in: mentionedUsernames.map((u) => new RegExp(`^${u}$`, 'i')) } },
      { email: { $in: mentionedUsernames } },
    ],
  }).select('_id');

  const comment = await Comment.create({
    issue: issue._id,
    author: req.user._id,
    content,
    mentions: mentionedUsers.map((u) => u._id),
  });

  await recordActivity({
    actorId: req.user._id,
    action: ACTIVITY_ACTIONS.COMMENT_ADDED,
    entityType: 'Issue',
    entityId: issue._id,
    newValue: { commentId: comment._id },
    message: `Comment added to [${issue.issueKey}]`,
  });

  // Notify mentioned users
  for (const user of mentionedUsers) {
    if (user._id.toString() !== req.user._id.toString()) {
      await createNotification({
        recipientId: user._id,
        type: NOTIFICATION_TYPES.MENTIONED,
        title: 'You were mentioned',
        message: `${req.user.name} mentioned you on issue [${issue.issueKey}]`,
        relatedIssueId: issue._id,
      });
    }
  }

  // Notify assignee if not the commenter
  if (issue.assignee && issue.assignee.toString() !== req.user._id.toString()) {
    await createNotification({
      recipientId: issue.assignee,
      type: NOTIFICATION_TYPES.COMMENT_ADDED,
      title: 'New Comment',
      message: `${req.user.name} commented on [${issue.issueKey}]`,
      relatedIssueId: issue._id,
    });
  }

  const populated = await Comment.findById(comment._id).populate('author', 'name email avatar role');

  return ApiResponse.created(res, { comment: populated }, 'Comment posted successfully');
});

const getCommentsByIssue = asyncHandler(async (req, res) => {
  const { id: issueId } = req.params;
  const comments = await Comment.find({ issue: issueId })
    .populate('author', 'name email avatar role')
    .sort({ createdAt: 1 });

  return ApiResponse.success(res, { comments }, 'Comments retrieved');
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, 'Comment not found');

  if (req.user.role !== ROLES.ADMIN && comment.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have permission to delete this comment.');
  }

  await Comment.findByIdAndDelete(commentId);
  return ApiResponse.success(res, null, 'Comment deleted successfully');
});

module.exports = { addComment, getCommentsByIssue, deleteComment };