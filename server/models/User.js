import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../config/constants.js';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.EMPLOYEE
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'User must belong to a department']
    },
    position: {
      type: String,
      required: [true, 'Please specify position'],
      trim: true
    },
    hireDate: {
      type: Date,
      default: Date.now
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
    },
    profileImage: String,
    skills: [{
      name: String,
      level: {
        type: Number,
        min: 1,
        max: 5
      }
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const newUser = await User.create({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
    role: 'employee',
    department: '60d21b4667d0d8992e610c85',
    position: 'Software Developer'
});

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ department: 1 });
UserSchema.index({ role: 1 });

// Password hashing middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Track password change timestamp
UserSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; // Ensure token is created after
  next();
});

// Query middleware to filter out inactive users
UserSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

// Instance method for password verification
UserSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method for changed password check
UserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Virtual for performance reviews
UserSchema.virtual('performanceReviews', {
  ref: 'Performance',
  foreignField: 'employee',
  localField: '_id'
});

// Virtual for full profile URL
UserSchema.virtual('profileImageUrl').get(function() {
  return this.profileImage
    ? `${process.env.FILE_STORAGE_URL}/users/${this.profileImage}`
    : null;
});

const User = mongoose.model('User', UserSchema);

export default User;