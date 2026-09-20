const ApiError = require('../utils/apiError');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));
      return next(new ApiError(422, 'Validation failed', errorDetails));
    }

    req[property] = value;
    next();
  };
};

module.exports = validate;