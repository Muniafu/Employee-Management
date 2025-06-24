const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { encrypt } = require("../controllers/hashingController");

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6,
    select: false
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  position: { 
    type: String, 
    required: true,
    enum: ['developer', 'designer', 'manager', 'hr', 'admin'],
    trim: true
  },
  joiningDate: { 
    type: Date, 
    required: true,
    default: Date.now
  },
  dateOfBirth: { 
    type: Date, 
    required: true 
  },
  phone: { 
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10,15}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  isSuperUser: { 
    type: Boolean, 
    default: false 
  },
  image: { 
    type: String,
    default: 'uploads/images/user-default.jpg'
  },
  githubId: { 
    type: String,
    trim: true
  },
  linkedInId: { 
    type: String,
    trim: true
  },
  encryptedData: {
    type: String,
    select: false
  },
  leaveDates: [{
    startDate: { 
      type: Date,
      required: true 
    },
    endDate: { 
      type: Date,
      required: true,
      validate: {
        validator: function(v) {
          return v > this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    status: { 
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    days: { 
      type: Number,
      min: 0.5, // Allows half-day leaves
      max: 90,   // Maximum 90 days per leave request
      required: true 
    },
    reason: {
      type: String,
      trim: true,
      minlength: 10,
      maxlength: 500
    },
    processedAt: {
      type: Date
    }
  }]
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Virtual for formatted joining date
userSchema.virtual('formattedJoiningDate').get(function() {
  return this.joiningDate.toISOString().split('T')[0];
});

// Virtual for age calculation
userSchema.virtual('age').get(function() {
  const diff = Date.now() - this.dateOfBirth.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Encrypt sensitive data before save
userSchema.pre('save', async function(next) {
  if (this.isModified('phone') || this.isModified('dateOfBirth') || this.isNew) {
    try {
      const dataToEncrypt = {
        phone: this.phone,
        dateOfBirth: this.dateOfBirth
      };
      this.encryptedData = await encrypt(JSON.stringify(dataToEncrypt));
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to decrypt sensitive data
userSchema.methods.getDecryptedData = async function() {
  if (!this.encryptedData) return null;
  const { decryptData } = require('../controllers/hashingController');
  return await decryptData(this.encryptedData);
};

// Indexes
userSchema.index({ isSuperUser: 1 });
userSchema.index({ 'leaveDates.status': 1 });
userSchema.index({ 'leaveDates.startDate': 1 });
userSchema.index({ 'leaveDates.endDate': 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;