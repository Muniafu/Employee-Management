const mongoose = require('mongoose');

const PerformanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Performance must belong to an employee']
  },
  metrics: [{
    name: {
      type: String,
      required: [true, 'Please provide metric name'],
      trim: true
    },
    value: {
      type: Number,
      required: [true, 'Please provide metric value'],
      min: [0, 'Metric value cannot be negative'],
      max: [100, 'Metric value cannot exceed 100']
    },
    target: {
      type: Number,
      min: [0, 'Target value cannot be negative'],
      max: [100, 'Target value cannot exceed 100']
    }
  }],
  overallScore: {
    type: Number,
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  },
  reviewPeriod: {
    type: String,
    enum: ['quarterly', 'biannual', 'annual'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  notes: String
});

// Indexes
PerformanceSchema.index({ employee: 1 });
PerformanceSchema.index({ date: -1 });
PerformanceSchema.index({ overallScore: 1 });
PerformanceSchema.index({ employee: 1, reviewPeriod: 1 }, { unique: true });

// Calculate overall score before saving
PerformanceSchema.pre('save', function(next) {
  if (this.metrics && this.metrics.length > 0) {
    const sum = this.metrics.reduce((acc, metric) => acc + metric.value, 0);
    this.overallScore = sum / this.metrics.length;
  }
  next();
});

module.exports = mongoose.model('Performance', PerformanceSchema);