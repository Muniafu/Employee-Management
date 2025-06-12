const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/token');

// Register User
const register = async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      username, 
      email, 
      password: hashed,
      status: 'pending' // Explicitly set status
    });

    res.status(201).json({ 
      message: 'User created, awaiting approval',
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login User
const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status !== 'approved') {
      return res.status(403).json({ 
        message: `Account ${user.status}`,
        status: user.status
      });
    }

    res.json({
      token: generateToken(user._id),
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Get all users (admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// Approve user (admin only)
const approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: `User ${user.username} approved`,
      user 
    });
  } catch (error) {
    res.status(500).json({ message: 'Approval failed', error: error.message });
  }
};

// Reject user (admin only)
const rejectUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: `User ${user.username} rejected`,
      user 
    });
  } catch (error) {
    res.status(500).json({ message: 'Rejection failed', error: error.message });
  }
};

module.exports = { 
  register, 
  login, 
  getUsers, 
  approveUser, 
  rejectUser 
};