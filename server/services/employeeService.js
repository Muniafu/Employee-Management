import Employee from '../models/Employee.js';
import Review from '../models/Review.js';
import Goal from '../models/Goal.js';
import APIError from '../utils/APIError.js';

/**
 * Service for employee operations
 */
class EmployeeService {
  /**
   * Create a new employee profile
   * @param {Object} employeeData - Employee data
   * @returns {Promise<Object>} Created employee
   */
  static async createEmployee(employeeData) {
    // Check if employee profile already exists for this user
    if (await Employee.findOne({ user: employeeData.user })) {
      throw new APIError(400, 'Employee profile already exists for this user');
    }

    const employee = await Employee.create(employeeData);
    return employee;
  }

  /**
   * Get all employees with optional filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated employee data
   */
  static async getAllEmployees(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const query = Employee.find(filter)
      .populate('user', 'email role')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const [employees, total] = await Promise.all([
      query.exec(),
      Employee.countDocuments(filter)
    ]);

    return {
      data: employees,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get employee by ID with full details
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object>} Employee data with reviews and goals
   */
  static async getEmployeeById(employeeId) {
    const employee = await Employee.findById(employeeId)
      .populate('user', 'email role')
      .lean();

    if (!employee) {
      throw new APIError(404, 'Employee not found');
    }

    const [reviews, goals] = await Promise.all([
      Review.find({ employee: employeeId }).sort('-reviewPeriod.endDate').lean(),
      Goal.find({ employee: employeeId }).sort('-targetDate').lean()
    ]);

    return {
      ...employee,
      reviews,
      goals
    };
  }

  /**
   * Update employee profile
   * @param {string} employeeId - Employee ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated employee
   */
  static async updateEmployee(employeeId, updateData) {
    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'email role');

    if (!employee) {
      throw new APIError(404, 'Employee not found');
    }

    return employee;
  }

  /**
   * Get performance statistics for employee
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object>} Performance stats
   */
  static async getPerformanceStats(employeeId) {
    const [reviews, goals] = await Promise.all([
      Review.find({ employee: employeeId }),
      Goal.find({ employee: employeeId })
    ]);

    if (reviews.length === 0) {
      throw new APIError(404, 'No reviews found for this employee');
    }

    const avgRating = reviews.reduce((sum, review) => sum + review.performanceRating, 0) / reviews.length;
    const completedGoals = goals.filter(goal => goal.status === 'completed').length;
    const overdueGoals = goals.filter(goal => goal.isOverdue).length;

    return {
      avgRating: parseFloat(avgRating.toFixed(2)),
      totalReviews: reviews.length,
      totalGoals: goals.length,
      completedGoals,
      overdueGoals,
      completionRate: goals.length > 0 ? (completedGoals / goals.length) * 100 : 0
    };
  }
}

export default EmployeeService;