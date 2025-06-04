import { body, param, validationResult } from 'express-validator';
import APIError from '../utils/APIError.js';

/**
 * Validate request using express-validator
 * @param {Array} validations - Array of validation rules
 */
const createValidator = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

    throw new APIError(422, 'Validation failed', {
      errors: extractedErrors,
    });
  };
};

// Common validation rules
const idParamRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
];

const employeeRules = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('department')
    .isIn(['Engineering', 'HR', 'Marketing', 'Sales', 'Finance', 'Operations'])
    .withMessage('Invalid department'),
];

const reviewRules = [
  body('performanceRating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('reviewPeriod.startDate')
    .isISO8601()
    .toDate()
    .withMessage('Invalid start date'),
  body('reviewPeriod.endDate')
    .isISO8601()
    .toDate()
    .custom((value, { req }) => value > req.body.reviewPeriod.startDate)
    .withMessage('End date must be after start date'),
];

const goalRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('targetDate')
    .isISO8601()
    .toDate()
    .custom((value) => value > new Date())
    .withMessage('Target date must be in the future'),
];

/**
 * Validate object ID in params
 */
const validateIdParam = createValidator(idParamRules);

/**
 * Validate employee data
 */
const validateEmployee = createValidator(employeeRules);

/**
 * Validate review data
 */
const validateReview = createValidator(reviewRules);

/**
 * Validate goal data
 */
const validateGoal = createValidator(goalRules);

export default{
  validate: createValidator,
  validateIdParam,
  validateEmployee,
  validateReview,
  validateGoal,
};