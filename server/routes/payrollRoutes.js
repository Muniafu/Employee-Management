const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, adminOnly, payrollController.generatePayroll);
router.get('/:employeeId', protect, payrollController.getPayrollForEmployee);

module.exports = router;