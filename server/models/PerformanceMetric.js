const mongoose = require('mongoose');

const performanceMetricSchema = new mongoose.Schema({
  metric_name: {
    type: String,
    required: true,
    trim: true,
  },
  metric_value: {
    type: Number,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('PerformanceMetric', performanceMetricSchema);
