/**
 * @file issue.routes.js
 * @description Defect ticket routes including status transitions.
 */

const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issue.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', issueController.getIssues);
router.post('/', issueController.createIssue);
router.get('/:id', issueController.getIssueById);

// General issue patch
router.patch('/:id', issueController.updateIssue);
router.put('/:id', issueController.updateIssue);

// Dedicated Kanban status transition route
router.patch('/:id/status', issueController.updateIssueStatus || issueController.updateIssue);

router.delete('/:id', issueController.deleteIssue);

module.exports = router;