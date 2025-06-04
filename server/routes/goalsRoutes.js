import express from 'express';
import { body, param } from 'express-validator';
import GoalController from '../controllers/goalController.js';
import { authenticate, restrictTo } from '../middleware/auth.js';
import validation from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate); // All routes require authentication

router.post(
  '/',
  restrictTo('manager', 'employee'),
  validation.validate([
    body('employee').isMongoId(),
    body('title').trim().notEmpty(),
    body('targetDate').isISO8601(),
    body('description').optional().trim(),
    body('keyResults').optional().isArray()
  ]),
  GoalController.createGoal
);

router.get(
  '/employee/:employeeId',
  validation.validate([param('employeeId').isMongoId()]),
  restrictTo('admin', 'manager', 'employee'),
  GoalController.getEmployeeGoals
);

router.patch(
  '/:id',
  validation.validate([
    param('id').isMongoId(),
    body('title').optional().trim().notEmpty(),
    body('targetDate').optional().isISO8601(),
    body('status').optional().isIn(['not-started', 'in-progress', 'completed', 'cancelled'])
  ]),
  restrictTo('manager', 'employee'),
  GoalController.updateGoal
);

router.patch(
  '/:id/progress',
  validation.validate([
    param('id').isMongoId(),
    body('progress').isInt({ min: 0, max: 100 })
  ]),
  restrictTo('manager', 'employee'),
  GoalController.updateGoalProgress
);

router.delete(
  '/:id',
  validation.validate([param('id').isMongoId()]),
  restrictTo('manager'),
  GoalController.deleteGoal
);

export default router;