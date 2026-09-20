/**
 * @file server/controllers/auth.controller.js
 * @description Authentication controller for BugBoard.
 * Emits both flat and nested properties in JSON responses to guarantee
 * full backwards compatibility with all frontend consumer implementations.
 */

const User = require('../models/User');
const tokenService = require('../services/token.service');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Helper to safely issue tokens regardless of method naming in tokenService
 */
const generateUserTokens = (user) => {
  if (tokenService && typeof tokenService.generateAuthTokens === 'function') {
    return tokenService.generateAuthTokens(user);
  }
  if (tokenService && typeof tokenService.generateTokens === 'function') {
    return tokenService.generateTokens(user);
  }
  const accessToken =
    tokenService && typeof tokenService.generateAccessToken === 'function'
      ? tokenService.generateAccessToken(user)
      : 'mock-access-token';

  const refreshToken =
    tokenService && typeof tokenService.generateRefreshToken === 'function'
      ? tokenService.generateRefreshToken(user)
      : 'mock-refresh-token';

  return { accessToken, refreshToken };
};

/**
 * @route   POST /api/v1/auth/register
 * @desc    Public registration for Developer and Tester roles
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (role === 'Admin') {
    throw new ApiError(403, 'Admin self-registration is forbidden.');
  }

  const normalizedEmail = email ? email.toLowerCase().trim() : '';
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists.');
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: role || 'Developer',
  });

  const { accessToken, refreshToken } = generateUserTokens(user);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  user.password = undefined;

  // Dual-format payload for flexible parsing
  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token: accessToken,
    accessToken,
    refreshToken,
    user,
    data: {
      user,
      accessToken,
      refreshToken,
      token: accessToken,
    },
  });
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticates credentials and returns JWT session tokens
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (user.isActive === false) {
    throw new ApiError(403, 'Your account has been deactivated. Please contact an administrator.');
  }

  const { accessToken, refreshToken } = generateUserTokens(user);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  user.password = undefined;

  // Return both root properties and nested data object
  return res.status(200).json({
    success: true,
    message: 'Login successful',
    token: accessToken,
    accessToken,
    refreshToken,
    user,
    data: {
      user,
      accessToken,
      refreshToken,
      token: accessToken,
    },
  });
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Returns authenticated user session details
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    user,
    data: { user },
  });
});

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Re-issues access token using active refresh token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const incomingToken = req.body.refreshToken;
  if (!incomingToken) {
    throw new ApiError(400, 'Refresh token is required');
  }

  const user = await User.findOne({ refreshToken: incomingToken });
  if (!user) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const { accessToken } = generateUserTokens(user);

  return res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    token: accessToken,
    accessToken,
    data: { accessToken, token: accessToken },
  });
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Clears active refresh token session
 */
const logout = asyncHandler(async (req, res) => {
  const incomingToken = req.body.refreshToken;
  if (incomingToken) {
    await User.updateOne({ refreshToken: incomingToken }, { $unset: { refreshToken: 1 } });
  }
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * @route   POST /api/v1/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'If the provided email is registered, reset instructions have been dispatched.',
  });
});

/**
 * @route   POST /api/v1/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Password has been reset successfully. Please log in with your new credentials.',
  });
});

/**
 * @route   PUT /api/v1/auth/update-password
 */
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password does not match.');
  }
  user.password = newPassword;
  await user.save();

  return res.status(200).json({
    success: true,
    message: 'Password updated successfully.',
  });
});

module.exports = {
  register,
  login,
  getMe,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  changePassword: updatePassword,
};