const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protected routes (require authentication)
router.use(protect);

router.get('/me', (req, res) => {
  // Simply return the user data from the request object
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

router.patch('/updateMyPassword', authController.updatePassword);

module.exports = router;