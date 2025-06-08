const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { protect } = require('../middlewares/authMiddleware');

// Protect all routes after this middleware
router.use(protect);

// Performance routes
router.get('/performance', employeeController.getPerformanceMetrics);

// Goal routes
router.route('/goals')
  .get(employeeController.getGoals)
  .post(employeeController.setGoals);

router.patch('/goals/:id/progress', employeeController.updateGoalProgress);

// Feedback routes
router.route('/feedback')
  .get(employeeController.getFeedback)
  .post(employeeController.submitFeedback);

// Profile management
router.patch('/updateMyProfile', employeeController.updateProfile);

module.exports = router;