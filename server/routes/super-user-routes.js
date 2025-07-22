const express = require('express');
const { check } = require('express-validator');
const { newUser, loginUser, createFirstAdmin, getEmployees, deleteEmployee } = require('../controllers/userController');
const { checkAuth, checkRole } = require('../middleware/check-auth');

const router = express.Router();

// Public routes
router.post(
  '/login',
  [
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 })
  ],
  loginUser
);

// Specil endpoint for creating first admin(no auth required)
router.post(
  '/first-admin',
  [
    check('email').normalizeEmail().isEmail(),
    check('name').notEmpty(),
    check('password').isLength({ min: 8 }),
    check('position').notEmpty(),
    check('dateOfBirth').isDate(),
    check('phone').notEmpty()
  ],
  createFirstAdmin
);

// Protected routes (require authentication)
router.use(checkAuth);
router.use(checkRole('admin'));

router.post(
  '/users',
  [
    check('email').normalizeEmail().isEmail(),
    check('name').notEmpty(),
    check('password').isLength({ min: 8 }),
    check('position').notEmpty(),
    check('dateOfBirth').isDate(),
    check('phone').notEmpty()
  ],
  newUser
);

// Get all users (admin only)
router.get('/users', checkAuth, getEmployees);

// Delete user (admin only)
router.delete('/users/:id', checkAuth, deleteEmployee);

module.exports = router;