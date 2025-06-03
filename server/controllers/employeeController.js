import EmployeeService from '../services/employeeService.js';
import APIError from '../utils/APIError.js';
import httpStatus from 'http-status';

class EmployeeController {
  /**
   * Create employee profile
   */
  static createEmployee = async (req, res, next) => {
    try {
      const employee = await EmployeeService.createEmployee(req.body);
      res.status(httpStatus.CREATED).json({
        success: true,
        data: employee
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all employees
   */
  static getAllEmployees = async (req, res, next) => {
    try {
      const { department, status } = req.query;
      const filter = {};
      if (department) filter.department = department;
      if (status) filter.status = status;
      
      const result = await EmployeeService.getAllEmployees(filter, {
        page: req.query.page,
        limit: req.query.limit,
        sort: req.query.sort
      });
      
      res.status(httpStatus.OK).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get employee by ID
   */
  static getEmployee = async (req, res, next) => {
    try {
      const employee = await EmployeeService.getEmployeeById(req.params.id);
      res.status(httpStatus.OK).json({
        success: true,
        data: employee
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update employee profile
   */
  static updateEmployee = async (req, res, next) => {
    try {
      const employee = await EmployeeService.updateEmployee(
        req.params.id,
        req.body
      );
      res.status(httpStatus.OK).json({
        success: true,
        data: employee
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get employee performance stats
   */
  static getEmployeeStats = async (req, res, next) => {
    try {
      const stats = await EmployeeService.getPerformanceStats(req.params.id);
      res.status(httpStatus.OK).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };
}

export default EmployeeController;