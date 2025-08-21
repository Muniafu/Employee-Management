const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/clock-in', protect, attendanceController.clockIn);
router.post('/clock-out', protect, attendanceController.clockOut);
router.get('/', protect, attendanceController.getAttendanceForEmployee);

module.exports = router;