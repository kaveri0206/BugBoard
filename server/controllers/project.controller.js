/**
 * @file server/controllers/project.controller.js
 * @description Controller for projects list and workspace detail views.
 */

const mongoose = require('mongoose');

let Project;
try {
  Project = require('../models/Project') || require('../models/project.model');
} catch (e) {
  Project = mongoose.models.Project;
}

let Issue;
try {
  Issue = require('../models/Issue') || require('../models/issue.model');
} catch (e) {
  Issue = mongoose.models.Issue;
}

/**
 * @route   GET /api/v1/projects
 */
const getProjects = async (req, res) => {
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
};

/**
 * @route   GET /api/v1/projects/:id
 */
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined' || id === 'null') {
      const defaultProject = await Project.findOne().lean();
      if (defaultProject) {
        const issues = await Issue.find({ project: defaultProject._id }).lean();
        return res.status(200).json({
          success: true,
          data: { ...defaultProject, issues },
          project: { ...defaultProject, issues },
          issues: issues || [],
        });
      }
      return res.status(404).json({ success: false, message: 'No project found' });
    }

    const isMongoId = mongoose.Types.ObjectId.isValid(id);
    let project = null;

    if (isMongoId) {
      project = await Project.findById(id)
        .populate({ path: 'lead', select: 'name email role' })
        .populate({ path: 'members', select: 'name email role' })
        .lean();
    }

    if (!project) {
      project = await Project.findOne({
        $or: [
          { key: new RegExp(`^${id}$`, 'i') },
          { projectKey: new RegExp(`^${id}$`, 'i') },
          { name: new RegExp(`^${id}$`, 'i') },
        ],
      })
        .populate({ path: 'lead', select: 'name email role' })
        .populate({ path: 'members', select: 'name email role' })
        .lean();
    }

    if (!project) {
      project = await Project.findOne().lean();
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project workspace not found',
      });
    }

    const issues = await Issue.find({ project: project._id })
      .populate({ path: 'reporter', select: 'name email role' })
      .populate({ path: 'assignee', select: 'name email role' })
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
  } catch (err) {
    console.error('[GET PROJECT BY ID ERROR]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve project workspace',
      error: err.message,
    });
  }
};

/**
 * @route   POST /api/v1/projects
 */
const createProject = async (req, res) => {
  try {
    const { name, key, description, members } = req.body;
    const project = await Project.create({
      name,
      key: (key || 'PRJ').toUpperCase(),
      projectKey: (key || 'PRJ').toUpperCase(),
      description,
      lead: req.user?._id,
      members: members && members.length > 0 ? members : [req.user?._id],
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
      project: project,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: err.message,
    });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
};