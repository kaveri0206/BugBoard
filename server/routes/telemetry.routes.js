/**
 * @file telemetry.routes.js
 * @description Telemetry metrics routes for BugBoard.
 */

const express = require('express');
const router = express.Router();
const { getTelemetry } = require('../controllers/issue.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Apply authentication
router.use(authenticate);

// Support root, /summary, and /admin endpoints
router.get('/', getTelemetry);
router.get('/summary', getTelemetry);
router.get('/admin', getTelemetry);

module.exports = router;