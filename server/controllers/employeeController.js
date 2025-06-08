const Performance = require('../models/Performance');
const Goal = require('../models/Goal');
const Feedback = require('../models/Feedback');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getPerformanceMetrics = catchAsync(async (req, res, next) => {
  const performances = await Performance.find({ employee: req.user.id })
    .sort('-date')
    .populate('reviewedBy', 'username');

  res.status(200).json({
    status: 'success',
    results: performances.length,
    data: {
      performances
    }
  });
});

exports.setGoals = catchAsync(async (req, res, next) => {
  const { title, description, targetDate, keyResults } = req.body;

  const newGoal = await Goal.create({
    employee: req.user.id,
    title,
    description,
    targetDate,
    keyResults: keyResults || [],
    createdBy: req.user.id
  });

  res.status(201).json({
    status: 'success',
    data: {
      goal: newGoal
    }
  });
});

exports.getGoals = catchAsync(async (req, res, next) => {
  const { status } = req.query;
  const filter = { employee: req.user.id };
  
  if (status) filter.status = status;

  const goals = await Goal.find(filter).sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: goals.length,
    data: {
      goals
    }
  });
});

exports.updateGoalProgress = catchAsync(async (req, res, next) => {
  const { progress, status } = req.body;

  const goal = await Goal.findOneAndUpdate(
    { _id: req.params.id, employee: req.user.id },
    { progress, status },
    { new: true, runValidators: true }
  );

  if (!goal) {
    return next(new AppError('No goal found with that ID or you are not authorized', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      goal
    }
  });
});

exports.submitFeedback = catchAsync(async (req, res, next) => {
  const { toEmployee, content, type, isAnonymous } = req.body;

  // Check if recipient exists
  const recipient = await Employee.findById(toEmployee);
  if (!recipient) {
    return next(new AppError('No employee found with that ID', 404));
  }

  const feedback = await Feedback.create({
    fromEmployee: isAnonymous ? null : req.user.id,
    toEmployee,
    content,
    type,
    isAnonymous,
    status: 'sent'
  });

  res.status(201).json({
    status: 'success',
    data: {
      feedback
    }
  });
});

exports.getFeedback = catchAsync(async (req, res, next) => {
  const { type } = req.query;
  const filter = { $or: [{ toEmployee: req.user.id }, { fromEmployee: req.user.id }] };
  
  if (type) filter.type = type;

  const feedback = await Feedback.find(filter)
    .populate('fromEmployee', 'username email')
    .populate('toEmployee', 'username email')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: feedback.length,
    data: {
      feedback
    }
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  // Filter out unwanted fields that shouldn't be updated
  const filteredBody = {};
  const allowedFields = ['username', 'personalDetails'];
  
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  const updatedEmployee = await Employee.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true
    }
  ).select('-password -__v');

  res.status(200).json({
    status: 'success',
    data: {
      employee: updatedEmployee
    }
  });
});