import express from 'express';
import ReviewController from '../controllers/reviewController.js';
import { authenticate, restrictTo } from '../middleware/auth.js';
import validation from '../middleware/validation.js';
import { body, param } from 'express-validator';

const router = express.Router();

router.use(authenticate); // All routes require authentication

router.post(
  '/',
  restrictTo('manager'),
  validation.validate([
    body('employee').isMongoId(),
    body('performanceRating').isInt({ min: 1, max: 5 }),
    body('reviewPeriod.startDate').isISO8601(),
    body('reviewPeriod.endDate').isISO8601(),
    body('strengths').optional().isArray(),
    body('areasForImprovement').optional().isArray()
  ]),
  ReviewController.createReview
);

router.get(
  '/employee/:employeeId',
  validation.validate([param('employeeId').isMongoId()]),
  restrictTo('admin', 'manager', 'employee'),
  ReviewController.getEmployeeReviews
);

router.get(
  '/:id',
  validation.validate([param('id').isMongoId()]),
  restrictTo('admin', 'manager', 'employee'),
  ReviewController.getReview
);

router.patch(
  '/:id',
  validation.validate([
    param('id').isMongoId(),
    body('performanceRating').optional().isInt({ min: 1, max: 5 }),
    body('feedback').optional().trim()
  ]),
  restrictTo('manager'),
  ReviewController.updateReview
);

router.post(
  '/:id/finalize',
  validation.validate([param('id').isMongoId()]),
  restrictTo('manager'),
  ReviewController.finalizeReview
);

export default router;