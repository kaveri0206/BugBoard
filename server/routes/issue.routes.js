const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issue.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createIssueSchema,
  updateIssueSchema,
  statusTransitionSchema,
} = require('../validators/issue.validator');

router.use(authenticate);

router.post('/', validate(createIssueSchema), issueController.createIssue);
router.get('/', issueController.getIssues);
router.post('/check-duplicates', issueController.checkDuplicateIssues);
router.get('/:id', issueController.getIssueById);
router.put('/:id', validate(updateIssueSchema), issueController.updateIssue);
router.patch('/:id/status', validate(statusTransitionSchema), issueController.transitionStatus);
router.patch('/:id/assign', issueController.assignIssue);

module.exports = router;