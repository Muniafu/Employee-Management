import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HTTP_STATUS, ROLES } from '../config/constants.js';
import { logger } from '../utils/logger.js';
import Employee from '../models/Employee.js';

const AuthController = {
  async register(req, res) {
    try {
      const { name, email, password, role = ROLES.EMPLOYEE } = req.body;

      // Validate role
      if (!Object.values(ROLES).includes(role)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: `Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}`
        });
      }

      // Check if user exists
      const existingUser = await Employee.findOne({ email });
      if (existingUser) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          error: 'Email already in use'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const newEmployee = new Employee({
        name,
        email,
        password: hashedPassword,
        role,
        department: req.body.department || 'Unassigned'
      });

      await newEmployee.save();

      // Generate JWT
      const token = jwt.sign(
        { id: newEmployee._id, role: newEmployee.role },
        env.jwtSecret,
        { expiresIn: '7d' }
      );

      // Omit password in response
      const user = newEmployee.toObject();
      delete user.password;

      return res.status(HTTP_STATUS.CREATED).json({ token, user });
    } catch (error) {
      logger.error('Registration error:', error);
      return res.status(HTTP_STATUS.SERVER_ERROR).json({
        error: 'Registration failed'
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const employee = await Employee.findOne({ email });
      if (!employee) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: 'Invalid credentials'
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, employee.password);
      if (!isMatch) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: 'Invalid credentials'
        });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: employee._id, role: employee.role },
        env.jwtSecret,
        { expiresIn: '7d' }
      );

      // Omit password in response
      const user = employee.toObject();
      delete user.password;

      return res.json({ token, user });
    } catch (error) {
      logger.error('Login error:', error);
      return res.status(HTTP_STATUS.SERVER_ERROR).json({
        error: 'Login failed'
      });
    }
  },

  async validateToken(req, res) {
    try {
      const employee = await Employee.findById(req.user.id).select('-password');
      if (!employee) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'User not found'
        });
      }
      return res.json(employee);
    } catch (error) {
      logger.error('Token validation error:', error);
      return res.status(HTTP_STATUS.SERVER_ERROR).json({
        error: 'Token validation failed'
      });
    }
  }
};

export default AuthController;