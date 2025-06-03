import express from 'express';
import ReviewController from '../controllers/reviewController.js';
import { authenticate, restrictTo } from '../middleware/auth.js';
import validate from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate); // All routes require authentication

router.post(
  '/',
  restrictTo('manager'),
  validate([
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
  validate([param('employeeId').isMongoId()]),
  restrictTo('admin', 'manager', 'employee'),
  ReviewController.getEmployeeReviews
);

router.get(
  '/:id',
  validate([param('id').isMongoId()]),
  restrictTo('admin', 'manager', 'employee'),
  ReviewController.getReview
);

router.patch(
  '/:id',
  validate([
    param('id').isMongoId(),
    body('performanceRating').optional().isInt({ min: 1, max: 5 }),
    body('feedback').optional().trim()
  ]),
  restrictTo('manager'),
  ReviewController.updateReview
);

router.post(
  '/:id/finalize',
  validate([param('id').isMongoId()]),
  restrictTo('manager'),
  ReviewController.finalizeReview
);

export default router;