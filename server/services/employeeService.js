const Employee = require('../models/Employee');
const User = require('../models/User');
const Review = require('../models/Review');
const Goal = require('../models/Goal');
const APIError = require('../utils/APIError');
const logger = require('../utils/logger');
const { buildPagination } = require('../utils/pagination');

class EmployeeService {
  /**
   * Get all employees with advanced filtering and pagination
   * @param {Object} filter - MongoDB filter
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Results per page
   * @param {string} options.sort - Sort field
   * @param {string} options.fields - Fields to include
   * @returns {Promise<Object>} { employees, pagination }
   */
  static async getAllEmployees(filter = {}, options = {}) {
    try {
      const page = parseInt(options.page, 10) || 1;
      const limit = parseInt(options.limit, 10) || 20;
      const skip = (page - 1) * limit;

      // Build query
      const query = Employee.find(filter)
        .populate('user', 'email role isActive')
        .populate('manager', 'firstName lastName position')
        .populate('directReports', 'firstName lastName position');

      // Apply sorting
      if (options.sort) {
        const sortFields = options.sort.split(',').join(' ');
        query.sort(sortFields);
      } else {
        query.sort('-createdAt');
      }

      // Apply field projection
      if (options.fields) {
        const fields = options.fields.split(',').join(' ');
        query.select(fields);
      }

      // Apply pagination
      query.skip(skip).limit(limit);

      const [employees, total] = await Promise.all([
        query.exec(),
        Employee.countDocuments(filter)
      ]);

      const pagination = buildPagination({
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit
      });

      return { employees, pagination };
    } catch (error) {
      logger.error(`Failed to fetch employees: ${error.message}`, { error });
      throw new APIError('Failed to retrieve employees', 500);
    }
  }

  /**
   * Create a new employee with optional user association
   * @param {Object} employeeData - Employee data
   * @param {string} [employeeData.userId] - Associated user ID
   * @returns {Promise<Employee>} Created employee
   */
  static async createEmployee(employeeData) {
    try {
      // Validate user association
      if (employeeData.userId) {
        const user = await User.findById(employeeData.userId);
        if (!user) {
          throw new APIError('Associated user not found', 404);
        }
        
        // Check for existing employee-user link
        const existingEmployee = await Employee.findOne({ user: employeeData.userId });
        if (existingEmployee) {
          throw new APIError('User is already associated with another employee', 409);
        }
      }

      return await Employee.create(employeeData);
    } catch (error) {
      logger.error(`Employee creation failed: ${error.message}`, { employeeData });
      throw new APIError(error.message || 'Employee creation failed', error.statusCode || 400);
    }
  }

  /**
   * Get employee by ID with detailed statistics
   * @param {string} id - Employee ID
   * @param {Object} [options] - Additional options
   * @param {boolean} [options.withStats] - Include performance stats
   * @returns {Promise<Object>} Employee with optional stats
   */
  static async getEmployeeById(id, options = {}) {
    try {
      const employee = await Employee.findById(id)
        .populate('user', 'email role lastLogin')
        .populate('manager', 'firstName lastName position')
        .populate('directReports', 'firstName lastName position');

      if (!employee) {
        throw new APIError('Employee not found', 404);
      }

      if (!options.withStats) {
        return employee;
      }

      const [reviews, goals, teamSize] = await Promise.all([
        Review.find({ employee: id }).select('ratings.performance reviewDate period status'),
        Goal.find({ employee: id }).select('title status progress targetDate'),
        Employee.countDocuments({ manager: id })
      ]);

      const performanceStats = this.calculatePerformanceStats(reviews);
      const goalStats = this.calculateGoalStats(goals);

      return {
        ...employee.toObject(),
        stats: {
          performance: performanceStats,
          goals: goalStats,
          reviewCount: reviews.length,
          goalCount: goals.length,
          teamSize
        }
      };
    } catch (error) {
      logger.error(`Failed to get employee ${id}: ${error.message}`);
      throw new APIError(error.message || 'Employee retrieval failed', error.statusCode || 500);
    }
  }

  /**
   * Update employee details
   * @param {string} id - Employee ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Employee>} Updated employee
   */
  static async updateEmployee(id, updateData) {
    try {
      // Prevent changing protected fields
      const protectedFields = ['user', 'createdAt', '_id'];
      protectedFields.forEach(field => delete updateData[field]);

      const employee = await Employee.findByIdAndUpdate(
        id,
        updateData,
        { 
          new: true,
          runValidators: true,
          context: 'query'
        }
      ).populate('user', 'email role');

      if (!employee) {
        throw new APIError('Employee not found', 404);
      }

      return employee;
    } catch (error) {
      logger.error(`Failed to update employee ${id}: ${error.message}`, { updateData });
      throw new APIError('Employee update failed', 400);
    }
  }

  /**
   * Delete employee and cascade related data
   * @param {string} id - Employee ID
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteEmployee(id) {
    const session = await Employee.startSession();
    session.startTransaction();

    try {
      const employee = await Employee.findById(id).session(session);
      if (!employee) {
        throw new APIError('Employee not found', 404);
      }

      // Cascade delete operations
      await Promise.all([
        Review.deleteMany({ employee: id }).session(session),
        Goal.deleteMany({ employee: id }).session(session),
        // User deletion handled by Employee model middleware
        Employee.updateMany(
          { manager: id },
          { $unset: { manager: 1 } },
          { session }
        )
      ]);

      await employee.remove({ session });
      await session.commitTransaction();

      logger.info(`Employee deleted: ${id}`);
      return { message: 'Employee deleted successfully' };
    } catch (error) {
      await session.abortTransaction();
      logger.error(`Failed to delete employee ${id}: ${error.message}`);
      throw new APIError('Employee deletion failed', 500);
    } finally {
      session.endSession();
    }
  }

  /**
   * Get team hierarchy tree
   * @param {string} managerId - Manager employee ID
   * @param {number} [maxDepth=3] - Maximum hierarchy depth
   * @returns {Promise<Object>} Team hierarchy tree
   */
  static async getTeamHierarchy(managerId, maxDepth = 3) {
    try {
      const buildTeamTree = async (employeeId, currentDepth = 0) => {
        if (currentDepth > maxDepth) return null;

        const employee = await Employee.findById(employeeId)
          .select('firstName lastName position')
          .lean();

        if (!employee) return null;

        const directReports = await Employee.find({ manager: employeeId })
          .select('firstName lastName position')
          .lean();

        const children = await Promise.all(
          directReports.map(report => 
            buildTeamTree(report._id, currentDepth + 1)
          )
        );

        return {
          ...employee,
          id: employee._id,
          children: children.filter(Boolean)
        };
      };

      return await buildTeamTree(managerId);
    } catch (error) {
      logger.error(`Team hierarchy failed for manager ${managerId}: ${error.message}`);
      throw new APIError('Failed to build team hierarchy', 500);
    }
  }

  /**
   * Calculate performance statistics from reviews
   * @param {Array} reviews - Review documents
   * @returns {Object} Performance stats
   */
  static calculatePerformanceStats(reviews) {
    if (reviews.length === 0) {
      return null;
    }

    const stats = {
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      latestRating: null
    };

    let total = 0;
    let latestReview = null;

    reviews.forEach(review => {
      if (review.status !== 'approved') return;

      const rating = review.ratings.performance;
      total += rating;
      stats.ratingDistribution[rating]++;

      if (!latestReview || review.reviewDate > latestReview.reviewDate) {
        latestReview = review;
      }
    });

    if (total > 0) {
      stats.averageRating = (total / reviews.filter(r => r.status === 'approved').length).toFixed(1);
    }

    if (latestReview) {
      stats.latestRating = {
        rating: latestReview.ratings.performance,
        date: latestReview.reviewDate,
        period: latestReview.period
      };
    }

    return stats;
  }

  /**
   * Calculate goal statistics
   * @param {Array} goals - Goal documents
   * @returns {Object} Goal stats
   */
  static calculateGoalStats(goals) {
    if (goals.length === 0) {
      return null;
    }

    const stats = {
      completed: 0,
      inProgress: 0,
      overdue: 0,
      averageProgress: 0
    };

    let totalProgress = 0;
    const now = new Date();

    goals.forEach(goal => {
      totalProgress += goal.progress;

      if (goal.status === 'completed') {
        stats.completed++;
      } else if (goal.targetDate < now) {
        stats.overdue++;
      } else {
        stats.inProgress++;
      }
    });

    stats.averageProgress = Math.round(totalProgress / goals.length);

    return stats;
  }
}

module.exports = EmployeeService;