const reviewService = require('../services/reviewService');
const notificationService = require('../services/notificationService');
const { ResponseHandler } = require('../utils/response');
const logger = require('../utils/logger');
const APIError = require('../utils/APIError');
const APIFeatures = require('../utils/apiFeatures');

class ReviewController {
  /**
   * @desc    Get all reviews with advanced querying
   * @route   GET /api/v1/reviews
   * @access  Private (Admin/Manager/Employee)
   */
  static async getAllReviews(req, res) {
    try {
      // Build base query with authorization
      let filter = {};
      
      // Non-admins can only see their own reviews
      if (req.user.role === 'employee') {
        filter = { employee: req.user.employee };
      } else if (req.user.role === 'manager') {
        filter = { 
          $or: [
            { employee: req.user.employee },
            { reviewer: req.user.employee }
          ]
        };
      }
      
      // Create APIFeatures instance
      const features = new APIFeatures(Review.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
      
      // Populate related data
      features.query.populate([
        { path: 'employee', select: 'firstName lastName position' },
        { path: 'reviewer', select: 'firstName lastName position' },
        { path: 'goalsAchieved', select: 'title progress' }
      ]);
      
      // Execute query
      const [reviews, total] = await Promise.all([
        features.query.exec(),
        Review.countDocuments(features.filteredQuery)
      ]);
      
      // Get pagination metadata
      const pagination = features.getPaginationMeta(total);
      
      ResponseHandler.success({
        res,
        message: 'Reviews retrieved successfully',
        data: reviews,
        meta: { pagination }
      });
    } catch (error) {
      logger.error(`Failed to fetch reviews: ${error.message}`, { error });
      ResponseHandler.error({
        res,
        statusCode: 500,
        message: 'Failed to retrieve reviews'
      });
    }
  }

  /**
   * @desc    Get single review
   * @route   GET /api/v1/reviews/:id
   * @access  Private (Admin/Manager/Related Employee)
   */
  static async getReview(req, res) {
    try {
      const review = await reviewService.getReviewById(req.params.id);
      if (!review) {
        throw new APIError('Review not found', 404);
      }
      
      // Authorization: Only admins, reviewer, or reviewee can view
      const isAdmin = req.user.role === 'admin';
      const isReviewer = review.reviewer.equals(req.user.employee);
      const isReviewee = review.employee.equals(req.user.employee);
      
      if (!isAdmin && !isReviewer && !isReviewee) {
        throw new APIError('Unauthorized to view this review', 403);
      }
      
      ResponseHandler.success({
        res,
        message: 'Review retrieved successfully',
        data: review
      });
    } catch (error) {
      logger.error(`Failed to get review ${req.params.id}: ${error.message}`);
      ResponseHandler.error({
        res,
        statusCode: error.statusCode || 500,
        message: error.message || 'Review retrieval failed'
      });
    }
  }

  /**
   * @desc    Create performance review
   * @route   POST /api/v1/reviews
   * @access  Private (Admin/Manager)
   */
  static async createReview(req, res) {
    try {
      // Authorization: Only admins and managers can create reviews
      if (!['admin', 'manager'].includes(req.user.role)) {
        throw new APIError('Unauthorized to create reviews', 403);
      }
      
      const review = await reviewService.createReview(req.body);
      
      // Notify reviewer asynchronously
      notificationService.sendReviewNotification(
        review.reviewer.email,
        `${review.employee.firstName} ${review.employee.lastName}`,
        review.dueDate
      ).catch(err => logger.error('Review notification failed', err));
      
      ResponseHandler.success({
        res,
        statusCode: 201,
        message: 'Review created successfully',
        data: review
      });
    } catch (error) {
      logger.error(`Review creation failed: ${error.message}`, { body: req.body });
      ResponseHandler.error({
        res,
        statusCode: error.statusCode || 400,
        message: error.message || 'Review creation failed'
      });
    }
  }

  /**
   * @desc    Update review
   * @route   PATCH /api/v1/reviews/:id
   * @access  Private (Admin/Reviewer)
   */
  static async updateReview(req, res) {
    try {
      const { id } = req.params;
      const review = await reviewService.getReviewById(id);
      if (!review) {
        throw new APIError('Review not found', 404);
      }
      
      // Authorization: Only admins or the assigned reviewer can update
      const isAdmin = req.user.role === 'admin';
      const isReviewer = review.reviewer.equals(req.user.employee);
      
      if (!isAdmin && !isReviewer) {
        throw new APIError('Unauthorized to update this review', 403);
      }
      
      // Prevent status changes from reviewers
      if (!isAdmin && req.body.status) {
        delete req.body.status;
      }
      
      const updatedReview = await reviewService.updateReview(id, req.body);
      
      // Notify employee when review is completed
      if (updatedReview.status === 'completed') {
        notificationService.sendReviewCompletion(
          updatedReview.employee.email,
          `${req.user.firstName} ${req.user.lastName}`
        ).catch(err => logger.error('Review completion notification failed', err));
      }
      
      ResponseHandler.success({
        res,
        message: 'Review updated successfully',
        data: updatedReview
      });
    } catch (error) {
      logger.error(`Failed to update review ${req.params.id}: ${error.message}`, { body: req.body });
      ResponseHandler.error({
        res,
        statusCode: error.statusCode || 400,
        message: error.message || 'Review update failed'
      });
    }
  }

  /**
   * @desc    Submit feedback for review
   * @route   POST /api/v1/reviews/:id/feedback
   * @access  Private (Reviewer)
   */
  static async submitFeedback(req, res) {
    try {
      const { id } = req.params;
      const { feedback, ratings } = req.body;
      
      const review = await reviewService.getReviewById(id);
      if (!review) {
        throw new APIError('Review not found', 404);
      }
      
      // Authorization: Only the assigned reviewer can submit feedback
      if (!review.reviewer.equals(req.user.employee)) {
        throw new APIError('Unauthorized to submit feedback for this review', 403);
      }
      
      // Prevent submitting feedback for completed reviews
      if (review.status === 'completed') {
        throw new APIError('Cannot submit feedback for a completed review', 400);
      }
      
      const updatedReview = await reviewService.submitFeedback(
        id,
        { feedback, ratings }
      );
      
      ResponseHandler.success({
        res,
        message: 'Feedback submitted successfully',
        data: updatedReview
      });
    } catch (error) {
      logger.error(`Feedback submission failed for review ${req.params.id}: ${error.message}`);
      ResponseHandler.error({
        res,
        statusCode: error.statusCode || 400,
        message: error.message || 'Feedback submission failed'
      });
    }
  }

  /**
   * @desc    Delete review
   * @route   DELETE /api/v1/reviews/:id
   * @access  Private (Admin)
   */
  static async deleteReview(req, res) {
    try {
      // Authorization: Only admins can delete reviews
      if (req.user.role !== 'admin') {
        throw new APIError('Unauthorized to delete reviews', 403);
      }
      
      await reviewService.deleteReview(req.params.id);
      
      ResponseHandler.success({
        res,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      logger.error(`Failed to delete review ${req.params.id}: ${error.message}`);
      ResponseHandler.error({
        res,
        statusCode: error.statusCode || 500,
        message: error.message || 'Review deletion failed'
      });
    }
  }

  /**
   * @desc    Get reviews for an employee
   * @route   GET /api/v1/employees/:employeeId/reviews
   * @access  Private (Admin/Manager/Employee-Owner)
   */
  static async getEmployeeReviews(req, res) {
    try {
      const { employeeId } = req.params;
      
      // Authorization: Employee can only access their own reviews
      if (req.user.role === 'employee' && req.user.employee.toString() !== employeeId) {
        throw new APIError('Unauthorized to access these reviews', 403);
      }
      
      const reviews = await reviewService.getReviewsByEmployee(employeeId);
      
      ResponseHandler.success({
        res,
        message: 'Employee reviews retrieved successfully',
        data: reviews
      });
    } catch (error) {
      logger.error(`Failed to get reviews for employee ${req.params.employeeId}: ${error.message}`);
      ResponseHandler.error({
        res,
        statusCode: error.statusCode || 500,
        message: 'Failed to retrieve employee reviews'
      });
    }
  }
}

module.exports = ReviewController;