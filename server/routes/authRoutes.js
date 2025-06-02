const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const validateRequest = require('../middleware/validation');

const router = express.Router();

// Reusable validation chains
const emailValidation = body('email')
  .isEmail().withMessage('Valid email is required')
  .normalizeEmail();

const passwordValidation = body('password')
  .isLength({ min: 6 }).withMessage('Password must be at least 6 characters');

const nameValidation = body('name')
  .notEmpty().withMessage('Name is required')
  .trim();

// Auth routes
router.post(
  '/register',
  [nameValidation, emailValidation, passwordValidation],
  validateRequest,
  authController.register
);

router.post(
  '/login',
  [emailValidation, body('password').exists().withMessage('Password is required')],
  validateRequest,
  authController.login
);

router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

router.post(
  '/forgot-password',
  [emailValidation],
  validateRequest,
  authController.forgotPassword
);

router.patch(
  '/reset-password/:token',
  [passwordValidation],
  validateRequest,
  authController.resetPassword
);

module.exports = router;