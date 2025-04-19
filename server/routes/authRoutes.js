import express from 'express';
import { authenticate, refreshToken } from '../middleware/authMiddleware.js';
import { validate, AuthSchemas } from '../middleware/validateRequest.js';
import AuthController from '../controllers/authController.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post(
  '/register',
  apiLimiter,
  validate(AuthSchemas.register),
  AuthController.register
);

router.post(
  '/login',
  apiLimiter,
  validate(AuthSchemas.login),
  AuthController.login
);

router.post('/forgot-password', apiLimiter, AuthController.forgotPassword);
router.patch('/reset-password/:token', AuthController.resetPassword);

// Protected routes (require valid JWT)
router.use(authenticate);

router.get('/validate', AuthController.validateToken);
router.patch('/update-password', AuthController.updatePassword);
router.get('/logout', AuthController.logout);

// Token refresh endpoint
router.post('/refresh-token', refreshToken, (req, res) => {
  if (res.locals.newAccessToken) {
    return res.json({ token: res.locals.newAccessToken });
  }
  return res.status(401).json({ error: 'Invalid refresh token' });
});

export default router;