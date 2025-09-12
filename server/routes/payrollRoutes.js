const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Employee self-service
router.get('/me', protect, (req, res) => payrollController.getPayrollForEmployee(req, res));
router.get('/me', protect, payrollController.getMyPayrolls);

// Admin-only
router.post('/', protect, adminOnly, payrollController.generatePayroll);
router.get('/', protect, adminOnly, payrollController.getAllPayrolls);
router.get('/:id', protect, adminOnly, payrollController.getPayrollForEmployee);

module.exports = router;