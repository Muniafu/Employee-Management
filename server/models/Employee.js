import mongoose from 'mongoose';
import validator from 'validator';

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (dob) {
          return dob < new Date();
        },
        message: 'Date of birth must be in the past',
      },
    },
    department: {
      type: String,
      required: true,
      enum: [
        'Engineering',
        'HR',
        'Marketing',
        'Sales',
        'Finance',
        'Operations',
      ],
    },
    position: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Position cannot exceed 100 characters'],
    },
    hireDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    skills: {
      type: [String],
      validate: {
        validator: function (skills) {
          return skills.length <= 10;
        },
        message: 'Cannot have more than 10 skills',
      },
    },
    contactNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return validator.isMobilePhone(v, 'any', { strictMode: false });
        },
        message: 'Please provide a valid phone number',
      },
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    status: {
      type: String,
      enum: ['active', 'on-leave', 'terminated', 'retired'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Indexes for performance
employeeSchema.index({ department: 1 });
employeeSchema.index({ position: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ user: 1 }, { unique: true });

// Cascade delete reviews and goals when employee is deleted
employeeSchema.pre('remove', async function (next) {
  await this.model('Review').deleteMany({ employee: this._id });
  await this.model('Goal').deleteMany({ employee: this._id });
  next();
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;