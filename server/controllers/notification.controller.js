/**
 * @file notification.controller.js
 * @description Safe controller for notifications.
 */

const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

const getNotifications = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(200).json({
      success: true,
      data: [],
      notifications: [],
      unreadCount: 0,
    });
  }

  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({ path: 'sender', select: 'name email role' })
      .populate({ path: 'issue', select: 'issueKey title' })
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    }).catch(() => 0);

    return res.status(200).json({
      success: true,
      data: notifications || [],
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
    });
  } catch (err) {
    return res.status(200).json({
      success: true,
      data: [],
      notifications: [],
      unreadCount: 0,
    });
  }
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );

  return res.status(200).json({
    success: true,
    data: notification,
  });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  if (req.user && req.user._id) {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
  }
  return res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};