import { HTTP_STATUS } from '../config/constants.js';
import Employee from '../models/Employee.js';
import PerformanceReview from '../models/PerformanceReview.js';
import { logger } from '../utils/logger.js';
import bcrypt from 'bcrypt';

const AdminController = {
  async getAllEmployees(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const [employees, total] = await Promise.all([
        Employee.find()
          .select('-password')
          .skip(skip)
          .limit(parseInt(limit)),
        Employee.countDocuments()
      ]);

      res.json({
        data: employees,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        }
      });
    } catch (error) {
      logger.error('Fetch employees error:', error);
      res.status(HTTP_STATUS.SERVER_ERROR).json({ error: 'Server error' });
    }
  },

  async createEmployee(req, res) {
    try {
      const { password, ...rest } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const newEmployee = new Employee({ ...rest, password: hashedPassword });
      await newEmployee.save();

      const response = newEmployee.toObject();
      delete response.password;

      res.status(HTTP_STATUS.CREATED).json(response);
    } catch (error) {
      logger.error('Create employee error:', error);
      res.status(HTTP_STATUS.SERVER_ERROR).json({ error: 'Unable to create employee' });
    }
  },

  async createPerformanceReview(req, res) {
    try {
      const review = new PerformanceReview({
        ...req.body,
        reviewer: req.user.id,
        status: 'PENDING'
      });

      await review.save();
      res.status(HTTP_STATUS.CREATED).json(review);
    } catch (error) {
      logger.error('Create review error:', error);
      res.status(HTTP_STATUS.SERVER_ERROR).json({ error: 'Review creation failed' });
    }
  },

  async generatePerformanceReport(req, res) {
    try {
      const report = await PerformanceReview.aggregate([
        {
          $group: {
            _id: '$employee',
            averageScore: { $avg: '$overallScore' },
            reviewCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'employees',
            localField: '_id',
            foreignField: '_id',
            as: 'employee'
          }
        },
        { $unwind: '$employee' },
        {
          $project: {
            name: '$employee.name',
            email: '$employee.email',
            department: '$employee.department',
            averageScore: { $round: ['$averageScore', 2] },
            reviewCount: 1
          }
        },
        { $sort: { averageScore: -1 } }
      ]);

      res.json(report);
    } catch (error) {
      logger.error('Report error:', error);
      res.status(HTTP_STATUS.SERVER_ERROR).json({ error: 'Could not generate report' });
    }
  }
};

export default AdminController;