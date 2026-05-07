const Joi = require('joi');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format',
});

const createProjectSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Project title is required',
    'string.min': 'Title must be at least 2 characters',
    'string.max': 'Title cannot exceed 100 characters',
  }),
  description: Joi.string().trim().max(500).allow('').messages({
    'string.max': 'Description cannot exceed 500 characters',
  }),
  teamMembers: Joi.array().items(objectId).default([]),
  status: Joi.string().valid('active', 'completed', 'archived').default('active'),
});

const updateProjectSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).messages({
    'string.min': 'Title must be at least 2 characters',
    'string.max': 'Title cannot exceed 100 characters',
  }),
  description: Joi.string().trim().max(500).allow(''),
  teamMembers: Joi.array().items(objectId),
  status: Joi.string().valid('active', 'completed', 'archived'),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

module.exports = { createProjectSchema, updateProjectSchema };
