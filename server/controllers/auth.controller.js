const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Token = require('../models/Token');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { generateAccessToken, generateRefreshToken } = require('../services/auth.service');
const { sendEmail } = require('../services/email.service');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'User with this email already exists.');
  }

  const user = await User.create({ name, email, password, role });
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  return ApiResponse.created(
    res,
    {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    },
    'User registered successfully'
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password credentials');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is disabled. Please contact your system administrator.');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  return ApiResponse.success(
    res,
    {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    },
    'Login successful'
  );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, 'Refresh token required');

  const existingToken = await Token.findOne({ token: refreshToken, type: 'REFRESH' });
  if (!existingToken) throw new ApiError(401, 'Invalid or expired refresh token');

  const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw new ApiError(401, 'User account no longer active');

  const newAccessToken = generateAccessToken(user);
  return ApiResponse.success(res, { accessToken: newAccessToken }, 'Token refreshed successfully');
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await Token.deleteOne({ token: refreshToken, type: 'REFRESH' });
  }
  return ApiResponse.success(res, null, 'Logged out successfully');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  return ApiResponse.success(res, { user }, 'Fetched current profile');
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  return ApiResponse.success(res, null, 'Password updated successfully');
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return ApiResponse.success(res, null, 'If that email is registered, a password reset link has been sent.');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await Token.create({
    userId: user._id,
    token: resetToken,
    type: 'PASSWORD_RESET',
    expiresAt,
  });

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'BugBoard Password Reset Request',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Valid for 1 hour.</p>`,
  });

  return ApiResponse.success(res, null, 'Password reset email sent');
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const record = await Token.findOne({ token, type: 'PASSWORD_RESET' });
  if (!record || record.expiresAt < new Date()) {
    throw new ApiError(400, 'Invalid or expired password reset token');
  }

  const user = await User.findById(record.userId);
  if (!user) throw new ApiError(404, 'User not found');

  user.password = newPassword;
  await user.save();
  await Token.deleteOne({ _id: record._id });

  return ApiResponse.success(res, null, 'Password reset successful. You may now login.');
});

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
};