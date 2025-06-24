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

const newUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const { email, password, ...rest } = req.body;
    
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    const encrypted = await encryptData({ password });
    const user = new userModel({
      email,
      encryptedData: encrypted.encryptedData,
      ...rest,
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const decrypted = await decryptData(user.encryptedData);
    if (decrypted.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

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
      email: user.email
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
  displayUser,
  editEmployee,
  getUserById
};