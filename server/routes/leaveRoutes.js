const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const {
  applyForLeave,
  updateLeaveStatus,
  getPendingLeaves,
  getUserLeaves
} = require('../controllers/leaveController');

// Apply for leave (protected)
router.post('/users/:uid/leaves', checkAuth, applyForLeave);

// Get pending leaves (admin only)
router.get('/leaves/pending', checkAuth, getPendingLeaves);

// Approve/reject leave (protected)
router.patch('/:leaveId', checkAuth, updateLeaveStatus);

// Get user's leave history (protected)
router.get('/users/:uid/leaves', checkAuth, getUserLeaves);

module.exports = router;