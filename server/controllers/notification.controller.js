const Notification = require('../models/Notification');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('relatedIssue', 'issueKey title')
    .sort({ createdAt: -1 })
    .limit(30);

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  return ApiResponse.success(
    res,
    { notifications, unreadCount },
    'Notifications retrieved'
  );
});

const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Notification.findOneAndUpdate(
    { _id: id, recipient: req.user._id },
    { isRead: true }
  );

  return ApiResponse.success(res, null, 'Marked notification as read');
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  return ApiResponse.success(res, null, 'All notifications marked as read');
});

module.exports = { getNotifications, markAsRead, markAllAsRead };