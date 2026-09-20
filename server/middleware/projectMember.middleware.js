const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const Project = require('../models/Project');
const { ROLES } = require('../config/constants');

const checkProjectAccess = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId || req.body.project || req.params.id;
  if (!projectId) return next();

  if (req.user.role === ROLES.ADMIN) return next();

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const isMember = project.members.some(
    (memberId) => memberId.toString() === req.user._id.toString()
  );

  if (!isMember) {
    throw new ApiError(403, 'Forbidden: You are not assigned to this project.');
  }

  req.project = project;
  next();
});

module.exports = { checkProjectAccess };