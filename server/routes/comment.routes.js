const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createCommentSchema } = require('../validators/comment.validator');

router.use(authenticate);

router.post('/issue/:id', validate(createCommentSchema), commentController.addComment);
router.get('/issue/:id', commentController.getCommentsByIssue);
router.delete('/:commentId', commentController.deleteComment);

module.exports = router;