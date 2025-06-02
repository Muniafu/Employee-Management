const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Reviewer reference is required'],
      index: true
    },
    period: {
      type: String,
      required: [true, 'Review period is required'],
      match: [/^(Q[1-4]|Annual)-\d{4}$/, 'Period format should be QX-YYYY or Annual-YYYY']
    },
    reviewDate: {
      type: Date,
      required: [true, 'Review date is required'],
      default: Date.now
    },
    ratings: {
      performance: {
        type: Number,
        min: [1, 'Performance rating cannot be less than 1'],
        max: [5, 'Performance rating cannot exceed 5'],
        required: [true, 'Performance rating is required']
      },
      teamwork: {
        type: Number,
        min: [1, 'Teamwork rating cannot be less than 1'],
        max: [5, 'Teamwork rating cannot exceed 5'],
        default: null
      },
      communication: {
        type: Number,
        min: [1, 'Communication rating cannot be less than 1'],
        max: [5, 'Communication rating cannot exceed 5'],
        default: null
      },
      problemSolving: {
        type: Number,
        min: [1, 'Problem-solving rating cannot be less than 1'],
        max: [5, 'Problem-solving rating cannot exceed 5'],
        default: null
      }
    },
    feedback: {
      summary: {
        type: String,
        required: [true, 'Summary feedback is required'],
        minlength: [20, 'Summary must be at least 20 characters']
      },
      strengths: {
        type: String,
        required: [true, 'Strengths feedback is required']
      },
      areasForImprovement: {
        type: String,
        required: [true, 'Improvement areas are required']
      }
    },
    goalsAchieved: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      validate: {
        validator: goals => goals.length <= 10,
        message: 'Cannot reference more than 10 goals'
      }
    }],
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'archived'],
      default: 'draft',
      index: true
    },
    discussion: [{
      participant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      comment: {
        type: String,
        required: true,
        minlength: [5, 'Comment must be at least 5 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    isActive: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        delete ret.isActive;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// 📊 Virtual for overall rating (weighted average)
reviewSchema.virtual('overallRating').get(function() {
  const weights = {
    performance: 0.4,
    teamwork: 0.2,
    communication: 0.2,
    problemSolving: 0.2
  };
  
  let total = 0;
  let weightSum = 0;
  
  for (const [category, weight] of Object.entries(weights)) {
    if (this.ratings[category]) {
      total += this.ratings[category] * weight;
      weightSum += weight;
    }
  }
  
  return weightSum > 0 ? (total / weightSum).toFixed(2) : 0;
});

// ⏱️ Virtual for review age (in days)
reviewSchema.virtual('reviewAgeDays').get(function() {
  const diffTime = Date.now() - this.reviewDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// 🔍 Indexes for optimized queries
reviewSchema.index({ employee: 1, status: 1 });
reviewSchema.index({ reviewer: 1, period: 1 });
reviewSchema.index({ period: 1, status: 1 });
reviewSchema.index({ 'ratings.performance': 1 });
reviewSchema.index({ reviewDate: -1 });

// 🔄 Update employee's performance score when review is approved
reviewSchema.pre('save', async function(next) {
  if (this.isModified('status') && this.status === 'approved') {
    try {
      const Employee = mongoose.model('Employee');
      await Employee.findByIdAndUpdate(this.employee, {
        $set: { performanceScore: this.overallRating }
      });
    } catch (err) {
      next(err);
    }
  }
  next();
});

// 🚫 Prevent deletion of approved reviews
reviewSchema.pre('deleteOne', { document: true }, function(next) {
  if (this.status === 'approved') {
    return next(new Error('Approved reviews cannot be deleted'));
  }
  next();
});

// 🔄 Cascade goal completion status
reviewSchema.post('save', async function(doc) {
  if (doc.status === 'approved' && doc.goalsAchieved.length > 0) {
    const Goal = mongoose.model('Goal');
    await Goal.updateMany(
      { _id: { $in: doc.goalsAchieved } },
      { $set: { status: 'completed', completionDate: doc.reviewDate } }
    );
  }
});

// 📈 Update employee performance on review approval
reviewSchema.post('findOneAndUpdate', async function(doc) {
  if (doc && doc.status === 'approved') {
    const Review = mongoose.model('Review');
    const overallRating = await Review.calculateAverageRating(doc.employee);
    
    await mongoose.model('Employee').findByIdAndUpdate(doc.employee, {
      performanceScore: overallRating
    });
  }
});

// 📊 Calculate average rating for an employee
reviewSchema.statics.calculateAverageRating = async function(employeeId) {
  const result = await this.aggregate([
    {
      $match: {
        employee: employeeId,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$employee',
        avgRating: { $avg: '$ratings.performance' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].avgRating.toFixed(2) : 0;
};

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;