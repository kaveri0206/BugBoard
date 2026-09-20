const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { analyzeBugReport } = require('../services/ai.service');

const analyzeIssue = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const analysis = await analyzeBugReport(title, description);
  return ApiResponse.success(res, { analysis }, 'AI analysis generated');
});

module.exports = { analyzeIssue };