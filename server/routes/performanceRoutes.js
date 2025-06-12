const express = require('express');
const router = express.Router();
const {
  createMetric, getMetrics, updateMetric, deleteMetric,
  createGoal, getGoals, updateGoal, deleteGoal,
  createFeedback, getFeedbacks, updateFeedback, deleteFeedback
} = require('../controllers/performanceController');
const { protect } = require('../middleware/authMiddleware');

// Metrics
router.route('/metrics')
  .post(protect, createMetric)
  .get(protect, getMetrics);
router.route('/metrics/:id')
  .put(protect, updateMetric)
  .delete(protect, deleteMetric);

// Goals
router.route('/goals')
  .post(protect, createGoal)
  .get(protect, getGoals);
router.route('/goals/:id')
  .put(protect, updateGoal)
  .delete(protect, deleteGoal);

// Feedback
router.route('/feedbacks')
  .post(protect, createFeedback)
  .get(protect, getFeedbacks);
router.route('/feedbacks/:id')
  .put(protect, updateFeedback)
  .delete(protect, deleteFeedback);

module.exports = router;