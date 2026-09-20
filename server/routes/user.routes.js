const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.get('/', userController.getAllUsers);
router.patch('/:id/role', authorizeRoles(ROLES.ADMIN), userController.updateUserRole);
router.patch('/:id/status', authorizeRoles(ROLES.ADMIN), userController.toggleUserStatus);

module.exports = router;