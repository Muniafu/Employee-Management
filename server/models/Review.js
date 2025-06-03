import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewPeriod: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
        validate: {
          validator: function (endDate) {
            return endDate > this.reviewPeriod.startDate;
          },
          message: 'End date must be after start date',
        },
      },
    },
    performanceRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    strengths: {
      type: [String],
      validate: {
        validator: function (strengths) {
          return strengths.length <= 10;
        },
        message: 'Cannot have more than 10 strengths',
      },
    },
    areasForImprovement: {
      type: [String],
      validate: {
        validator: function (areas) {
          return areas.length <= 10;
        },
        message: 'Cannot have more than 10 improvement areas',
      },
    },
    feedback: {
      type: String,
      maxlength: [2000, 'Feedback cannot exceed 2000 characters'],
    },
    isFinalized: {
      type: Boolean,
      default: false,
    },
    finalizedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
reviewSchema.index({ employee: 1, 'reviewPeriod.endDate': -1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ isFinalized: 1 });

// Auto-set finalizedAt when review is finalized
reviewSchema.pre('save', function (next) {
  if (this.isModified('isFinalized') && this.isFinalized && !this.finalizedAt) {
    this.finalizedAt = new Date();
  }
  next();
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;