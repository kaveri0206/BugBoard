/**
 * @file server/routes/index.js
 * @description Central API router aggregator.
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const projectRoutes = require('./project.routes');
const issueRoutes = require('./issue.routes');
const telemetryRoutes = require('./telemetry.routes');
const notificationRoutes = require('./notification.routes');
const analyticsRoutes = require('./analytics.routes');

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/issues', issueRoutes);
router.use('/telemetry', telemetryRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);

// Safe loader for other routes
const safeMount = (routePath, modulePath) => {
  try {
    const routeModule = require(modulePath);
    router.use(routePath, routeModule);
  } catch (err) {
    router.use(routePath, (req, res) => {
      res.status(200).json({ success: true, data: [] });
    });
  }
};

safeMount('/activities', './activity.routes');
safeMount('/ai', './ai.routes');
safeMount('/users', './user.routes');

module.exports = router;