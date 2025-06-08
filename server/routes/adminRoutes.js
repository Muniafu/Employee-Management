const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/adminMiddleware');

// Protect all routes after this middleware
router.use(protect);
router.use(requireAdmin);

// Employee management routes
router.route('/employees')
  .get(restrictTo('admin', 'super-admin'), adminController.getAllEmployees)
  .post(restrictTo('super-admin'), adminController.createEmployee);

router.route('/employees/:id')
  .get(restrictTo('admin', 'super-admin'), adminController.getEmployee)
  .patch(restrictTo('super-admin'), adminController.updateEmployee)
  .delete(restrictTo('super-admin'), adminController.deleteEmployee);

router.patch('/employees/:id/status', 
  restrictTo('admin', 'super-admin'), 
  adminController.updateEmployeeStatus
);

router.patch('/employees/:id/role', 
  restrictTo('super-admin'), 
  adminController.updateEmployeeRole
);

// Performance review routes
router.get('/employees/:id/performance', 
  restrictTo('admin', 'super-admin'), 
  adminController.getEmployeePerformance
);

// Admin dashboard stats
router.get('/dashboard', 
  restrictTo('admin', 'super-admin'), 
  adminController.getDashboardStats
);

module.exports = router;