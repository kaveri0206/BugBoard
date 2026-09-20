const jwt = require('jsonwebtoken');
const env = require('../config/env');
const Token = require('../models/Token');

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
  );
};

const generateRefreshToken = async (user) => {
  const token = jwt.sign({ id: user._id }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await Token.create({
    userId: user._id,
    token,
    type: 'REFRESH',
    expiresAt,
  });

  return token;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};