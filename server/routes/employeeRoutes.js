import express from 'express';
import { authenticate, selfOrAdmin } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateRequest.js';
import EmployeeController from '../controllers/employeeController.js';
import { PerformanceSchemas } from '../middleware/validateRequest.js';

const router = express.Router();

// Apply authentication to all employee routes
router.use(authenticate);

// Profile management
router.route('/profile')
  .get(EmployeeController.getProfile)
  .patch(
    validate(PerformanceSchemas.updateProfile),
    EmployeeController.updateProfile
  );

// Performance reviews
router.route('/performance-reviews')
  .get(EmployeeController.getPerformanceReviews)
  .post(
    validate(PerformanceSchemas.selfReview),
    EmployeeController.submitSelfReview
  );

// Goals tracking
router.route('/goals')
  .get(EmployeeController.getGoals)
  .post(
    validate(PerformanceSchemas.createGoal),
    EmployeeController.createGoal
  );

router.route('/goals/:id')
  .patch(
    validate(PerformanceSchemas.updateGoal),
    EmployeeController.updateGoal
  )
  .delete(EmployeeController.deleteGoal);

// Special endpoint for employee's own data access
router.get('/:id', selfOrAdmin(), EmployeeController.getEmployee);

export default router;