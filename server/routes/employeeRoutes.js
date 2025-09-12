const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Employee self-service routes
router.get('/me', protect, employeeController.getMyProfile);
router.put('/me', protect, employeeController.updateMyProfile);

// Admin-only routes
router.post('/', protect, adminOnly, employeeController.createEmployee);
router.get('/', protect, adminOnly, employeeController.listEmployees);
router.get('/:id', protect, adminOnly, employeeController.getEmployeeById);
router.put('/:id', protect, adminOnly, employeeController.updateEmployee);
router.delete('/:id', protect, adminOnly, employeeController.deleteEmployee);

module.exports = router;