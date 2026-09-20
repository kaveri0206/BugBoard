const Joi = require('joi');

const createCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(5000).required(),
});

module.exports = { createCommentSchema };