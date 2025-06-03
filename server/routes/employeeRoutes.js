import express from 'express';
import EmployeeController from '../controllers/employeeController.js';
import { authenticate, restrictTo } from '../middleware/auth.js';
import validate from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate); // All routes require authentication

router.post(
  '/',
  restrictTo('admin', 'manager'),
  validate([
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('department').isIn(['Engineering', 'HR', 'Marketing', 'Sales', 'Finance', 'Operations']),
    body('position').trim().notEmpty(),
    body('user').isMongoId()
  ]),
  EmployeeController.createEmployee
);

router.get(
  '/',
  restrictTo('admin', 'manager', 'employee'),
  EmployeeController.getAllEmployees
);

router.get(
  '/:id',
  validate([param('id').isMongoId()]),
  restrictTo('admin', 'manager', 'employee'),
  EmployeeController.getEmployee
);

router.get(
  '/:id/stats',
  validate([param('id').isMongoId()]),
  restrictTo('admin', 'manager'),
  EmployeeController.getEmployeeStats
);

router.patch(
  '/:id',
  validate([
    param('id').isMongoId(),
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('status').optional().isIn(['active', 'on-leave', 'terminated', 'retired'])
  ]),
  restrictTo('admin', 'manager'),
  EmployeeController.updateEmployee
);

export default router;