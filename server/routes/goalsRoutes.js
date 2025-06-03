import express from 'express';
import GoalController from '../controllers/goalController.js';
import { authenticate, restrictTo } from '../middleware/auth.js';
import validate from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate); // All routes require authentication

router.post(
  '/',
  restrictTo('manager', 'employee'),
  validate([
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
  validate([param('employeeId').isMongoId()]),
  restrictTo('admin', 'manager', 'employee'),
  GoalController.getEmployeeGoals
);

router.patch(
  '/:id',
  validate([
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
  validate([
    param('id').isMongoId(),
    body('progress').isInt({ min: 0, max: 100 })
  ]),
  restrictTo('manager', 'employee'),
  GoalController.updateGoalProgress
);

router.delete(
  '/:id',
  validate([param('id').isMongoId()]),
  restrictTo('manager'),
  GoalController.deleteGoal
);

export default router;