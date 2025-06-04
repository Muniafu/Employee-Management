import express from 'express';
import AuthController from '../controllers/authController.js';
import validation from '../middleware/validation.js';
import { authenticate, restrictTo } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

router.post(
  '/register',
  validation.validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('role').optional().isIn(['admin', 'manager', 'employee'])
  ]),
  AuthController.register
);

router.post(
  '/login',
  validation.validate([
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ]),
  AuthController.login
);

router.post(
  '/forgot-password',
  validation.validate([body('email').isEmail().normalizeEmail()]),
  AuthController.forgotPassword
);

router.post(
  '/reset-password',
  validation.validate([
    body('token').exists(),
    body('newPassword').isLength({ min: 8 })
  ]),
  AuthController.resetPassword
);

router.use(authenticate); // All routes below require authentication

router.post(
  '/change-password',
  validation.validate([
    body('currentPassword').exists(),
    body('newPassword').isLength({ min: 8 })
  ]),
  AuthController.changePassword
);

export default router;