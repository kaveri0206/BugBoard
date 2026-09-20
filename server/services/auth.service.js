const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateTokens = (user) => {
  const payload = {
    id: user._id,
    role: user.role,
    email: user.email,
  };

  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '15m',
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

  return { accessToken, refreshToken };
};

module.exports = {
  generateTokens,
  // ... other methods
};