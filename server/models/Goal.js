import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    targetDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (date) {
          return date > Date.now();
        },
        message: 'Target date must be in the future',
      },
    },
    completionDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'cancelled'],
      default: 'not-started',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    keyResults: [
      {
        description: String,
        completed: Boolean,
      },
    ],
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
goalSchema.index({ employee: 1, status: 1 });
goalSchema.index({ targetDate: 1 });
goalSchema.index({ status: 1 });

// Virtual for isOverdue
goalSchema.virtual('isOverdue').get(function () {
  return this.status !== 'completed' && this.targetDate < new Date();
});

// Auto-update status based on progress
goalSchema.pre('save', function (next) {
  if (this.isModified('progress')) {
    if (this.progress === 100) {
      this.status = 'completed';
      this.completionDate = new Date();
    } else if (this.progress > 0) {
      this.status = 'in-progress';
    }
  }
  next();
});

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;