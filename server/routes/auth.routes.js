/**
 * @file server/routes/auth.routes.js
 * @description Express routing definitions for user authentication.
 * Wraps handlers defensively so Express never receives an undefined callback.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Helper to prevent Express crash if any function is missing
const safeHandler = (handler, routeName) => {
  if (typeof handler === 'function') {
    return handler;
  }
  return (req, res) => {
    res.status(501).json({
      success: false,
      message: `Auth route '${routeName}' is not implemented on the server.`,
    });
  };
};

// Public Endpoints
router.post('/register', safeHandler(authController.register, 'register'));
router.post('/login', safeHandler(authController.login, 'login'));
router.post('/refresh', safeHandler(authController.refreshToken, 'refreshToken'));
router.post('/logout', safeHandler(authController.logout, 'logout'));
router.post('/forgot-password', safeHandler(authController.forgotPassword, 'forgotPassword'));
router.post('/reset-password', safeHandler(authController.resetPassword, 'resetPassword'));

// Protected Endpoints
router.get('/me', authenticate, safeHandler(authController.getMe, 'getMe'));
router.put('/update-password', authenticate, safeHandler(authController.updatePassword, 'updatePassword'));

module.exports = router;