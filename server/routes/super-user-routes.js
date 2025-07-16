const express = require('express');
const { check } = require('express-validator');
const { newUser, loginUser, createFirstAdmin } = require('../controllers/userController');
const checkAuth = require('../middleware/check-auth');
const router = express.Router();

// Public routes
router.post(
  '/login',
  [
    check('email').normalizeEmail().isEmail().withMessage('Valid email required'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  loginUser
);

// Specil endpoint for creating first admin(no auth required)
router.post(
  '/first-admin',
  [
    check('email').normalizeEmail().isEmail().withMessage('Valid email required'),
    check('name').notEmpty().withMessage('Name is required'),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    check('position').notEmpty().withMessage('Position is required'),
    check('dateOfBirth').isDate().withMessage('Valid date of birth required'),
    check('phone').notEmpty().withMessage('Phone number is required')
  ],
  createFirstAdmin
);

// Protected routes (require authentication)
router.use(checkAuth);

router.post(
  '/users',
  [
    check('email').normalizeEmail().isEmail().withMessage('Valid email required'),
    check('name').notEmpty().withMessage('Name is required'),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    check('position').notEmpty().withMessage('Position is required'),
    check('dateOfBirth').isDate().withMessage('Valid date of birth required'),
    check('phone').notEmpty().withMessage('Phone number is required')
  ],
  newUser
);

module.exports = router;