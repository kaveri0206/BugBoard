/**
 * @file project.controller.js
 * @description Controller for projects list and workspace detail views.
 */

const Project = require('../models/Project');
const User = require('../models/User');
const Issue = require('../models/Issue');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

/**
 * @route   GET /api/v1/projects
 * @desc    Fetch all projects with defect count summaries
 */
const getProjects = asyncHandler(async (req, res) => {
  try {
    const projects = await Project.find()
      .populate({ path: 'lead', select: 'name email role' })
      .populate({ path: 'members', select: 'name email role' })
      .lean();

    const projectsWithCounts = await Promise.all(
      (projects || []).map(async (project) => {
        try {
          const count = await Issue.countDocuments({ project: project._id });
          return {
            ...project,
            issueCount: count,
            totalIssues: count,
          };
        } catch (e) {
          return {
            ...project,
            issueCount: 0,
            totalIssues: 0,
          };
        }
      })
    );

    return res.status(200).json({
      success: true,
      count: projectsWithCounts.length,
      data: projectsWithCounts,
      projects: projectsWithCounts,
    });
  } catch (err) {
    console.error('[GET PROJECTS ERROR]:', err);
    return res.status(200).json({
      success: true,
      count: 0,
      data: [],
      projects: [],
    });
  }
});

/**
 * @route   GET /api/v1/projects/:id
 * @desc    Fetch single project details and associated defect list
 */
const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
  const query = isMongoId ? { _id: id } : { key: id.toUpperCase() };

  const project = await Project.findOne(query)
    .populate({ path: 'lead', select: 'name email role' })
    .populate({ path: 'members', select: 'name email role' })
    .lean();

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const issues = await Issue.find({ project: project._id })
    .populate({ path: 'assignee', select: 'name email' })
    .sort({ createdAt: -1 })
    .lean();

  const payload = {
    ...project,
    issues: issues || [],
    issueCount: (issues || []).length,
  };

  return res.status(200).json({
    success: true,
    data: payload,
    project: payload,
    issues: issues || [],
  });
});

/**
 * @route   POST /api/v1/projects
 */
const createProject = asyncHandler(async (req, res) => {
  const { name, key, description, members } = req.body;
  const project = await Project.create({
    name,
    key: key.toUpperCase(),
    projectKey: key.toUpperCase(),
    description,
    lead: req.user._id,
    members: members && members.length > 0 ? members : [req.user._id],
  });

  return res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project,
    project: project,
  });
});

module.exports = {
  getProjects,
  getProjectById,
  createProject,
};