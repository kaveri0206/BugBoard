const ApiError = require('../utils/apiError');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access Forbidden: Role '${req.user ? req.user.role : 'Guest'}' lacks necessary permission.`
        )
      );
    }
    next();
  };
};

module.exports = { authorizeRoles };