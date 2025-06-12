const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getUsers,
  approveUser,
  rejectUser,
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Admin protected routes
router.get('/users', protect, adminOnly, getUsers);
router.route('/:id/approve')
  .put(protect, adminOnly, approveUser)  // Supporting PUT
  .patch(protect, adminOnly, approveUser);  // And PATCH

router.route('/:id/reject')
  .put(protect, adminOnly, rejectUser)  // Supporting PUT
  .patch(protect, adminOnly, rejectUser);  // And PATCH

module.exports = router;