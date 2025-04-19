import express from 'express';
import { authenticate, restrictTo } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateRequest.js';
import AdminController from '../controllers/adminController.js';
import { AdminSchemas } from '../middleware/validateRequest.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Apply authentication and admin restriction to all routes
router.use(authenticate, restrictTo(ROLES.ADMIN, ROLES.MANAGER));

// Employee management
router.route('/employees')
  .get(
    validate(AdminSchemas.listEmployees, 'query'),
    AdminController.getAllEmployees
  )
  .post(
    validate(AdminSchemas.createEmployee),
    AdminController.createEmployee
  );

router.route('/employees/:id')
  .get(AdminController.getEmployee)
  .patch(
    validate(AdminSchemas.updateEmployee),
    AdminController.updateEmployee
  )
  .delete(AdminController.deleteEmployee);

// Performance management
router.route('/performance-reviews')
  .get(
    validate(AdminSchemas.listReviews, 'query'),
    AdminController.getAllPerformanceReviews
  )
  .post(
    validate(AdminSchemas.createReview),
    AdminController.createPerformanceReview
  );

router.route('/performance-reviews/:id')
  .get(AdminController.getPerformanceReview)
  .patch(
    validate(AdminSchemas.updateReview),
    AdminController.updatePerformanceReview
  )
  .delete(AdminController.deletePerformanceReview);

// Reports and bulk operations
router.get('/reports/performance', AdminController.generatePerformanceReport);
router.post('/performance/bulk-update', AdminController.bulkUpdatePerformance);

// Manager-specific endpoints
router.use(restrictTo(ROLES.MANAGER));

router.get('/my-team', AdminController.getManagedTeam);
router.patch(
  '/approve-review/:id',
  AdminController.approvePerformanceReview
);

export default router;