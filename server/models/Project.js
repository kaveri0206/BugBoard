/**
 * @file Project.js
 * @description Mongoose model for Projects. Bidirectionally syncs 'key' and 'projectKey'.
 */

const mongoose = require('mongoose');
const { PROJECT_STATUS } = require('../config/constants');

if (mongoose.models && mongoose.models.Project) {
  module.exports = mongoose.models.Project;
} else {
  const projectSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true,
        maxlength: 100,
      },
      key: {
        type: String,
        required: [true, 'Project key is required'],
        uppercase: true,
        trim: true,
        minlength: 2,
        maxlength: 10,
      },
      projectKey: {
        type: String,
        uppercase: true,
        trim: true,
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
      },
      lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      members: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  );

  projectSchema.pre('validate', function (next) {
    if (this.projectKey && !this.key) {
      this.key = this.projectKey.toUpperCase().trim();
    }
    if (this.key && !this.projectKey) {
      this.projectKey = this.key.toUpperCase().trim();
    }
    next();
  });

  module.exports = mongoose.model('Project', projectSchema);
}