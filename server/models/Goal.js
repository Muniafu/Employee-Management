const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      minlength: [5, 'Goal title must be at least 5 characters'],
      maxlength: [100, 'Goal title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    targetDate: {
      type: Date,
      required: [true, 'Target date is required'],
      validate: {
        validator: function(date) {
          return date > Date.now();
        },
        message: 'Target date must be in the future'
      }
    },
    progress: {
      type: Number,
      min: [0, 'Progress cannot be negative'],
      max: [100, 'Progress cannot exceed 100%'],
      default: 0,
      set: function(value) {
        // Automatically round to nearest 5%
        return Math.round(value / 5) * 5;
      }
    },
    status: {
      type: String,
      enum: {
        values: ['not-started', 'in-progress', 'completed', 'archived'],
        message: 'Invalid status value'
      },
      default: 'not-started'
    },
    keyResults: [{
      description: {
        type: String,
        required: [true, 'Key result description is required'],
        minlength: [5, 'Key result must be at least 5 characters']
      },
      completed: {
        type: Boolean,
        default: false
      },
      weight: {
        type: Number,
        min: [1, 'Weight must be at least 1'],
        max: [10, 'Weight cannot exceed 10'],
        default: 5
      }
    }],
    linkedReviews: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      validate: {
        validator: reviews => reviews.length <= 5,
        message: 'Cannot link to more than 5 reviews'
      }
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Creator reference is required'],
      index: true
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// ⏳ Virtual for days remaining
goalSchema.virtual('daysRemaining').get(function() {
  const diffDays = Math.ceil((this.targetDate - Date.now()) / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 0);
});

// 📊 Virtual for weighted progress
goalSchema.virtual('weightedProgress').get(function() {
  if (this.keyResults.length === 0) return this.progress;
  
  const totalWeight = this.keyResults.reduce((sum, kr) => sum + kr.weight, 0);
  const completedValue = this.keyResults.reduce(
    (sum, kr) => sum + (kr.completed ? kr.weight : 0), 0
  );
  
  return Math.round((completedValue / totalWeight) * 100);
});

// 🔄 Auto-update status based on progress
goalSchema.pre('save', function(next) {
  // Auto-calculate progress if keyResults exist
  if (this.keyResults.length > 0) {
    this.progress = this.weightedProgress;
  }
  
  // Update status based on progress
  if (this.progress >= 100) {
    this.status = 'completed';
  } else if (this.progress > 0) {
    this.status = 'in-progress';
  } else {
    this.status = 'not-started';
  }
  
  next();
});

// 📝 Update lastUpdatedBy before saving
goalSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastUpdatedBy = this._update.$set?.lastUpdatedBy || this.constructor.schema.path('lastUpdatedBy').defaultValue;
  }
  next();
});

// 🔍 Indexes for optimized queries
goalSchema.index({ title: 'text' });
goalSchema.index({ status: 1 });
goalSchema.index({ targetDate: 1 });
goalSchema.index({ progress: 1 });
goalSchema.index({ employee: 1, status: 1 });
goalSchema.index({ createdBy: 1 });

// 🔄 Cascade to reviews when goal is deleted
goalSchema.pre('deleteOne', { document: true }, async function(next) {
  try {
    // Remove goal from linked reviews
    await mongoose.model('Review').updateMany(
      { _id: { $in: this.linkedReviews } },
      { $pull: { goalsAchieved: this._id } }
    );
    next();
  } catch (err) {
    next(err);
  }
});

// ⚠️ Prevent modification of completed goals
goalSchema.pre('save', function(next) {
  if (this.isModified() && this.status === 'completed') {
    const allowedFields = ['status', 'lastUpdatedBy'];
    const modifiedFields = Object.keys(this.modifiedPaths());
    
    if (modifiedFields.some(field => !allowedFields.includes(field))) {
      return next(new Error('Completed goals cannot be modified'));
    }
  }
  next();
});

// 📈 Progress update validation
goalSchema.path('progress').validate(function(progress) {
  if (this.status === 'completed' && progress < 100) {
    this.invalidate('progress', 'Completed goals must have 100% progress');
  }
  return true;
});

const Goal = mongoose.model('Goal', goalSchema);
module.exports = Goal;