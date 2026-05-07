const Joi = require('joi');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format',
});

const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(2).max(150).required().messages({
    'string.empty': 'Task title is required',
    'string.min': 'Title must be at least 2 characters',
    'string.max': 'Title cannot exceed 150 characters',
  }),
  description: Joi.string().trim().max(1000).allow('').messages({
    'string.max': 'Description cannot exceed 1000 characters',
  }),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  dueDate: Joi.date().iso().allow(null, ''),
  status: Joi.string().valid('todo', 'in-progress', 'completed').default('todo'),
  assignedTo: objectId.allow(null, ''),
  project: objectId.required().messages({
    'string.empty': 'Project is required',
  }),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(2).max(150),
  description: Joi.string().trim().max(1000).allow(''),
  priority: Joi.string().valid('low', 'medium', 'high'),
  dueDate: Joi.date().iso().allow(null, ''),
  status: Joi.string().valid('todo', 'in-progress', 'completed'),
  assignedTo: objectId.allow(null, ''),
  project: objectId,
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

module.exports = { createTaskSchema, updateTaskSchema };
