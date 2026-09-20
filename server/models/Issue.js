const mongoose = require('mongoose');
const {
  ISSUE_STATUS,
  ISSUE_SEVERITY,
  ISSUE_PRIORITY,
} = require('../config/constants');

const attachmentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, default: '' },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  size: { type: Number, required: true },
});

const issueSchema = new mongoose.Schema(
  {
    issueKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 250,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    severity: {
      type: String,
      enum: Object.values(ISSUE_SEVERITY),
      default: ISSUE_SEVERITY.MEDIUM,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(ISSUE_PRIORITY),
      default: ISSUE_PRIORITY.MEDIUM,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ISSUE_STATUS),
      default: ISSUE_STATUS.OPEN,
      index: true,
    },
    labels: [
      {
        type: String,
        trim: true,
      },
    ],
    environment: { type: String, default: 'Development' },
    browser: { type: String, default: 'Chrome' },
    operatingSystem: { type: String, default: 'Windows 11' },
    stepsToReproduce: { type: String, default: '' },
    expectedResult: { type: String, default: '' },
    actualResult: { type: String, default: '' },
    attachments: [attachmentSchema],
    dueDate: { type: Date, default: null, index: true },
    resolvedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

issueSchema.index({ project: 1, status: 1, priority: 1 });
issueSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Issue', issueSchema);