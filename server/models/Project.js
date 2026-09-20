const mongoose = require('mongoose');
const { PROJECT_STATUS } = require('../config/constants');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: 120,
    },
    projectKey: {
      type: String,
      required: [true, 'Project key is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 10,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.ACTIVE,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    issueCounter: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

projectSchema.index({ members: 1, status: 1 });

module.exports = mongoose.model('Project', projectSchema);