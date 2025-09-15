const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Employee self-service
router.post('/', protect, leaveController.requestLeave);
router.get('/me', protect, leaveController.getMyLeaves);

// Admin-only
router.get('/', protect, adminOnly, leaveController.getLeaves);
router.put('/:id/approve', protect, adminOnly, leaveController.approveLeave);
router.put('/:id/reject', protect, adminOnly, leaveController.rejectLeave);

module.exports = router;