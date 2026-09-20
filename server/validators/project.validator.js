const Joi = require('joi');
const { PROJECT_STATUS } = require('../config/constants');

const createProjectSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  projectKey: Joi.string().alphanum().min(2).max(10).uppercase().required(),
  description: Joi.string().allow('').default(''),
  members: Joi.array().items(Joi.string().hex().length(24)).default([]),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  description: Joi.string().allow(''),
  status: Joi.string().valid(...Object.values(PROJECT_STATUS)),
  members: Joi.array().items(Joi.string().hex().length(24)),
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
};