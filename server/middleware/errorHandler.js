const { errorResponse } = require('../utils/apiResponse');
const config = require('../config/config');

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const fieldErrors = Object.values(err.errors).map((e) => e.message);
    message = 'Validation Error';
    errors = fieldErrors;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for '${field}'. This ${field} already exists.`;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error for debugging in all environments
  console.error('[SERVER ERROR]:', {
    name: err.name,
    message: err.message,
    stack: config.NODE_ENV === 'development' ? err.stack : 'OMITTED_IN_PROD',
    path: req.path,
    method: req.method,
  });

  return errorResponse(res, message, statusCode, errors);
};

module.exports = errorHandler;
