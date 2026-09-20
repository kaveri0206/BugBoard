/**
 * @file user.routes.js
 * @description Administrative user management routes.
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Apply authentication to all user routes
router.use(authenticate);

// Directory list
router.get('/', userController.getAllUsers);

// Role change & status toggle sub-routes
router.patch('/:id/role', userController.updateUserRole);
router.patch('/:id/status', userController.toggleUserStatus);

module.exports = router;