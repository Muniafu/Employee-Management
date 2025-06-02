const goalService = require('../services/goalService');
const notificationService = require('../services/notificationService');
const { ResponseHandler } = require('../utils/response');
const logger = require('../utils/logger');
const APIError = require('../utils/APIError');
const APIFeatures = require('../utils/apiFeatures');

class GoalController {
  /**
   * @desc    Get all goals with advanced querying
   * @route   GET /api/v1/goals
   * @access  Private
   */
  static async getAllGoals(req, res) {
    try {
      // Build base query with authorization
      let filter = {};
      
      // Non-admins can only see their own goals
      if (req.user.role !== 'admin') {
        filter = { employee: req.user.employee };
      }
      
      // Create APIFeatures instance
      const features = new APIFeatures(Goal.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
      
      // Populate related data
      features.query.populate([
        { path: 'employee', select: 'firstName lastName position' },
        { path: 'createdBy', select: 'firstName lastName' },
        { path: 'lastUpdatedBy', select: 'firstName lastName' }
      ]);
      
      // Execute query
      const [goals, total] = await Promise.all([
        features.query.exec(),
        Goal.countDocuments(features.filteredQuery)
      ]);
      
      // Get pagination metadata
      const pagination = features.getPaginationMeta(total);
      
      ResponseHandler.success({
        res,
        message: 'Goals retrieved successfully',
        data: goals,
        meta: { pagination }
      });
    } catch (error) {
      logger.error(`Failed to fetch goals: ${error.message}`, { error });
      ResponseHandler.error({
        res,
        statusCode: 500,
        message: 'Failed to retrieve goals'
      });
    }
  }

  /**
   * @desc    Get single goal
   * @route   GET /api/v1/goals/:id
   * @access  Private (Admin/Manager/Goal Owner)
   */
  static async getGoal(req, res) {
    try {
      const goal = await goalService.getGoalById(req.params.id);
      if (!goal) {
        throw new APIError('Goal not found', 404);
      }
      
      // Authorization: Admins/managers can view, employees can view their own
      const isAdminOrManager = ['admin', 'manager'].includes(req.user.role);
      const isOwner = goal.employee.equals(req.user.employee);
      
      if (!isAdminOrManager && !isOwner) {
        throw new APIError('Unauthorized to view this goal', 403);
      }
      
      ResponseHandler.success({
        res,
        message: 'Goal retrieved successfully',
        data: goal
      });
    } catch (error) {
      logger.error(`Failed to get goal ${req.params.id}: ${error.message}`);
      ResponseHandler.error({
        res,
        statusCode: error.statusCode || 500,
        message: error.message || 'Goal retrieval failed'
      });
    }
  }

  /**
   * @desc    Create new goal
   * @route   POST /api/v1/goals
   * @access  Private (Admin/Manager)
   */
  static async createGoal(req, res) {
    try {
      // Authorization: Only admins and managers can create goals
      if (!['admin', 'manager'].includes(req.user.role)) {
        throw new APIError('Unauthorized to create goals', 403);
      }
      
      const goalData = {
        ...req.body,
        createdBy: req.user.employee
      };
      
      const goal = await goalService.createGoal(goalData);
      
      // Notify employee asynchronously
      notificationService.sendGoalAssignment(
        goal.employee.email,
        goal.title,
        goal.targetDate
      ).catch(err => logger.error('Goal assignment notification failed', err));
      
      ResponseHandler.success({
        res,
        statusCode: 201,
        message: 'Goal created successfully',
        data: goal
      });
    } catch (error) {
      logger.error(`Goal creation failed: ${error.message}`, { body: req.body });
      ResponseHandler.error({
        res,
        statusCode: error.statusCode || 400,
        message: error.message || 'Goal creation failed'
      });
    }
  }

  /**
   * @desc    Update goal details
   * @route   PATCH /api/v1/goals/:id
   * @access  Private (Admin/Manager)
   */
  static async updateGoal(req, res) {
    try {
      const { id } = req.params;
      
      // Authorization: Only admins and managers can update goals
      if (!['admin', 'manager'].includes(req.user.role)) {
        throw new APIError('Unauthorized to update goals', 403);
      }
      
      const updateData = {
        ...req.body,
        lastUpdatedBy: req.user.employee
      };
      
      const updatedGoal = await goalService.updateGoal(id, updateData);
      
      if (!updatedGoal) {
        throw new APIError('Goal not found', 404);
      }
      
      ResponseHandler.success({
        res,
        message: 'Goal updated successfully',
        data: updatedGoal
      });
    } catch (error) {
      logger.error(`Failed to update goal ${req.params.id}: ${error.message}`, { body: req.body });
      ResponseHandler.error({
        res,
        statusCode: error.statusCode || 400,
        message: error.message || 'Goal update failed'
      });
    }
  }

  /**
   * @desc    Update goal progress
   * @route   PATCH /api/v1/goals/:id/progress
   * @access  Private (Goal Owner)
   */
  static async updateGoalProgress(req, res) {
    try {
      const { id } = req.params;
      const { progress } = req.body;
      
      const goal = await goalService.getGoalById(id);
      if (!goal) {
        throw new APIError('Goal not found', 404);
      }
      
      // Authorization: Only the goal owner can update progress
      if (!goal.employee.equals(req.user.employee)) {
        throw new APIError('Unauthorized to update this goal', 403);
      }
      
      // Prevent updating completed goals
      if (goal.status === 'completed') {
        throw new APIError('Cannot update progress on completed goals', 400);
      }
      
      const updatedGoal = await goalService.updateGoal(id, {
        progress,
        lastUpdatedBy: req.user.employee
      });
      
      ResponseHandler.success({
        res,
        message: 'Progress updated successfully',
        data: updatedGoal
      });
    } catch (error) {
      logger.error(`Failed to update goal progress ${req.params.id}: ${error.message}`);
      ResponseHandler.error({
        res,
        statusCode: error.statusCode || 400,
        message: error.message || 'Progress update failed'
      });
    }
  }

  /**
   * @desc    Delete goal
   * @route   DELETE /api/v1/goals/:id
   * @access  Private (Admin)
   */
  static async deleteGoal(req, res) {
    try {
      // Authorization: Only admins can delete goals
      if (req.user.role !== 'admin') {
        throw new APIError('Unauthorized to delete goals', 403);
      }
      
      await goalService.deleteGoal(req.params.id);
      
      ResponseHandler.success({
        res,
        message: 'Goal deleted successfully'
      });
    } catch (error) {
      logger.error(`Failed to delete goal ${req.params.id}: ${error.message}`);
      ResponseHandler.error({
        res,
        statusCode: error.statusCode || 500,
        message: error.message || 'Goal deletion failed'
      });
    }
  }

  /**
   * @desc    Get goals for an employee
   * @route   GET /api/v1/employees/:employeeId/goals
   * @access  Private (Admin/Manager/Employee-Owner)
   */
  static async getEmployeeGoals(req, res) {
    try {
      const { employeeId } = req.params;
      
      // Authorization: Employee can only access their own goals
      if (req.user.role === 'employee' && req.user.employee.toString() !== employeeId) {
        throw new APIError('Unauthorized to access these goals', 403);
      }
      
      const goals = await goalService.getGoalsByEmployee(employeeId);
      
      ResponseHandler.success({
        res,
        message: 'Employee goals retrieved successfully',
        data: goals
      });
    } catch (error) {
      logger.error(`Failed to get goals for employee ${req.params.employeeId}: ${error.message}`);
      ResponseHandler.error({
        res,
        statusCode: error.statusCode || 500,
        message: 'Failed to retrieve employee goals'
      });
    }
  }

  /**
   * @desc    Complete a goal
   * @route   PATCH /api/v1/goals/:id/complete
   * @access  Private (Admin/Manager/Goal Owner)
   */
  static async completeGoal(req, res) {
    try {
      const { id } = req.params;
      
      const goal = await goalService.getGoalById(id);
      if (!goal) {
        throw new APIError('Goal not found', 404);
      }
      
      // Authorization: Admins/managers can complete, employees can complete their own
      const isAdminOrManager = ['admin', 'manager'].includes(req.user.role);
      const isOwner = goal.employee.equals(req.user.employee);
      
      if (!isAdminOrManager && !isOwner) {
        throw new APIError('Unauthorized to complete this goal', 403);
      }
      
      const completedGoal = await goalService.updateGoal(id, {
        progress: 100,
        status: 'completed',
        completionDate: new Date(),
        lastUpdatedBy: req.user.employee
      });
      
      ResponseHandler.success({
        res,
        message: 'Goal marked as completed',
        data: completedGoal
      });
    } catch (error) {
      logger.error(`Failed to complete goal ${req.params.id}: ${error.message}`);
      ResponseHandler.error({
        res,
        statusCode: error.statusCode || 400,
        message: error.message || 'Goal completion failed'
      });
    }
  }
}

module.exports = GoalController;