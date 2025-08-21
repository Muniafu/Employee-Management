const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, adminOnly, departmentController.createDepartment);
router.get('/', protect, adminOnly, departmentController.getDepartments);
router.put('/:id', protect, adminOnly, departmentController.updateDepartment);
router.delete('/:id', protect, adminOnly, departmentController.deleteDepartment);

module.exports = router;