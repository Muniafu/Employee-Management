const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const EmployeeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['employee', 'manager'],
    default: 'employee'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  personalDetails: {
    firstName: String,
    lastName: String,
    position: String,
    department: String,
    hireDate: Date
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password before saving
EmployeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
EmployeeSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes
EmployeeSchema.index({ email: 1 }, { unique: true });
EmployeeSchema.index({ username: 1 }, { unique: true });
EmployeeSchema.index({ status: 1 });
EmployeeSchema.index({ 'personalDetails.department': 1 });

module.exports = mongoose.model('Employee', EmployeeSchema);