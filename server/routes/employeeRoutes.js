const express = require('express');
const { body } = require('express-validator');
const {
  authenticate,
  authorize,
  injectModel,
  checkOwnership
} = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const employeeController = require('../controllers/employeeController');
const Employee = require('../models/Employee');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Reusable validation chains
const employeeValidation = [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('position').notEmpty().trim().withMessage('Position is required'),
  body('department').optional().trim(),
  body('managerId').optional().isMongoId()
];

const partialEmployeeValidation = [
  body('name').optional().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('position').optional().notEmpty().trim(),
  body('department').optional().trim(),
  body('managerId').optional().isMongoId()
];

// Route definitions
router.route('/')
  .get(authorize('admin', 'manager'), employeeController.getAllEmployees)
  .post(
    authorize('admin', 'manager'),
    employeeValidation,
    validateRequest,
    employeeController.createEmployee
  );

router.route('/:id')
  .get(
    authorize('admin', 'manager', 'hr'),
    injectModel(Employee),
    checkOwnership('employee'),
    employeeController.getEmployeeById
  )
  .put(
    authorize('admin', 'manager'),
    injectModel(Employee),
    checkOwnership('employee'),
    partialEmployeeValidation,
    validateRequest,
    employeeController.updateEmployee
  )
  .delete(
    authorize('admin'),
    injectModel(Employee),
    employeeController.deleteEmployee
  );

// Specialized routes
router.get(
  '/team/:managerId',
  authorize('admin', 'manager'),
  injectModel(Employee),
  employeeController.getTeamHierarchy
);

module.exports = router;