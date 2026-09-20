/**
 * @file user.controller.js
 * @description Controller for administrative user management (roles, activation status, directory).
 */

const User = require('../models/User');
const Issue = require('../models/Issue');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

/**
 * @route   GET /api/v1/users
 * @desc    Fetch all users with counts of their assigned defect tickets
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();

  const usersWithCounts = await Promise.all(
    users.map(async (u) => {
      const assignedCount = await Issue.countDocuments({ assignee: u._id }).catch(() => 0);
      return {
        ...u,
        assignedIssuesCount: assignedCount,
      };
    })
  );

  return res.status(200).json({
    success: true,
    count: usersWithCounts.length,
    data: { users: usersWithCounts },
    users: usersWithCounts,
  });
});

/**
 * @route   PATCH /api/v1/users/:id/role
 * @desc    Update a user's RBAC role (Admin, Developer, Tester)
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['Admin', 'Developer', 'Tester'].includes(role)) {
    throw new ApiError(400, 'A valid role (Admin, Developer, Tester) is required.');
  }

  const userToUpdate = await User.findById(id);
  if (!userToUpdate) {
    throw new ApiError(404, 'Target user not found');
  }

  const oldRole = userToUpdate.role;
  userToUpdate.role = role;
  await userToUpdate.save();

  // Log to Audit Trail
  await ActivityLog.create({
    action: 'UPDATED',
    user: req.user._id,
    actor: req.user._id,
    message: `Updated role of ${userToUpdate.name} from ${oldRole} to ${role}`,
    details: { targetUserId: userToUpdate._id, oldRole, newRole: role },
  }).catch(() => null);

  return res.status(200).json({
    success: true,
    message: `Role successfully changed to ${role}`,
    data: { user: userToUpdate },
    user: userToUpdate,
  });
});

/**
 * @route   PATCH /api/v1/users/:id/status
 * @desc    Toggle user active/deactivated state
 */
const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const targetUser = await User.findById(id);
  if (!targetUser) {
    throw new ApiError(404, 'Target user not found');
  }

  // Prevent admin from locking their own account
  if (targetUser._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'Security Guard: You cannot deactivate your own active session.');
  }

  targetUser.isActive = !targetUser.isActive;
  await targetUser.save();

  // Log to Audit Trail
  await ActivityLog.create({
    action: 'UPDATED',
    user: req.user._id,
    actor: req.user._id,
    message: `${targetUser.isActive ? 'Activated' : 'Deactivated'} account for ${targetUser.name}`,
    details: { targetUserId: targetUser._id, isActive: targetUser.isActive },
  }).catch(() => null);

  return res.status(200).json({
    success: true,
    message: `User status changed to ${targetUser.isActive ? 'Active' : 'Disabled'}`,
    data: { user: targetUser },
    user: targetUser,
  });
});

module.exports = {
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
};