const { errorResponse } = require('../utils/apiResponse');

/**
 * Joi validation middleware factory
 * @param {Object} schema - Joi schema to validate against
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return errorResponse(res, 'Validation failed', 400, errors);
    }

    next();
  };
};

module.exports = validate;
