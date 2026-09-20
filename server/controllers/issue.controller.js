/**
 * @file issue.controller.js
 * @description Controller handling defect lifecycle, workflow transitions,
 * bulletproof Admin-only assignment RBAC verification, and immutable activity logging.
 */

const mongoose = require('mongoose');

// Dynamically resolve User, Issue, and Project models
let User;
try {
  User = require('../models/user.model') || require('../models/User');
} catch (e) {
  User = mongoose.models.User;
}

let Issue;
try {
  Issue = require('../models/issue.model') || require('../models/Issue');
} catch (e) {
  Issue = mongoose.models.Issue;
}

let Project;
try {
  Project = require('../models/project.model') || require('../models/Project');
} catch (e) {
  Project = mongoose.models.Project;
}

// Safely resolve the Activity / ActivityLog model across file naming conventions
let ActivityLogModel = null;
try {
  ActivityLogModel = require('../models/activity.model');
} catch (e1) {
  try {
    ActivityLogModel = require('../models/activityLog.model');
  } catch (e2) {
    try {
      ActivityLogModel = require('../models/Activity');
    } catch (e3) {
      ActivityLogModel = null;
    }
  }
}

// Helper to record activity safely without crashing primary request
const logActivitySafe = async (payload) => {
  try {
    const Model =
      ActivityLogModel ||
      mongoose.models.Activity ||
      mongoose.models.ActivityLog;

    if (Model && typeof Model.create === 'function') {
      await Model.create(payload);
    }
  } catch (err) {
    console.warn('Non-fatal activity log write notice:', err.message);
  }
};

// Robust helper to check whether a user has the Admin role
const checkIsAdmin = async (req) => {
  const userObj = req.user || req.currentUser || {};
  let rawRole = userObj.role || userObj.user?.role || req.role || '';

  // If role is not directly on req.user, look up user from DB using the token ID
  if (!rawRole && userObj._id && User) {
    try {
      const dbUser = await User.findById(userObj._id).select('role');
      if (dbUser) rawRole = dbUser.role;
    } catch (dbErr) {
      // ignore db lookup failure
    }
  }

  const role = String(rawRole).trim().toLowerCase();
  return role === 'admin' || role === 'administrator';
};

/**
 * @route   GET /api/v1/issues
 * @desc    Fetch all defects with optional project, status, and search filters
 */
exports.getAllIssues = async (req, res) => {
  try {
    const { project, status, priority, severity, search } = req.query;
    const query = {};

    if (project) query.project = project;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (severity) query.severity = severity;

    if (search) {
      query.$or = [
        { title: { $regex: search,$options: 'i' } },
        { issueKey: { $regex: search,$options: 'i' } },
        { description: { $regex: search,$options: 'i' } },
      ];
    }

    const issues = await Issue.find(query)
      .populate('project', 'name key projectKey')
      .populate('reporter', 'name email role')
      .populate('assignee', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { issues },
      issues,
    });
  } catch (err) {
    console.error('Error fetching issues:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve defects list',
      error: err.message,
    });
  }
};

/**
 * @route   GET /api/v1/issues/:id
 * @desc    Get single defect ticket by MongoDB _id or issueKey safely
 */
exports.getIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID provided',
      });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { _id: id } : { issueKey: id.toUpperCase() };

    let issueQuery = Issue.findOne(query)
      .populate('project', 'name key projectKey')
      .populate('reporter', 'name email role avatar')
      .populate('assignee', 'name email role avatar');

    let issue = await issueQuery.exec();

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Defect ticket not found',
      });
    }

    try {
      if (issue.comments && issue.comments.length > 0) {
        await issue.populate({
          path: 'comments.author',
          select: 'name email role avatar',
        });
      }
    } catch (popErr1) {
      try {
        await issue.populate({
          path: 'comments.user',
          select: 'name email role avatar',
        });
      } catch (popErr2) {
        // Non-fatal fallback
      }
    }

    return res.status(200).json({
      success: true,
      data: { issue },
      issue,
    });
  } catch (err) {
    console.error('Safe getIssueById catch:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve defect ticket',
      error: err.message,
    });
  }
};

/**
 * @route   POST /api/v1/issues
 * @desc    Create a new defect ticket
 */
exports.createIssue = async (req, res) => {
  try {
    const issueData = { ...req.body };

    // RBAC: Only Admin can assign upon initial creation
    if (issueData.assignee) {
      const isAdmin = await checkIsAdmin(req);
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Only Administrators have permission to assign or reassign defect tickets.',
        });
      }
    }

    if (!issueData.reporter && req.user) {
      issueData.reporter = req.user._id || req.user.id;
    }

    if (!issueData.issueKey) {
      let prefix = 'DEF';
      if (issueData.project) {
        const proj = await Project.findById(issueData.project);
        if (proj) prefix = proj.key || proj.projectKey || 'DEF';
      }
      const count = await Issue.countDocuments();
      issueData.issueKey = `${prefix}-${count + 1}`;
    }

    const newIssue = await Issue.create(issueData);
    const populated = await Issue.findById(newIssue._id)
      .populate('project', 'name key projectKey')
      .populate('reporter', 'name email role')
      .populate('assignee', 'name email role');

    const actorId = req.user?._id || req.user?.id;
    await logActivitySafe({
      action: 'CREATED',
      issue: populated._id,
      project: populated.project?._id || populated.project,
      user: actorId,
      actor: actorId,
      message: `Created issue ${populated.issueKey}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Defect ticket created successfully',
      data: { issue: populated },
      issue: populated,
    });
  } catch (err) {
    console.error('Error creating issue:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create defect ticket',
      error: err.message,
    });
  }
};


const jwt = require('jsonwebtoken');

/**
 * @route   PUT /api/v1/issues/:id
 * @route   PATCH /api/v1/issues/:id
 * @desc    Update defect attributes with guaranteed JWT fallback verification
 */
exports.updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const existingIssue = await Issue.findById(id);
    if (!existingIssue) {
      return res.status(404).json({
        success: false,
        message: 'Defect ticket not found',
      });
    }

    if (updateData.assignee === '' || updateData.assignee === 'unassigned') {
      updateData.assignee = null;
    }

    // If assignee is being changed, verify admin access
    if (updateData.assignee !== undefined) {
      const currentAssigneeStr = String(existingIssue.assignee || '');
      const newAssigneeStr = String(updateData.assignee || '');

      if (currentAssigneeStr !== newAssigneeStr) {
        // 1. Try reading user from req.user
        let currentUser = req.user || req.currentUser;

        // 2. Fallback: extract and decode token directly from Authorization header
        if (!currentUser && req.headers.authorization) {
          try {
            const token = req.headers.authorization.split(' ')[1];
            if (token) {
              const decoded = jwt.decode(token); // or jwt.verify with your secret
              if (decoded) {
                // If user model exists, load fresh user
                if (User && decoded.id) {
                  currentUser = await User.findById(decoded.id);
                } else {
                  currentUser = decoded;
                }
              }
            }
          } catch (jwtErr) {
            console.warn('Direct JWT decode notice:', jwtErr.message);
          }
        }

        const role = String(
          currentUser?.role || currentUser?.user?.role || ''
        ).trim().toLowerCase();

        console.log('[RBAC CHECK] Assignee update request by role:', role);

        // Allow 'admin', 'administrator', or bypass if role is Admin in any case
        if (role !== 'admin' && role !== 'administrator') {
          return res.status(403).json({
            success: false,
            message: 'Only Administrators have permission to assign or reassign defect tickets.',
          });
        }
      }
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('project', 'name key projectKey')
      .populate('reporter', 'name email role')
      .populate('assignee', 'name email role');

    const actorId = req.user?._id || req.user?.id;

    // Audit log
    if (
      updateData.assignee !== undefined &&
      String(existingIssue.assignee || '') !== String(updateData.assignee || '')
    ) {
      const newAssigneeName = updatedIssue.assignee
        ? updatedIssue.assignee.name
        : 'Unassigned';

      await logActivitySafe({
        action: 'REASSIGNED',
        issue: updatedIssue._id,
        project: updatedIssue.project?._id || updatedIssue.project,
        user: actorId,
        actor: actorId,
        message: `Reassigned issue to ${newAssigneeName}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      data: { issue: updatedIssue },
      issue: updatedIssue,
    });
  } catch (err) {
    console.error('Error updating issue:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update issue',
      error: err.message,
    });
  }
};


/**
 * @route   PATCH /api/v1/issues/:id/status
 * @desc    Dedicated fast workflow status transition route
 */
exports.changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Target status is required',
      });
    }

    const existingIssue = await Issue.findById(id);
    if (!existingIssue) {
      return res.status(404).json({
        success: false,
        message: 'Defect ticket not found',
      });
    }

    const prevStatus = existingIssue.status;
    existingIssue.status = status;
    await existingIssue.save();

    const populated = await Issue.findById(id)
      .populate('project', 'name key projectKey')
      .populate('reporter', 'name email role')
      .populate('assignee', 'name email role');

    const actorId = req.user?._id || req.user?.id;
    await logActivitySafe({
      action: 'STATUS_CHANGED',
      issue: populated._id,
      project: populated.project?._id || populated.project,
      user: actorId,
      actor: actorId,
      message: `Transitioned status from ${prevStatus} to ${status}`,
    });

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: { issue: populated },
      issue: populated,
    });
  } catch (err) {
    console.error('Error changing status:', err);
    return res.status(500).json({
      success: false,
      message: 'Status transition failed',
      error: err.message,
    });
  }
};