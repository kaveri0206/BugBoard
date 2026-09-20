const Project = require('../models/Project');
const Issue = require('../models/Issue');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { recordActivity } = require('../services/audit.service');
const { ACTIVITY_ACTIONS, ROLES } = require('../config/constants');

const createProject = asyncHandler(async (req, res) => {
  const { name, projectKey, description, members } = req.body;

  const existing = await Project.findOne({ projectKey: projectKey.toUpperCase() });
  if (existing) {
    throw new ApiError(409, `Project key '${projectKey}' already exists.`);
  }

  const initialMembers = Array.isArray(members) ? [...new Set([...members, req.user._id.toString()])] : [req.user._id];

  const project = await Project.create({
    name,
    projectKey: projectKey.toUpperCase(),
    description,
    owner: req.user._id,
    members: initialMembers,
  });

  await recordActivity({
    actorId: req.user._id,
    action: ACTIVITY_ACTIONS.PROJECT_CREATED,
    entityType: 'Project',
    entityId: project._id,
    newValue: project,
    message: `Project ${project.name} (${project.projectKey}) created.`,
  });

  return ApiResponse.created(res, { project }, 'Project created successfully');
});

const getProjects = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role !== ROLES.ADMIN) {
    filter.members = req.user._id;
  }

  const projects = await Project.find(filter)
    .populate('owner', 'name email avatar')
    .populate('members', 'name email avatar role')
    .sort({ createdAt: -1 });

  return ApiResponse.success(res, { projects }, 'Projects fetched successfully');
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email avatar')
    .populate('members', 'name email avatar role');

  if (!project) throw new ApiError(404, 'Project not found');

  if (
    req.user.role !== ROLES.ADMIN &&
    !project.members.some((m) => m._id.toString() === req.user._id.toString())
  ) {
    throw new ApiError(403, 'Access denied: You are not assigned to this project.');
  }

  const issueStats = await Issue.aggregate([
    { $match: { project: project._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  return ApiResponse.success(res, { project, stats: issueStats }, 'Project details fetched');
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!project) throw new ApiError(404, 'Project not found');

  await recordActivity({
    actorId: req.user._id,
    action: ACTIVITY_ACTIONS.UPDATED,
    entityType: 'Project',
    entityId: project._id,
    newValue: req.body,
    message: `Project ${project.name} updated.`,
  });

  return ApiResponse.success(res, { project }, 'Project updated successfully');
});

const addProjectMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');

  if (!project.members.includes(userId)) {
    project.members.push(userId);
    await project.save();
  }

  return ApiResponse.success(res, { project }, 'Member added to project');
});

const removeProjectMember = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');

  project.members = project.members.filter((m) => m.toString() !== userId);
  await project.save();

  return ApiResponse.success(res, { project }, 'Member removed from project');
});

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  addProjectMember,
  removeProjectMember,
};