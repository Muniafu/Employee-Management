import mongoose from 'mongoose';
import { PERFORMANCE_RATINGS } from '../config/constants.js';

const PerformanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to an employee']
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must have a reviewer']
    },
    reviewPeriod: {
      start: {
        type: Date,
        required: [true, 'Please specify review period start']
      },
      end: {
        type: Date,
        required: [true, 'Please specify review period end'],
        validate: {
          validator: function(endDate) {
            return endDate > this.reviewPeriod.start;
          },
          message: 'End date must be after start date'
        }
      }
    },
    overallRating: {
      type: Number,
      enum: Object.values(PERFORMANCE_RATINGS),
      default: 3,
      required: [true, 'Please provide overall rating']
    },
    keyAreas: [
      {
        name: {
          type: String,
          comments: String,
          required: [true, 'Please specify key area name']
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: [true, 'Please provide rating']
        },
        comments: String
      }
    ],
    strengths: {
      type: [String],
      validate: {
        validator: function(strengths) {
          return strengths.length <= 5;
        },
        message: 'Maximum 5 strengths allowed'
      }
    },
    developmentAreas: {
      type: [String],
      validate: {
        validator: function(areas) {
          return areas.length <= 5;
        },
        message: 'Maximum 5 development areas allowed'
      }
    },
    goals: [
      {
        description: {
          type: String,
          required: [true, 'Goal description required']
        },
        targetDate: Date,
        status: {
          type: String,
          enum: ['Not Started', 'In Progress', 'Completed', 'Abandoned'],
          default: 'Not Started'
        }
      }
    ],
    feedback: {
      type: String,
      maxlength: [1000, 'Feedback cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
      default: 'Draft'
    },
    isCalibrated: {
      type: Boolean,
      default: false
    },
    calibrationNotes: String
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const review = await Performance.create({
    employee: '60d21b4667d0d8992e610c85',
    reviewer: '60d21b4667d0d8992e610c86',
    reviewPeriod: {
      start: new Date('2023-01-01'),
      end: new Date('2023-06-30')
    },
    overallRating: 4,
    keyAreas: [{
      name: 'Code Quality',
      rating: 5,
      comments: 'Excellent work'
    }],
    status: 'Submitted'
});

const KeyAreaSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxlength: 100,
        required: [true, 'Key area name is required']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Rating is required']
    },
    comments: String
    }, { _id: false });

// Indexes
PerformanceSchema.index({ employee: 1 });
PerformanceSchema.index({ reviewer: 1 });
PerformanceSchema.index({ status: 1 });
PerformanceSchema.index({ 'reviewPeriod.end': 1 });
PerformanceSchema.index({ overallRating: 1 });

// Document middleware to validate reviewer != employee
PerformanceSchema.pre('save', function(next) {
  if (this.employee.equals(this.reviewer) && this.type !== 'SELF') {
    throw new Error('Reviewer cannot be the same as employee');
  }
  next();
});

// Query middleware to populate references
PerformanceSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'employee',
    select: 'name email department position'
  }).populate({
    path: 'reviewer',
    select: 'name email role'
  });
  next();
});

// Instance method to calculate average key area rating
PerformanceSchema.methods.calculateAverageRating = function() {
  if (this.keyAreas && this.keyAreas.length > 0) {
    const sum = this.keyAreas.reduce((acc, area) => acc + area.rating, 0);
    return sum / this.keyAreas.length;
  }
  return null;
};

// Virtual for formatted review period
PerformanceSchema.virtual('reviewPeriodFormatted').get(function() {
  return `${this.reviewPeriod.start.toLocaleDateString()} - ${this.reviewPeriod.end.toLocaleDateString()}`;
});

const Performance = mongoose.model('Performance', PerformanceSchema);

export default Performance;