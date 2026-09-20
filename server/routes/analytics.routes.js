/**
 * @file server/routes/analytics.routes.js
 * @description Routes for analytics and telemetry metric calculations.
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', analyticsController.getMetrics);
router.get('/metrics', analyticsController.getMetrics);

module.exports = router;