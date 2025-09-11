const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Employee self-service
router.get('/', protect, notificationController.listNotifications);
router.get('/me', protect, notificationController.getMyNotifications);
router.put('/:id/read', protect, notificationController.markAsRead);

// Admin-only: broadcast or create targeted notifications
router.post('/', protect, adminOnly, notificationController.createNotification);

module.exports = router;