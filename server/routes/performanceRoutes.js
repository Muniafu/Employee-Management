const express = require('express');
const router = express.Router();
const {
  createMetric, getMetrics, updateMetric, deleteMetric,
  createGoal, getGoals, updateGoal, deleteGoal,
  createFeedback, getFeedbacks, updateFeedback, deleteFeedback,
  getAdminOverview
} = require('../controllers/performanceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// User Performance Metrics Routes
router.route('/metrics')
  .post(protect, createMetric)
  .get(protect, getMetrics);

router.route('/metrics/:id')
  .put(protect, updateMetric)
  .delete(protect, deleteMetric);

// User Goals Routes
router.route('/goals')
  .post(protect, createGoal)
  .get(protect, getGoals);

router.route('/goals/:id')
  .put(protect, updateGoal)
  .delete(protect, deleteGoal);

// Feedback Review Routes
router.route('/feedbacks')
  .post(protect, createFeedback)
  .get(protect, getFeedbacks);

router.route('/feedbacks/:id')
  .put(protect, updateFeedback)
  .delete(protect, deleteFeedback);

// Admin Dashboard Routes
router.get('/admin/overview', protect, adminOnly, getAdminOverview);

module.exports = router;