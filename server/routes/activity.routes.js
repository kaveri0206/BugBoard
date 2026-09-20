/**
 * @file activity.routes.js
 * @description Routes for global audit trail and ticket-specific activity timelines.
 */

const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');

// Resolve auth middleware safely
let protect = (req, res, next) => next();
try {
  const authMiddleware = require('../middleware/auth.middleware') || require('../middleware/auth');
  if (typeof authMiddleware.protect === 'function') protect = authMiddleware.protect;
  else if (typeof authMiddleware === 'function') protect = authMiddleware;
} catch (e) {
  // Pass through if not found
}

router.get('/', protect, activityController.getAllActivities);
router.get('/issue/:issueId', protect, activityController.getIssueActivities);

module.exports = router;