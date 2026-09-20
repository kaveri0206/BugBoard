const User = require('../models/User');
const Issue = require('../models/Issue');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { recordActivity } = require('../services/audit.service');
const { ACTIVITY_ACTIONS } = require('../config/constants');

const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isActive, search } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(filter).sort({ createdAt: -1 });

  // Attach assigned issue count
  const enrichedUsers = await Promise.all(
    users.map(async (u) => {
      const assignedCount = await Issue.countDocuments({ assignee: u._id });
      return {
        ...u.toObject(),
        assignedIssuesCount: assignedCount,
      };
    })
  );

  return ApiResponse.success(res, { users: enrichedUsers }, 'Users retrieved successfully');
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const targetUser = await User.findById(id);
  if (!targetUser) throw new ApiError(404, 'User not found');

  const oldRole = targetUser.role;
  targetUser.role = role;
  await targetUser.save();

  await recordActivity({
    actorId: req.user._id,
    action: ACTIVITY_ACTIONS.UPDATED,
    entityType: 'User',
    entityId: targetUser._id,
    oldValue: { role: oldRole },
    newValue: { role },
    message: `User ${targetUser.name} role changed from ${oldRole} to ${role}`,
  });

  return ApiResponse.success(res, { user: targetUser }, 'User role updated successfully');
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const targetUser = await User.findById(id);
  if (!targetUser) throw new ApiError(404, 'User not found');

  if (targetUser._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'Cannot deactivate your own administrator account');
  }

  targetUser.isActive = !targetUser.isActive;
  await targetUser.save();

  await recordActivity({
    actorId: req.user._id,
    action: ACTIVITY_ACTIONS.UPDATED,
    entityType: 'User',
    entityId: targetUser._id,
    newValue: { isActive: targetUser.isActive },
    message: `User ${targetUser.name} active state set to ${targetUser.isActive}`,
  });

  return ApiResponse.success(res, { user: targetUser }, 'User status toggled');
});

module.exports = { getAllUsers, updateUserRole, toggleUserStatus };