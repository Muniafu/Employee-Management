import { HTTP_STATUS } from '../config/constants.js';
import { logger } from '../utils/logger.js';
import Employee from '../models/Employee.js';
import PerformanceReview from '../models/PerformanceReview.js';
import User from '../models/User.js';

const EmployeeController = {
  async getProfile(req, res) {
    try {
      const employee = await Employee.findById(req.user.id)
        .select('-password')
        .populate('department', 'name');

        const [employeeExists, reviewerExists] = await Promise.all([
            User.exists({ _id: employee, role: 'employee' }),
            User.exists({ _id: reviwer, role: { $in: ['manager', 'admin']
                } })
        ]);

      if (!employee) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Employee not found'
        });
      }

      return res.status(HTTP_STATUS.NOT_FOUND).json(employee);
    } catch (error) {
      logger.error('Get profile error:', error);
      return res.status(HTTP_STATUS.SERVER_ERROR).json({
        error: 'Failed to fetch profile'
      });
    }
  },

  async updateProfile(req, res) {
    try {
      // Prevent role/department updates from regular employees
      if (req.body.role || req.body.department) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          error: 'You cannot update your role or department'
        });
      }

      const updatedEmployee = await Employee.findByIdAndUpdate(
        req.user.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).select('-password');

      return res.status(HTTP_STATUS.OK).json(updatedEmployee);
    } catch (error) {
      logger.error('Update profile error:', error);
      return res.status(HTTP_STATUS.SERVER_ERROR).json({
        error: 'Profile update failed'
      });
    }
  },

  async getPerformanceReviews(req, res) {
    try {
      const reviews = await PerformanceReview.find({
        employee: req.user.id
      })
        .sort({ date: -1 })
        .populate('reviewer', 'name');

      return res.json(reviews);
    } catch (error) {
      logger.error('Get reviews error:', error);
      return res.status(HTTP_STATUS.SERVER_ERROR).json({
        error: 'Failed to fetch performance reviews'
      });
    }
  },

  async submitSelfReview(req, res) {
    try {
      const { strengths, weaknesses, accomplishments } = req.body;

      const newReview = new PerformanceReview({
        employee: req.user.id,
        type: 'SELF',
        strengths,
        weaknesses,
        accomplishments,
        status: 'SUBMITTED'
      });

      await newReview.save();

      return res.status(HTTP_STATUS.CREATED).json(newReview);
    } catch (error) {
      logger.error('Self-review error:', error);
      return res.status(HTTP_STATUS.SERVER_ERROR).json({
        error: 'Failed to submit self-review'
      });
    }
  }
};

export default EmployeeController;