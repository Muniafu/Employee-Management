const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, leaveController.requestLeave);
router.get('/', protect, leaveController.getLeaves);
router.put('/:id/approve', protect, adminOnly, leaveController.approveLeave);
router.put('/:id/reject', protect, adminOnly, leaveController.rejectLeave);

module.exports = router;