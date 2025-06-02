const express = require('express');
const { body } = require('express-validator');
const {
  authenticate,
  authorize,
  injectModel,
  checkOwnership
} = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const goalController = require('../controllers/goalController');
const Goal = require('../models/Goal');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Reusable validation chains
const goalValidation = [
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('description').optional().isString().trim().withMessage('Description must be text'),
  body('targetDate').optional().isISO8601().toDate().withMessage('Invalid date format'),
  body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be 0-100')
];

const goalProgressValidation = [
  body('progress').isInt({ min: 0, max: 100 }).withMessage('Progress must be 0-100')
];

// Route definitions
router.route('/')
  .get(goalController.getAllGoals)
  .post(
    authorize('admin', 'manager'),
    goalValidation,
    validateRequest,
    goalController.createGoal
  );

router.route('/:id')
  .get(
    injectModel(Goal),
    checkOwnership('employee'),
    goalController.getGoalById
  )
  .patch(
    injectModel(Goal),
    authorize('admin', 'manager'),
    checkOwnership('employee'),
    goalValidation,
    validateRequest,
    goalController.updateGoal
  )
  .delete(
    authorize('admin'),
    injectModel(Goal),
    goalController.deleteGoal
  );

// Specialized progress update route
router.patch(
  '/:id/progress',
  injectModel(Goal),
  checkOwnership('employee'),
  goalProgressValidation,
  validateRequest,
  goalController.updateGoalProgress
);

module.exports = router;