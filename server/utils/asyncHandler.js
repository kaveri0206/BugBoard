/**
 * @file utils/asyncHandler.js
 * @description Higher-order wrapper to catch async exceptions and pass them to next().
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;