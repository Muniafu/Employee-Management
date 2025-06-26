require('dotenv').config();
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const { encryptData, decryptData } = require('./hashingController');

// User-related functions only
const getUserById = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.params.uid).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    if (user.encryptedData) {
      const decrypted = await decryptData(user.encryptedData);
      user.sensitiveData = decrypted;
    }
    
    res.status(200).json({ 
      success: true, 
      user 
    });
  } catch (error) {
    next(error);
  }
};

const createFirstAdmin = async (req, res, next) => {
  try {
    // Check if any super user exists
    const adminExists = await userModel.findOne({ isSuperUser: true });
    if (adminExists) {
      return res.status(403).json({ 
        success: false, 
        message: 'Initial admin already exists' 
      });
    }

    // Create the admin with proper password hashing
    const admin = new userModel({
      ...req.body,
      position: 'admin',
      isSuperUser: true,
      password: req.body.password, // Let the pre-save hook handle hashing
  });

  // This will trigger the pre-save hook to hash the password
  await admin.save();

    res.status(201).json({ 
      success: true,
      message: 'Initial admin created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const newUser = async (req, res, next) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, name, position, dateOfBirth, phone } = req.body;

    // Check for existing user
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Create new user - ensure password is hashed
    const user = new userModel({
      email,
      password, // Let the pre-save hook handle hashing
      name,
      position,
      dateOfBirth: new Date(dateOfBirth),
      phone,
      isSuperUser: false, // Default to false for regular users
      image: req.file?.path || 'uploads/images/user-default.jpg'
    });

    await user.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Registration successful' 
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Ensure password exists and is hashed
    if (!user.password) {
      throw new Error('Password not properly set for the user');
    }

    // Use the comparePassword method from the model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      success: true,
      message: 'Login successful',
      token,
      userId: user._id,
      userName: user.name,
    });
  } catch (error) {
    next(error);
  }
};

const displayUser = async (req, res, next) => {
  try {
    const users = await userModel.find().select('-password -encryptedData');
    res.status(200).json({ 
      success: true, 
      users 
    });
  } catch (error) {
    next(error);
  }
};

const editEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password, ...updates } = req.body;

    if (password) {
      const encrypted = await encryptData({ password });
      updates.encryptedData = encrypted.encryptedData;
    }

    updates.image = req.file?.path || 'uploads/images/user-default.jpg';

    const user = await userModel.findByIdAndUpdate(id, updates, { 
      new: true,
      select: '-password -encryptedData'
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'User updated successfully',
      user 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  newUser,
  loginUser,
  createFirstAdmin,
  displayUser,
  editEmployee,
  getUserById
};