import GoalService from '../services/goalService.js';
import NotificationService from '../services/notificationService.js';
import APIError from '../utils/APIError.js';
import httpStatus from 'http-status';

class GoalController {
  /**
   * Create new goal
   */
  static createGoal = async (req, res, next) => {
    try {
      const goalData = {
        ...req.body,
        createdBy: req.user.id
      };
      const goal = await GoalService.createGoal(goalData);
      
      res.status(httpStatus.CREATED).json({
        success: true,
        data: goal
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get employee goals
   */
  static getEmployeeGoals = async (req, res, next) => {
    try {
      const { status } = req.query;
      const filter = { employee: req.params.employeeId };
      if (status) filter.status = status;
      
      const goals = await GoalService.getEmployeeGoals(filter, {
        page: req.query.page,
        limit: req.query.limit,
        sort: req.query.sort
      });
      
      res.status(httpStatus.OK).json({
        success: true,
        ...goals
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update goal
   */
  static updateGoal = async (req, res, next) => {
    try {
      const goal = await GoalService.updateGoal(
        req.params.id,
        req.body,
        req.user.role
      );
      
      // Notify if goal was completed
      if (goal.status === 'completed') {
        NotificationService.notifyGoalCompletion(goal._id)
          .catch(error => console.error('Notification failed:', error));
      }
      
      res.status(httpStatus.OK).json({
        success: true,
        data: goal
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update goal progress
   */
  static updateGoalProgress = async (req, res, next) => {
    try {
      const goal = await GoalService.updateGoalProgress(
        req.params.id,
        req.body.progress,
        req.user.id
      );
      
      res.status(httpStatus.OK).json({
        success: true,
        data: goal
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete goal
   */
  static deleteGoal = async (req, res, next) => {
    try {
      await GoalService.deleteGoal(req.params.id, req.user.role);
      res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}

export default GoalController;