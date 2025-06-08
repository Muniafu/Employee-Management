const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Goal must belong to an employee']
  },
  title: {
    type: String,
    required: [true, 'Please provide goal title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  targetDate: {
    type: Date,
    required: [true, 'Please provide target date']
  },
  completionDate: Date,
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'cancelled'],
    default: 'not-started'
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100'],
    default: 0
  },
  keyResults: [{
    description: String,
    completed: Boolean
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
GoalSchema.index({ employee: 1 });
GoalSchema.index({ status: 1 });
GoalSchema.index({ targetDate: 1 });
GoalSchema.index({ employee: 1, status: 1 });

// Validate target date is in the future when creating
GoalSchema.pre('save', function(next) {
  if (this.isNew && this.targetDate < new Date()) {
    throw new Error('Target date must be in the future');
  }
  next();
});

module.exports = mongoose.model('Goal', GoalSchema);