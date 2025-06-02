const express = require('express');
const { body } = require('express-validator');
const {
  authenticate,
  authorize,
  injectModel,
  checkOwnership
} = require('../middleware/auth');
const validateRequest = require('../middleware/validation');
const reviewController = require('../controllers/reviewController');
const Review = require('../models/Review');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Reusable validation chains
const reviewValidation = [
  body('employeeId').notEmpty().isMongoId().withMessage('Valid employee ID required'),
  body('reviewerId').notEmpty().isMongoId().withMessage('Valid reviewer ID required'),
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('comments').optional().isString().trim(),
  body('status').optional().isIn(['draft', 'published'])
];

const feedbackValidation = [
  body('feedback').notEmpty().trim().withMessage('Feedback text required'),
  body('anonymous').optional().isBoolean()
];

// Route definitions
router.route('/')
  .get(authorize('admin', 'manager', 'hr'), reviewController.getAllReviews)
  .post(
    authorize('admin', 'manager'),
    reviewValidation,
    validateRequest,
    reviewController.createReview
  );

router.route('/:id')
  .get(
    injectModel(Review),
    checkOwnership('participant'),  // Check if user is employee or reviewer
    reviewController.getReviewById
  )
  .put(
    injectModel(Review),
    authorize('admin', 'manager'),
    checkOwnership('reviewer'),  // Only reviewer can update before submission
    reviewValidation,
    validateRequest,
    reviewController.updateReview
  )
  .delete(
    authorize('admin'),
    injectModel(Review),
    reviewController.deleteReview
  );

// Feedback submission route
router.post(
  '/:id/feedback',
  injectModel(Review),
  checkOwnership('reviewer'),  // Only reviewer can submit feedback
  feedbackValidation,
  validateRequest,
  reviewController.submitFeedback
);

module.exports = router;