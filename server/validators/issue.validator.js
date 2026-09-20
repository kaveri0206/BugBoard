const Joi = require('joi');
const {
  ISSUE_STATUS,
  ISSUE_SEVERITY,
  ISSUE_PRIORITY,
} = require('../config/constants');

const createIssueSchema = Joi.object({
  project: Joi.string().hex().length(24).required(),
  title: Joi.string().trim().min(3).max(250).required(),
  description: Joi.string().trim().min(5).required(),
  severity: Joi.string().valid(...Object.values(ISSUE_SEVERITY)).default(ISSUE_SEVERITY.MEDIUM),
  priority: Joi.string().valid(...Object.values(ISSUE_PRIORITY)).default(ISSUE_PRIORITY.MEDIUM),
  assignee: Joi.string().hex().length(24).allow(null, '').default(null),
  labels: Joi.array().items(Joi.string().trim()).default([]),
  environment: Joi.string().default('Development'),
  browser: Joi.string().default('Chrome'),
  operatingSystem: Joi.string().default('Windows 11'),
  stepsToReproduce: Joi.string().allow('').default(''),
  expectedResult: Joi.string().allow('').default(''),
  actualResult: Joi.string().allow('').default(''),
  dueDate: Joi.date().iso().allow(null).default(null),
  attachments: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),
      publicId: Joi.string().allow(''),
      fileName: Joi.string().required(),
      fileType: Joi.string().required(),
      size: Joi.number().required(),
    })
  ).default([]),
});

const updateIssueSchema = Joi.object({
  title: Joi.string().trim().min(3).max(250),
  description: Joi.string().trim().min(5),
  severity: Joi.string().valid(...Object.values(ISSUE_SEVERITY)),
  priority: Joi.string().valid(...Object.values(ISSUE_PRIORITY)),
  assignee: Joi.string().hex().length(24).allow(null, ''),
  labels: Joi.array().items(Joi.string().trim()),
  environment: Joi.string(),
  browser: Joi.string(),
  operatingSystem: Joi.string(),
  stepsToReproduce: Joi.string().allow(''),
  expectedResult: Joi.string().allow(''),
  actualResult: Joi.string().allow(''),
  dueDate: Joi.date().iso().allow(null),
  attachments: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),
      publicId: Joi.string().allow(''),
      fileName: Joi.string().required(),
      fileType: Joi.string().required(),
      size: Joi.number().required(),
    })
  ),
});

const statusTransitionSchema = Joi.object({
  status: Joi.string().valid(...Object.values(ISSUE_STATUS)).required(),
});

module.exports = {
  createIssueSchema,
  updateIssueSchema,
  statusTransitionSchema,
};