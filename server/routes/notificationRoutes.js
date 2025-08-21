const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, notificationController.createNotification);
router.get('/', protect, notificationController.listNotifications);
router.put('/:id/read', protect, notificationController.markAsRead);

module.exports = router;