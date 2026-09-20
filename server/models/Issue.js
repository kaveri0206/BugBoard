/**
 * @file Issue.js
 * @description Mongoose model for defect issues with sequential non-NaN keys.
 */

const mongoose = require('mongoose');
const { ISSUE_STATUS, ISSUE_PRIORITY, ISSUE_SEVERITY } = require('../config/constants');

if (mongoose.models && mongoose.models.Issue) {
  module.exports = mongoose.models.Issue;
} else {
  const issueSchema = new mongoose.Schema(
    {
      issueKey: {
        type: String,
        unique: true,
        trim: true,
      },
      issueNumber: {
        type: Number,
      },
      title: {
        type: String,
        required: [true, 'Issue title is required'],
        trim: true,
        maxlength: 200,
      },
      description: {
        type: String,
        required: [true, 'Issue description is required'],
        trim: true,
      },
      status: {
        type: String,
        enum: Object.values(ISSUE_STATUS),
        default: ISSUE_STATUS.OPEN,
      },
      severity: {
        type: String,
        enum: Object.values(ISSUE_SEVERITY),
        default: ISSUE_SEVERITY.MEDIUM,
      },
      priority: {
        type: String,
        enum: Object.values(ISSUE_PRIORITY),
        default: ISSUE_PRIORITY.MEDIUM,
      },
      project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Parent project is required'],
      },
      reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Reporter is required'],
      },
      assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      labels: [{ type: String, trim: true }],
      stepsToReproduce: { type: String, default: '' },
      expectedResult: { type: String, default: '' },
      actualResult: { type: String, default: '' },
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  );

  issueSchema.pre('validate', async function (next) {
    if (this.issueKey && !this.issueKey.includes('NaN')) {
      return next();
    }
    try {
      const Project = mongoose.model('Project');
      const project = await Project.findById(this.project);
      const prefix = (project && (project.key || project.projectKey)) || 'BUG';
      const count = await this.constructor.countDocuments({ project: this.project });
      const nextNumber = count + 1;
      this.issueNumber = nextNumber;
      this.issueKey = `${prefix}-${nextNumber}`;
      next();
    } catch (err) {
      next(err);
    }
  });

  module.exports = mongoose.model('Issue', issueSchema);
}