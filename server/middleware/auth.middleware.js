/**
 * @file server/middleware/auth.middleware.js
 * @description JWT authentication and Role-Based Access Control (RBAC) middleware.
 */

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Validates incoming Authorization Bearer JWT
 */
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication token missing. Please log in.');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET || 'bugboard-super-secure-jwt-secret-key-2026');
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'The user belonging to this token no longer exists.');
    }

    if (user.isActive === false) {
      throw new ApiError(403, 'Account is deactivated.');
    }

    req.user = user;
    next();
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired session token. Please log in again.');
  }
});

/**
 * Role-Based Access Control guard
 * @param  {...string} roles - Allowed roles e.g., 'Admin', 'Developer', 'Tester'
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Access forbidden: Role '${req.user ? req.user.role : 'Guest'}' is unauthorized.`)
      );
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};