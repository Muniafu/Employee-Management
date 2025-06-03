import ReviewService from '../services/reviewService.js';
import NotificationService from '../services/notificationService.js';
import APIError from '../utils/APIError.js';
import httpStatus from 'http-status';

class ReviewController {
  /**
   * Create performance review
   */
  static createReview = async (req, res, next) => {
    try {
      const reviewData = {
        ...req.body,
        reviewer: req.user.id
      };
      const review = await ReviewService.createReview(reviewData);
      
      // Notify employee asynchronously
      NotificationService.notifyNewReview(review._id)
        .catch(error => console.error('Notification failed:', error));
      
      res.status(httpStatus.CREATED).json({
        success: true,
        data: review
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all reviews for employee
   */
  static getEmployeeReviews = async (req, res, next) => {
    try {
      const reviews = await ReviewService.getEmployeeReviews(
        req.params.employeeId,
        {
          page: req.query.page,
          limit: req.query.limit,
          sort: req.query.sort
        }
      );
      
      res.status(httpStatus.OK).json({
        success: true,
        ...reviews
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get review by ID
   */
  static getReview = async (req, res, next) => {
    try {
      const review = await ReviewService.getReviewById(req.params.id);
      res.status(httpStatus.OK).json({
        success: true,
        data: review
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update review
   */
  static updateReview = async (req, res, next) => {
    try {
      const review = await ReviewService.updateReview(
        req.params.id,
        req.body,
        req.user.role
      );
      res.status(httpStatus.OK).json({
        success: true,
        data: review
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Finalize review
   */
  static finalizeReview = async (req, res, next) => {
    try {
      const review = await ReviewService.finalizeReview(
        req.params.id,
        req.user.id
      );
      res.status(httpStatus.OK).json({
        success: true,
        data: review
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ReviewController;