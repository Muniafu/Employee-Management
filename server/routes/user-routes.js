const express = require('express');
const router = express.Router();
const {
  displayUser,
  editEmployee,
  getUserById,
  newUser,
  loginUser
} = require('../controllers/userController');
const { singleUpload } = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');
const { check } = require('express-validator');

// Public routes
router.get('/', displayUser);
router.get('/:uid', getUserById);

// Authentication routes
router.post(
  '/login',
  [
    check('email').isEmail().normalizeEmail(),
    check('password').isLength({ min: 6 })
  ],
  loginUser
);

// Protected routes
router.post(
  '/',
  checkAuth,
  singleUpload('image'),
  [
    check('email').isEmail().normalizeEmail(),
    check('password').isLength({ min: 8 }),
    check('name').notEmpty(),
    check('position').notEmpty(),
    check('dateOfBirth').isDate(),
    check('phone').notEmpty()
  ],
  newUser
);

router.patch(
  '/:uid',
  checkAuth,
  singleUpload('image'),
  editEmployee
);

module.exports = router;