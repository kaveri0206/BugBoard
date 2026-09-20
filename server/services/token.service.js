/**
 * @file token.service.js
 * @description Centralized JWT creation and verification service.
 * Exports both individual generators and compound methods to prevent missing export errors.
 */

const jwt = require('jsonwebtoken');
const env = require('../config/env');

const JWT_SECRET = env.JWT_SECRET || 'bugboard-super-secure-jwt-secret-key-2026';
const ACCESS_EXPIRY = env.JWT_EXPIRE || '1d';
const REFRESH_SECRET = env.JWT_REFRESH_SECRET || JWT_SECRET;
const REFRESH_EXPIRY = env.JWT_REFRESH_EXPIRE || '7d';

/**
 * Generate Access Token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRY }
  );
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRY }
  );
};

/**
 * Generate Both Tokens
 */
const generateAuthTokens = (user) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateAuthTokens,
  generateTokens: generateAuthTokens,
};