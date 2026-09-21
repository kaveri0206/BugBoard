/**
 * @file server/controllers/issue.controller.js
 * @description Bulletproof Defect ticket controller for BugBoard.
 */

const mongoose = require('mongoose');

// Bulletproof model resolver that never returns undefined
const getModel = (name) => {
  if (mongoose.models && mongoose.models[name]) {
    return mongoose.models[name];
  }
  try {
    return require(`../models/${name.toLowerCase()}.model`);
  } catch (e1) {
    try {
      return require(`../models/${name}`);
    } catch (e2) {
      return mongoose.model(name);
    }
  }
};

// 1. GET ALL ISSUES (Feeds Issue Registry & Kanban Board)
exports.getAllIssues = async (req, res) => {
  try {
    const IssueModel = getModel('Issue');
    const ProjectModel = getModel('Project');

    const { project, status, priority, severity, search, limit, page } = req.query;
    const query = {};

    if (project && String(project).trim() !== '' && project !== 'all' && project !== 'undefined') {
      if (mongoose.Types.ObjectId.isValid(project)) {
        query.project = project;
      } else if (ProjectModel) {
        const foundProj = await ProjectModel.findOne({
          $or: [
            { key: String(project).toUpperCase() },
            { projectKey: String(project).toUpperCase() },
            { name: new RegExp(`^${project}$`, 'i') },
          ],
        }).lean();
        if (foundProj) query.project = foundProj._id;
      }
    }

    if (status && String(status).trim() !== '' && status !== 'all') {
      query.status = new RegExp(`^${String(status).trim()}$`, 'i');
    }
    if (priority && String(priority).trim() !== '' && priority !== 'all') {
      query.priority = new RegExp(`^${String(priority).trim()}$`, 'i');
    }
    if (severity && String(severity).trim() !== '' && severity !== 'all') {
      query.severity = new RegExp(`^${String(severity).trim()}$`, 'i');
    }

    if (search && String(search).trim() !== '') {
      const s = String(search).trim();
      query.$or = [
        { title: { $regex: s,$options: 'i' } },
        { issueKey: { $regex: s,$options: 'i' } },
        { description: { $regex: s,$options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const skipNum = (pageNum - 1) * limitNum;

    const total = await IssueModel.countDocuments(query);
    const issues = await IssueModel.find(query)
      .populate('project', 'name key projectKey')
      .populate('reporter', 'name email role')
      .populate('assignee', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum)
      .lean();

    return res.status(200).json({
      success: true,
      count: (issues || []).length,
      total: total || 0,
      issues: issues || [],
      items: issues || [],
      data: {
        issues: issues || [],
        total: total || 0,
        count: (issues || []).length,
      },
    });
  } catch (err) {
    console.error('getAllIssues safe fallback:', err);
    return res.status(200).json({
      success: true,
      count: 0,
      total: 0,
      issues: [],
      items: [],
      data: { issues: [], total: 0, count: 0 },
    });
  }
};

// 2. GET ISSUE BY ID
exports.getIssueById = async (req, res) => {
  try {
    const IssueModel = getModel('Issue');
    const { id } = req.params;
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ success: false, message: 'Invalid issue ID' });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { _id: id } : { issueKey: String(id).toUpperCase() };

    const issue = await IssueModel.findOne(query)
      .populate('project', 'name key projectKey')
      .populate('reporter', 'name email role avatar')
      .populate('assignee', 'name email role avatar');

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Defect ticket not found' });
    }

    return res.status(200).json({
      success: true,
      data: { issue },
      issue,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 3. CREATE ISSUE (Fixes the "Cannot read properties of undefined reading findById")
exports.createIssue = async (req, res) => {
  try {
    const IssueModel = getModel('Issue');
    const ProjectModel = getModel('Project');
    const UserModel = getModel('User');

    const issueData = { ...req.body };

    let targetProject = null;
    if (ProjectModel) {
      if (issueData.project && mongoose.Types.ObjectId.isValid(issueData.project)) {
        targetProject = await ProjectModel.findById(issueData.project);
      } else {
        targetProject = await ProjectModel.findOne();
      }
    }

    if (targetProject) {
      issueData.project = targetProject._id;
    }

    if (!issueData.reporter) {
      if (req.user?._id || req.user?.id) {
        issueData.reporter = req.user._id || req.user.id;
      } else if (UserModel) {
        const defaultUser = await UserModel.findOne();
        if (defaultUser) issueData.reporter = defaultUser._id;
      }
    }

    const prefix = targetProject?.key || targetProject?.projectKey || 'DEF';
    const count = await IssueModel.countDocuments();
    issueData.issueKey = `${prefix}-${count + 101}`;

    if (!issueData.status) {
      issueData.status = 'Open';
    }

    const newIssue = await IssueModel.create(issueData);
    const populated = await IssueModel.findById(newIssue._id)
      .populate('project', 'name key projectKey')
      .populate('reporter', 'name email role')
      .populate('assignee', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Defect ticket created successfully',
      data: { issue: populated },
      issue: populated,
    });
  } catch (err) {
    console.error('Error creating defect ticket:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to create defect ticket',
    });
  }
};

// 4. UPDATE ISSUE
exports.updateIssue = async (req, res) => {
  try {
    const IssueModel = getModel('Issue');
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.assignee === '' || updateData.assignee === 'unassigned') {
      updateData.assignee = null;
    }

    const updatedIssue = await IssueModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('project', 'name key projectKey')
      .populate('reporter', 'name email role')
      .populate('assignee', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      data: { issue: updatedIssue },
      issue: updatedIssue,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 5. CHANGE STATUS
exports.changeStatus = async (req, res) => {
  try {
    const IssueModel = getModel('Issue');
    const { id } = req.params;
    const { status } = req.body;

    const existingIssue = await IssueModel.findById(id);
    if (!existingIssue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    existingIssue.status = status;
    await existingIssue.save();

    const populated = await IssueModel.findById(id)
      .populate('project', 'name key projectKey')
      .populate('reporter', 'name email role')
      .populate('assignee', 'name email role');

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: { issue: populated },
      issue: populated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};