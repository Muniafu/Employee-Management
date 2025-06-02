const Joi = require('joi');
const { validationResult } = require('express-validator');
const { APIError } = require('../utils/APIError');

class Validation {
  /**
   * @desc    Express-validator result handler
   * @param   {Object} req - Express request
   * @param   {Object} res - Express response
   * @param   {Function} next - Next middleware
   * @returns {void}
   */
  static validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(err => ({
        field: err.param,
        location: err.location,
        message: err.msg
      }));
      
      return next(new APIError('Validation failed', 422, {
        errors: formattedErrors
      }));
    }
    next();
  }

  /**
   * @desc    Joi validation middleware
   * @param   {Joi.Schema} schema - Joi schema
   * @param   {string} [source='body'] - Request property to validate
   * @param   {Object} [options] - Joi validation options
   * @returns {Function} Middleware function
   */
  static joiValidate(schema, source = 'body', options = {}) {
    return (req, res, next) => {
      const defaultOptions = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
        ...options
      };
      
      const { error, value } = schema.validate(req[source], defaultOptions);
      
      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          type: detail.type,
          message: detail.message.replace(/['"]+/g, '')
        }));
        
        return next(new APIError('Validation failed', 422, { errors }));
      }
      
      // Replace with validated and sanitized values
      req[source] = value;
      next();
    };
  }

  /**
   * @desc    Unified validation middleware (supports both Joi and express-validator)
   * @param   {Joi.Schema|Array} validators - Joi schema or array of express-validator middlewares
   * @param   {string} [source='body'] - For Joi validation
   * @returns {Array} Middleware stack
   */
  static unifiedValidate(validators, source = 'body') {
    const middlewareStack = [];
    
    if (Array.isArray(validators)) {
      // Express-validator style
      middlewareStack.push(...validators);
      middlewareStack.push(Validation.validateRequest);
    } else if (validators.isJoi) {
      // Joi schema
      middlewareStack.push(Validation.joiValidate(validators, source));
    } else {
      throw new Error('Invalid validators provided');
    }
    
    return middlewareStack;
  }
}

// Joi Validation Schemas
Validation.schemas = {
  // Auth schemas
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('admin', 'employee'),
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required(),
    position: Joi.string().required(),
    department: Joi.string().valid(
      'Engineering', 'HR', 'Marketing', 'Sales', 'Operations', 'Finance'
    ).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required()
  }),

  resetPassword: Joi.object({
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
  }),

  // Employee schemas
  employee: Joi.object({
    firstName: Joi.string().min(2),
    lastName: Joi.string().min(2),
    position: Joi.string(),
    department: Joi.string().valid(
      'Engineering', 'HR', 'Marketing', 'Sales', 'Operations', 'Finance'
    ),
    manager: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    status: Joi.string().valid('active', 'on-leave', 'terminated', 'probation'),
    contact: Joi.object({
      phone: Joi.string().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/),
      secondaryEmail: Joi.string().email()
    })
  }),

  // Review schemas
  review: Joi.object({
    employee: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    reviewer: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    period: Joi.string().pattern(/^(Q[1-4]|Annual)-\d{4}$/).required(),
    ratings: Joi.object({
      performance: Joi.number().min(1).max(5).required(),
      teamwork: Joi.number().min(1).max(5),
      communication: Joi.number().min(1).max(5),
      problemSolving: Joi.number().min(1).max(5)
    }).required(),
    feedback: Joi.object({
      summary: Joi.string().min(20).required(),
      strengths: Joi.string().required(),
      areasForImprovement: Joi.string().required()
    }),
    goalsAchieved: Joi.array().items(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/)
    ).max(10),
    status: Joi.string().valid('draft', 'submitted', 'approved', 'archived')
  }),

  feedback: Joi.object({
    comment: Joi.string().min(5).required()
  }),

  // Goal schemas
  goal: Joi.object({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().max(1000),
    targetDate: Joi.date().greater('now').required(),
    keyResults: Joi.array().items(
      Joi.object({
        description: Joi.string().min(5).required(),
        completed: Joi.boolean(),
        weight: Joi.number().min(1).max(10)
      })
    ).max(15),
    linkedReviews: Joi.array().items(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/)
    ).max(5)
  }),

  goalProgress: Joi.object({
    progress: Joi.number().min(0).max(100).required()
  }),

  // Query params schemas
  pagination: Joi.object({
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100),
    sort: Joi.string(),
    fields: Joi.string()
  })
};

// Custom validation rules
Validation.customRules = {
  objectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'MongoDB ObjectId'),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'strong password')
    .message('Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character')
};

module.exports = Validation;