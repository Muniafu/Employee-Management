require('dotenv').config();
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const { encryptData, decryptData } = require('./hashingController');

// Get a single user by ID
const getUserById = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.params.uid).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.encryptedData) {
      const decrypted = await decryptData(user.encryptedData);
      user.sensitiveData = decrypted;
    }

    res.set('Cache-Control', 'no-store, max-age=0');
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Create the first super admin
const createFirstAdmin = async (req, res, next) => {
  try {
    const adminExists = await userModel.findOne({ isSuperUser: true });
    if (adminExists) {
      return res.status(403).json({ success: false, message: 'Initial admin already exists' });
    }

    const admin = new userModel({
      ...req.body,
      position: 'admin',
      isSuperUser: true,
      password: req.body.password,
    });

    await admin.save();
    res.status(201).json({ success: true, message: 'Initial admin created successfully' });
  } catch (error) {
    next(error);
  }
};

// Register a new user
const newUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userData = {
      ...req.body,
      image: req.file?.path || 'uploads/images/user-default.jpg'
    };

    const user = new userModel(userData);
    await user.save();

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
        image: user.image
      }
    });
  } catch (error) {
    next(error);
  }
};

// User login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Display all users
const displayUser = async (req, res, next) => {
  try {
    const users = await userModel.find().select('-password -encryptedData');
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// ✅ Updated: Edit employee by ID with image upload and field updates
const editEmployee = async (req, res, next) => {
  try {
    const updates = {};

    if (req.file) {
      updates.image = req.file.path;
    }

    if (req.body.name) updates.name = req.body.name;
    if (req.body.position) updates.position = req.body.position;

    const user = await userModel.findByIdAndUpdate(
      req.params.uid,
      updates,
      {
        new: true,
        select: '-password -encryptedData'
      }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        position: user.position
      }
    });
  } catch (error) {
    next(error);
  }
};

// ✅ New: Upload avatar for current logged-in user
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const user = await userModel.findByIdAndUpdate(
      req.user.userId,
      { image: `uploads/images/${req.file.filename}` },
      { new: true, select: 'image' }
    );

    res.json({
      success: true,
      imageUrl: user.image
    });
  } catch (error) {
    next(error);
  }
};

// Stubbed but declared: getEmployees
const getEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, position } = req.query;
    
    const query = {};
    if (search) query.$or = [
      { name : { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    if (role) query.role = role;
    if (position) query.position = position;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      select: '-password -encryptedData',
      sort: { createdAt: -1 } // Sort by creation date descending
    };

    const result = await userModel.paginate(query, options);

    res.status(200).json({
      employees: result.docs,
      totalCount: result.totalDocs
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  newUser,
  loginUser,
  createFirstAdmin,
  getEmployees,
  deleteEmployee,
  displayUser,
  editEmployee,
  getUserById,
  uploadAvatar
};