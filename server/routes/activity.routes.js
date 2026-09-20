const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.get('/issue/:issueId', activityController.getIssueActivities);
router.get('/audit-log', authorizeRoles(ROLES.ADMIN), activityController.getAuditLogs);

module.exports = router;