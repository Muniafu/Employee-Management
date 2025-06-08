const Employee = require('../models/Employee');
const Performance = require('../models/Performance');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllEmployees = catchAsync(async (req, res, next) => {
  const { status, department, role } = req.query;
  const filter = {};
  
  if (status) filter.status = status;
  if (department) filter['personalDetails.department'] = department;
  if (role) filter.role = role;

  const employees = await Employee.find(filter)
    .select('-password -__v')
    .populate('manager', 'username email');

  res.status(200).json({
    status: 'success',
    results: employees.length,
    data: {
      employees
    }
  });
});

exports.getEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id)
    .select('-password -__v')
    .populate('manager', 'username email');

  if (!employee) {
    return next(new AppError('No employee found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      employee
    }
  });
});

exports.createEmployee = catchAsync(async (req, res, next) => {
  const { email, username, password, role, ...rest } = req.body;

  // Check if email already exists
  const existingUser = await Employee.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already in use', 400));
  }

  const newEmployee = await Employee.create({
    email,
    username,
    password,
    role: role || 'employee',
    status: 'approved',
    ...rest
  });

  // Remove password from output
  newEmployee.password = undefined;

  res.status(201).json({
    status: 'success',
    data: {
      employee: newEmployee
    }
  });
});

exports.updateEmployeeStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return next(new AppError('Invalid status value', 400));
  }

  const employee = await Employee.findByIdAndUpdate(
    id,
    { status },
    {
      new: true,
      runValidators: true
    }
  ).select('-password -__v');

  if (!employee) {
    return next(new AppError('No employee found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      employee
    }
  });
});

exports.deleteEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);

  if (!employee) {
    return next(new AppError('No employee found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getEmployeePerformance = catchAsync(async (req, res, next) => {
  const performances = await Performance.find({ employee: req.params.id })
    .sort('-date')
    .populate('reviewedBy', 'username email');

  res.status(200).json({
    status: 'success',
    results: performances.length,
    data: {
      performances
    }
  });
});

exports.updateEmployeeRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;
  const { id } = req.params;

  if (!['employee', 'manager'].includes(role)) {
    return next(new AppError('Invalid role value', 400));
  }

  const employee = await Employee.findByIdAndUpdate(
    id,
    { role },
    {
      new: true,
      runValidators: true
    }
  ).select('-password -__v');

  if (!employee) {
    return next(new AppError('No employee found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      employee
    }
  });
});

exports.updateEmployee = catchAsync(async (req, res, next) => {
  // Filter out unwanted fields that shouldn't be updated
  const filteredBody = {};
  const allowedFields = ['username', 'personalDetails', 'email'];
  
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  const updatedEmployee = await Employee.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true
    }
  ).select('-password -__v');

  if (!updatedEmployee) {
    return next(new AppError('No employee found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      employee: updatedEmployee
    }
  });
});

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const stats = {
    totalEmployees: await Employee.countDocuments(),
    activeEmployees: await Employee.countDocuments({ status: 'approved' }),
    pendingApprovals: await Employee.countDocuments({ status: 'pending' }),
    managers: await Employee.countDocuments({ role: 'manager' }),
    recentHires: await Employee.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email createdAt')
  };

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});