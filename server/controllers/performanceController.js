const PerformanceMetric = require('../models/PerformanceMetric');
const Goal = require('../models/Goal');
const FeedbackReview = require('../models/FeedbackReview');
const User = require('../models/User');

// Generic CRUD Handler Factory
const createItem = (Model) => async (req, res) => {
  try {
    const item = await Model.create({ ...req.body, user_id: req.user._id });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Creation failed', error: error.message });
  }
};

const getItems = (Model) => async (req, res) => {
  try {
    const items = await Model.find({ user_id: req.user._id });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Fetch failed', error: error.message });
  }
};

const updateItem = (Model) => async (req, res) => {
  try {
    const item = await Model.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: 'Update failed', error: error.message });
  }
};

const deleteItem = (Model) => async (req, res) => {
  try {
    const item = await Model.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed', error: error.message });
  }
};

// Admin-specific Performance Controller
const getAdminOverview = async (req, res) => {
  try {
    const metrics = await PerformanceMetric.aggregate([
      { $group: { _id: '$metric_name', avgValue: { $avg: '$metric_value' } } },
    ]);

    const totalUsers = await User.countDocuments({ role: 'user' });
    const approvedUsers = await User.countDocuments({ status: 'approved' });
    const pendingUsers = await User.countDocuments({ status: 'pending' });

    res.json({ 
      metrics, 
      userStats: { totalUsers, approvedUsers, pendingUsers } 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch admin overview', 
      error: error.message 
    });
  }
};

module.exports = {
  // Metric CRUD
  createMetric: createItem(PerformanceMetric),
  getMetrics: getItems(PerformanceMetric),
  updateMetric: updateItem(PerformanceMetric),
  deleteMetric: deleteItem(PerformanceMetric),

  // Goal CRUD
  createGoal: createItem(Goal),
  getGoals: getItems(Goal),
  updateGoal: updateItem(Goal),
  deleteGoal: deleteItem(Goal),

  // Feedback CRUD
  createFeedback: createItem(FeedbackReview),
  getFeedbacks: getItems(FeedbackReview),
  updateFeedback: updateItem(FeedbackReview),
  deleteFeedback: deleteItem(FeedbackReview),

  // Admin Dashboard
  getAdminOverview
};