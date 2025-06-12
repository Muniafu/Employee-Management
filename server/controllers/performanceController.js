const PerformanceMetric = require('../models/PerformanceMetric');
const Goal = require('../models/Goal');
const FeedbackReview = require('../models/FeedbackReview');

// Generic CRUD Handler
const createItem = (Model) => async (req, res) => {
  const item = await Model.create({ ...req.body, user_id: req.user._id });
  res.status(201).json(item);
};

const getItems = (Model) => async (req, res) => {
  const items = await Model.find({ user_id: req.user._id });
  res.json(items);
};

const updateItem = (Model) => async (req, res) => {
  const item = await Model.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user._id },
    req.body,
    { new: true }
  );
  res.json(item);
};

const deleteItem = (Model) => async (req, res) => {
  await Model.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
  res.json({ message: 'Deleted successfully' });
};

module.exports = {
  createMetric: createItem(PerformanceMetric),
  getMetrics: getItems(PerformanceMetric),
  updateMetric: updateItem(PerformanceMetric),
  deleteMetric: deleteItem(PerformanceMetric),

  createGoal: createItem(Goal),
  getGoals: getItems(Goal),
  updateGoal: updateItem(Goal),
  deleteGoal: deleteItem(Goal),

  createFeedback: createItem(FeedbackReview),
  getFeedbacks: getItems(FeedbackReview),
  updateFeedback: updateItem(FeedbackReview),
  deleteFeedback: deleteItem(FeedbackReview),
};