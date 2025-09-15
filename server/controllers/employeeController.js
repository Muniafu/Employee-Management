const Employee = require('../models/Employee');
const User = require('../models/User');
const logger = require('../config/logger');

/**
 * Helper to normalize the employee object returned to client
 */
function normalizeEmployee(empDoc) {
  if (!empDoc) return null;
  // if it's a Mongoose doc, convert to plain object
  const emp = empDoc.toObject ? empDoc.toObject() : empDoc;
  return {
    _id: emp._id,
    firstName: emp.firstName || '',
    lastName: emp.lastName || '',
    name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
    department: emp.department || null,
    position: emp.position || null,
    salary: emp.salary || null,
    user: emp.user || null,
    createdAt: emp.createdAt || null,
    updatedAt: emp.updatedAt || null,
  };
}

/**
 * Admin creates a new employee (optionally creates linked User)
 */
async function createEmployee(req, res) {
  try {
    const {
      firstName,
      lastName,
      email,
      username,
      password,
      role,
      department,
      position,
      salary,
    } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'firstName and lastName are required' });
    }

    // initialize user variable properly
    let user = null;

    // If admin provided login fields, create the User account
    if (username || email || password) {
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'username, email and password are required to create a login account' });
      }

      // Check duplicates
      const exists = await User.findOne({ $or: [{ email }, { username }] });
      if (exists) {
        return res.status(409).json({ message: 'Email or username already exists' });
      }

      user = new User({
        username,
        email,
        password,
        role: role || 'Employee',
      });
      await user.save();
    }

    // Create Employee profile and link to user if present
    const emp = new Employee({
      firstName,
      lastName,
      department: department || null,
      position: position || null,
      salary: salary || null,
      user: user ? user._id : null,
    });

    await emp.save();

    // Link back employee id to user
    if (user) {
      user.employee = emp._id;
      await user.save();
    }

    // Populate for response (department + user small projection)
    const populated = await Employee.findById(emp._id)
      .populate('department')
      .populate('user', 'email username role');

    return res.status(201).json({
      message: 'Employee created successfully',
      employee: normalizeEmployee(populated),
    });
  } catch (err) {
    if (err && err.code === 11000) {
      logger.error('createEmployee duplicate key', err);
      return res.status(409).json({ message: 'Duplicate key error', details: err.keyValue || err.message });
    }    

    logger.error('createEmployee error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function listEmployees(req, res) {
  try {
    const employees = await Employee.find()
      .populate('department')
      .populate('user', 'email username role')
      .sort({ createdAt: -1 });

    const result = employees.map(normalizeEmployee);
    return res.json({ employees: result });
  } catch (err) {
    logger.error('listEmployees error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function getEmployeeById(req, res) {
  try {
    const { id } = req.params;
    const emp = await Employee.findById(id)
      .populate('department')
      .populate('user', 'email username role');

    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    return res.json({ employee: normalizeEmployee(emp) });
  } catch (err) {
    logger.error('getEmployeeById error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const emp = await Employee.findByIdAndUpdate(id, updates, { new: true })
      .populate('department')
      .populate('user', 'email username role');

    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    return res.json({ message: 'Employee updated', employee: normalizeEmployee(emp) });
  } catch (err) {
    logger.error('updateEmployee error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;
    const emp = await Employee.findByIdAndDelete(id);
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    // Delete linked User as well (if any)
    if (emp.user) {
      await User.findOneAndDelete({ _id: emp.user });
    }

    return res.json({ message: 'Employee and linked User deleted' });
  } catch (err) {
    logger.error('deleteEmployee error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

/**
 * Self-service: get current user's employee profile
 */
async function getMyProfile(req, res) {
  try {
    // If JWT payload set req.user and includes employee or user id, prefer employee link
    const userId = req.user && req.user._id ? req.user._id : req.user && req.user.id ? req.user.id : null;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // If user has linked employee id on the user doc, use it
    const user = await User.findById(userId).select('employee role');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'Admin') {
      // Admins do not have employee profiles
      return res.status(403).json({ message: 'Admins do not have an employee profile' });
    }

    if (!user.employee) {
      return res.status(404).json({ message: 'No employee profile linked' });
    }

    const employee = await Employee.findById(user.employee)
      .populate('department')
      .populate('user', 'email username role');

    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    return res.json({ employee: normalizeEmployee(employee) });
  } catch (err) {
    logger.error('getMyProfile error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function updateMyProfile(req, res) {
  try {
    const userId = req.user && req.user._id ? req.user._id : req.user && req.user.id ? req.user.id : null;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).select('employee role');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'Admin') {
      return res.status(403).json({ message: 'Admins cannot update employee profiles here' });
    }

    if (!user.employee) {
      return res.status(404).json({ message: 'No employee profile linked' });
    }

    const updates = req.body || {};
    // Restrict updates to allowed employee fields
    const allowed = ['firstName', 'lastName', 'department', 'position', 'salary', 'phone', 'address'];
    const payload = {};
    allowed.forEach((k) => {
      if (typeof updates[k] !== 'undefined') payload[k] = updates[k];
    });

    const updated = await Employee.findByIdAndUpdate(user.employee, payload, { new: true })
      .populate('department')
      .populate('user', 'email username role');

    if (!updated) return res.status(404).json({ message: 'Employee not found' });

    return res.json({ employee: normalizeEmployee(updated) });
  } catch (err) {
    logger.error('updateMyProfile error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getMyProfile,
  updateMyProfile,
};