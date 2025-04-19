import Joi from 'joi';
import { logger } from '../utils/logger.js';
import { HTTP_STATUS } from '../config/constants.js';

// Joi validation wrapper
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, // Return all errors
      allowUnknown: true, // Allow unknown keys that will be ignored
      stripUnknown: true // Remove unknown keys
    };

    const { error, value } = schema.validate(req[source], validationOptions);

    if (error) {
        const details = error.details.map(err => ({
            field: err.path.join('.'),
            message: err.message.replace(/['"]/g, '')
        }));

      logger.warn('Validation errors:', errors);
      
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    // Replace the request with validated values
    req[source] = value;
    next();
  };
};

// Example schemas (can be moved to separate files)
export const AuthSchemas = {
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).required()
  }),

  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .required()
      .messages({
        'string.pattern.base': 'Password must contain at least one lowercase, uppercase, number, and special character'
      }),
    role: Joi.string().valid('admin', 'manager', 'employee').default('employee')
  })
};

export const selfReviewSchema = Joi.object({
    strenghts: Joi.array().items(Joi.string()).max(5).required(),
    weaknesses: Joi.array().items(Joi.string()).max(5).required(),
    accomplishments: Joi.array().items(Joi.string()).max(5).required(),
});