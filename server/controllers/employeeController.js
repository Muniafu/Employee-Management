const Employee = require('../models/Employee');
const User = require('../models/User');
const logger = require('../config/logger');

// Normalize employee object for client
function normalizeEmployee(empDoc) {
  if (!empDoc) return null;
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

// Admin creates employee
async function createEmployee(req, res) {
  try {
    const { firstName, lastName, email, username, password, role, department, position, salary } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'firstName and lastName are required' });
    }

    let user = null;

    if (username || email || password) {
      if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'username, email and password are required to create a login account' });
      }

      const exists = await User.findOne({ $or: [{ email }, { username }] });
      if (exists) {
        return res.status(409).json({ success: false, message: 'Email or username already exists' });
      }

      user = new User({ username, email, password, role: role || 'Employee' });
      await user.save();
    }

    const emp = new Employee({
      firstName,
      lastName,
      department: department || null,
      position: position || null,
      salary: salary || null,
      user: user ? user._id : null,
    });

    await emp.save();

    if (user) {
      user.employee = emp._id;
      await user.save();
    }

    const populated = await Employee.findById(emp._id)
      .populate('department')
      .populate('user', 'email username role');

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: normalizeEmployee(populated),
    });
  } catch (err) {
    if (err && err.code === 11000) {
      logger.error('createEmployee duplicate key', err);
      return res.status(409).json({ success: false, message: 'Duplicate key error', error: err.message });
    }

    logger.error('createEmployee error', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}

async function listEmployees(req, res) {
  try {
    const employees = await Employee.find()
      .populate('department')
      .populate('user', 'email username role')
      .sort({ createdAt: -1 });

    const result = employees.map(normalizeEmployee);
    return res.json({ success: true, message: 'Employees retrieved successfully', data: result });
  } catch (err) {
    logger.error('listEmployees error', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}

async function getEmployeeById(req, res) {
  try {
    const { id } = req.params;
    const emp = await Employee.findById(id)
      .populate('department')
      .populate('user', 'email username role');

    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });

    return res.json({ success: true, message: 'Employee retrieved successfully', data: normalizeEmployee(emp) });
  } catch (err) {
    logger.error('getEmployeeById error', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}

async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const emp = await Employee.findByIdAndUpdate(id, updates, { new: true })
      .populate('department')
      .populate('user', 'email username role');

    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });

    return res.json({ success: true, message: 'Employee updated successfully', data: normalizeEmployee(emp) });
  } catch (err) {
    logger.error('updateEmployee error', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}

async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;
    const emp = await Employee.findByIdAndDelete(id);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });

    if (emp.user) await User.findOneAndDelete({ _id: emp.user });

    return res.json({ success: true, message: 'Employee and linked User deleted', data: null });
  } catch (err) {
    logger.error('deleteEmployee error', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}

async function getMyProfile(req, res) {
  try {
    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findById(userId).select('employee role');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'Admin') return res.status(403).json({ success: false, message: 'Admins do not have an employee profile' });

    if (!user.employee) return res.status(404).json({ success: false, message: 'No employee profile linked' });

    const employee = await Employee.findById(user.employee)
      .populate('department')
      .populate('user', 'email username role');

    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    return res.json({ success: true, message: 'Profile retrieved successfully', data: normalizeEmployee(employee) });
  } catch (err) {
    logger.error('getMyProfile error', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}

async function updateMyProfile(req, res) {
  try {
    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findById(userId).select('employee role');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'Admin') return res.status(403).json({ success: false, message: 'Admins cannot update employee profiles here' });

    if (!user.employee) return res.status(404).json({ success: false, message: 'No employee profile linked' });

    const updates = req.body || {};
    const allowed = ['firstName', 'lastName', 'department', 'position', 'salary', 'phone', 'address'];
    const payload = {};
    allowed.forEach((k) => { if (typeof updates[k] !== 'undefined') payload[k] = updates[k]; });

    const updated = await Employee.findByIdAndUpdate(user.employee, payload, { new: true })
      .populate('department')
      .populate('user', 'email username role');

    if (!updated) return res.status(404).json({ success: false, message: 'Employee not found' });

    return res.json({ success: true, message: 'Profile updated successfully', data: normalizeEmployee(updated) });
  } catch (err) {
    logger.error('updateMyProfile error', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
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