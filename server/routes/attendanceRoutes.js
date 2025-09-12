const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect,adminOnly } = require('../middleware/authMiddleware');

// Employee self-service routes
router.post('/clock-in', protect, attendanceController.clockIn);
router.post('/clock-out', protect, attendanceController.clockOut);
router.get('/me', protect, attendanceController.getMyAttendance)

// Admin: view attendance of any employee
router.get('/', protect, adminOnly, attendanceController.getAllAttendance);
router.get('/:id', protect, adminOnly, attendanceController.getAttendanceForEmployee);

module.exports = router;