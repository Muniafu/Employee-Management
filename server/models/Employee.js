const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
      unique: true
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters']
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: {
        values: ['Engineering', 'HR', 'Marketing', 'Sales', 'Operations', 'Finance', 'Support'],
        message: 'Invalid department value'
      }
    },
    hireDate: {
      type: Date,
      required: [true, 'Hire date is required'],
      default: Date.now
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      index: true
    },
    directReports: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }],
    skills: {
      type: [String],
      validate: {
        validator: skills => skills.length <= 20,
        message: 'Cannot have more than 20 skills'
      }
    },
    status: {
      type: String,
      enum: ['active', 'on-leave', 'terminated', 'probation'],
      default: 'active'
    },
    contact: {
      phone: {
        type: String,
        trim: true,
        match: [/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Invalid phone number format']
      },
      secondaryEmail: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
      }
    },
    profileImage: {
      type: String,
      default: 'default-avatar.jpg'
    },
    performanceScore: {
      type: Number,
      min: [0, 'Performance score cannot be negative'],
      max: [5, 'Performance score cannot exceed 5'],
      default: 3
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        delete ret.directReports;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// 🪪 Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// 📅 Virtual for tenure (in years)
employeeSchema.virtual('tenureYears').get(function() {
  const msPerYear = 1000 * 60 * 60 * 24 * 365;
  return ((Date.now() - this.hireDate) / msPerYear).toFixed(1);
});

// 🔍 Text search index
employeeSchema.index({
  firstName: 'text',
  lastName: 'text',
  position: 'text',
  department: 'text'
});

// 📊 Performance index
employeeSchema.index({ performanceScore: 1 });

// 🗑️ Cascade delete middleware
employeeSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // Remove user reference
    await mongoose.model('User').deleteOne({ _id: this.user });
    
    // Remove from manager's direct reports
    await mongoose.model('Employee').updateMany(
      { manager: this._id },
      { $unset: { manager: 1 } }
    );
    
    // Remove from direct reports
    await mongoose.model('Employee').updateMany(
      { _id: { $in: this.directReports } },
      { $unset: { manager: 1 } }
    );
    
    next();
  } catch (err) {
    next(err);
  }
});

// 🔄 Update directReports when manager changes
employeeSchema.pre('save', async function(next) {
  if (this.isModified('manager')) {
    const previousManager = this.constructor.hydrate(this._original).manager;
    
    // Remove from previous manager's directReports
    if (previousManager) {
      await mongoose.model('Employee').updateOne(
        { _id: previousManager },
        { $pull: { directReports: this._id } }
      );
    }
    
    // Add to new manager's directReports
    if (this.manager) {
      await mongoose.model('Employee').updateOne(
        { _id: this.manager },
        { $addToSet: { directReports: this._id } }
      );
    }
  }
  next();
});

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;