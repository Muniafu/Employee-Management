const express = require('express');
const router = express.Router();
const {
  register,
  login,
  approveUser,
  rejectUser,
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.put('/approve/:id', protect, adminOnly, approveUser);
router.put('/reject/:id', protect, adminOnly, rejectUser);

module.exports = router;