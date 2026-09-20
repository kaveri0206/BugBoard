const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { uploadFile, deleteFile } = require('../services/storage.service');

const handleFileUpload = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file provided in payload');
  const uploadedAsset = await uploadFile(req.file);
  return ApiResponse.created(res, { asset: uploadedAsset }, 'File uploaded successfully');
});

const handleFileDelete = asyncHandler(async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) throw new ApiError(400, 'publicId required');
  await deleteFile(publicId);
  return ApiResponse.success(res, null, 'File removed');
});

module.exports = { handleFileUpload, handleFileDelete };