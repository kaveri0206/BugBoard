/**
 * @file utils/apiResponse.js
 * @description Standardized JSON response wrapper for API controllers.
 */

class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
    });
  }

  static created(res, data = null, message = 'Created successfully') {
    return this.success(res, data, message, 201);
  }
}

module.exports = ApiResponse;