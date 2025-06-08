const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  fromEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Feedback must have a sender']
  },
  toEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Feedback must have a recipient']
  },
  content: {
    type: String,
    required: [true, 'Please provide feedback content'],
    trim: true,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['praise', 'constructive', 'suggestion', 'other'],
    default: 'constructive'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'archived'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Indexes
FeedbackSchema.index({ fromEmployee: 1 });
FeedbackSchema.index({ toEmployee: 1 });
FeedbackSchema.index({ createdAt: -1 });
FeedbackSchema.index({ toEmployee: 1, type: 1 });

// Update the updatedAt field before saving
FeedbackSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Feedback', FeedbackSchema);