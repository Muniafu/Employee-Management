const employeeService = require('../services/employeeService');
const APIFeatures = require('../utils/apiFeatures');
const { ResponseHandler } = require('../utils/response');
const logger = require('../utils/logger');
const APIError = require('../utils/APIError');

class EmployeeController {
  /**
   * @desc    Get all employees with advanced querying
   * @route   GET /api/v1/employees
   * @access  Private (Admin/Manager)
   */
  static async getAllEmployees(req, res) {
    try {
      // Extract query parameters
      const { query } = req;
      
      // Create APIFeatures instance
      const features = new APIFeatures(Employee.find(), query)
        .filter()
        .search(['firstName', 'lastName', 'position', 'department'])
        .sort()
        .limitFields()
        .paginate();
      
      // Execute query
      const [employees, total] = await Promise.all([
        features.query.populate('user', 'email role isActive'),
        Employee.countDocuments(features.filteredQuery)
      ]);
      
      // Get pagination metadata
      const pagination = features.getPaginationMeta(total);
      
      ResponseHandler.success({
        res,
        message: 'Employees retrieved successfully',
        data: employees,
        meta: { pagination }
      });
    } catch (error) {
      logger.error(`Failed to fetch employees: ${error.message}`, { error });
      ResponseHandler.error({
        res,
        statusCode: 500,
        message: 'Failed to retrieve employees'
      });
    }
  }

  /**
   * @desc    Get single employee with performance stats
   * @route   GET /api/v1/employees/:id
   * @access  Private (Admin/Manager/Employee-Owner)
   */
  static async getEmployee(req, res) {
    try {
      const { id } = req.params;
      
      // Authorization: Employee can only access their own data
      if (req.user.role === 'employee' && req.user.employee.toString() !== id) {
        throw new APIError('Unauthorized to access this employee', 403);
      }
      
      const employee = await employeeService.getEmployeeById(id, { withStats: true });
      
      if (!employee) {
        throw new APIError('Employee not found', 404);
      }
      
      ResponseHandler.success({
        res,
        message: 'Employee retrieved successfully',
        data: employee
      });
    } catch (error) {
      logger.error(`Failed to get employee ${req.params.id}: ${error.message}`);
      ResponseHandler.error({
        res,
        statusCode: error.statusCode || 500,
        message: error.message || 'Employee retrieval failed'
      });
    }
  }

  /**
   * @desc    Create new employee
   * @route   POST /api/v1/employees
   * @access  Private (Admin/Manager)
   */
  static async createEmployee(req, res) {
    try {
      // Authorization: Only admins and managers can create employees
      if (!['admin', 'manager'].includes(req.user.role)) {
        throw new APIError('Unauthorized to create employees', 403);
      }
      
      const employee = await employeeService.createEmployee(req.body);
      
      ResponseHandler.success({
        res,
        statusCode: 201,
        message: 'Employee created successfully',
        data: employee
      });
    } catch (error) {
      logger.error(`Employee creation failed: ${error.message}`, { body: req.body });
      ResponseHandler.error({
        res,
        statusCode: error.statusCode || 400,
        message: error.message || 'Employee creation failed'
      });
    }
  }

  /**
   * @desc    Update employee
   * @route   PATCH /api/v1/employees/:id
   * @access  Private (Admin/Manager/Employee-Owner)
   */
  static async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      
      // Authorization: Only admins/managers or the employee themselves
      if (req.user.role === 'employee' && req.user.employee.toString() !== id) {
        throw new APIError('Unauthorized to update this employee', 403);
      }
      
      // Prevent role changes for non-admins
      if (req.user.role !== 'admin' && req.body.role) {
        delete req.body.role;
      }
      
      const updatedEmployee = await employeeService.updateEmployee(id, req.body);
      
      if (!updatedEmployee) {
        throw new APIError('Employee not found', 404);
      }
      
      ResponseHandler.success({
        res,
        message: 'Employee updated successfully',
        data: updatedEmployee
      });
    } catch (error) {
      logger.error(`Failed to update employee ${req.params.id}: ${error.message}`, { body: req.body });
      ResponseHandler.error({
        res,
        statusCode: error.statusCode || 400,
        message: error.message || 'Employee update failed'
      });
    }
  }

  /**
   * @desc    Delete employee
   * @route   DELETE /api/v1/employees/:id
   * @access  Private (Admin)
   */
  static async deleteEmployee(req, res) {
    try {
      // Authorization: Only admins can delete employees
      if (req.user.role !== 'admin') {
        throw new APIError('Unauthorized to delete employees', 403);
      }
      
      await employeeService.deleteEmployee(req.params.id);
      
      ResponseHandler.success({
        res,
        message: 'Employee deleted successfully'
      });
    } catch (error) {
      logger.error(`Failed to delete employee ${req.params.id}: ${error.message}`);
      ResponseHandler.error({
        res,
        statusCode: error.statusCode || 500,
        message: error.message || 'Employee deletion failed'
      });
    }
  }

  /**
   * @desc    Get team hierarchy
   * @route   GET /api/v1/employees/team/:managerId
   * @access  Private (Admin/Manager)
   */
  static async getTeamHierarchy(req, res) {
    try {
      const { managerId } = req.params;
      
      // Authorization: Managers can only view their own team
      if (req.user.role === 'manager' && req.user.employee.toString() !== managerId) {
        throw new APIError('Unauthorized to view this team', 403);
      }
      
      const team = await employeeService.getTeamHierarchy(managerId);
      
      ResponseHandler.success({
        res,
        message: 'Team hierarchy retrieved',
        data: team
      });
    } catch (error) {
      logger.error(`Failed to get team hierarchy for manager ${req.params.managerId}: ${error.message}`);
      ResponseHandler.error({
        res,
        statusCode: error.statusCode || 500,
        message: error.message || 'Failed to retrieve team hierarchy'
      });
    }
  }

  /**
   * @desc    Get direct reports for an employee
   * @route   GET /api/v1/employees/:id/direct-reports
   * @access  Private (Admin/Manager/Employee-Owner)
   */
  static async getDirectReports(req, res) {
    try {
      const { id } = req.params;
      
      // Authorization: Employee can only access their own data
      if (req.user.role === 'employee' && req.user.employee.toString() !== id) {
        throw new APIError('Unauthorized to access this data', 403);
      }
      
      const directReports = await employeeService.getDirectReports(id);
      
      ResponseHandler.success({
        res,
        message: 'Direct reports retrieved',
        data: directReports
      });
    } catch (error) {
      logger.error(`Failed to get direct reports for ${req.params.id}: ${error.message}`);
      ResponseHandler.error({
        res,
        statusCode: error.statusCode || 500,
        message: 'Failed to retrieve direct reports'
      });
    }
  }
}

module.exports = EmployeeController;