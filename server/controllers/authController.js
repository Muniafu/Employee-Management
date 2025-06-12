const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/token');

// Register User
const register = async (req, res) => {
  const { username, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hashed });

  res.status(201).json({ message: 'User created, awaiting approval' });
};

// Login User
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.status !== 'approved') {
    return res.status(403).json({ message: 'Account not approved' });
  }

  res.json({
    token: generateToken(user._id),
    user: { id: user._id, username: user.username, role: user.role },
  });
};

// Admin Approval
const approveUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
  res.json({ message: `User ${user.username} approved` });
};

const rejectUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
  res.json({ message: `User ${user.username} rejected` });
};

module.exports = { register, login, approveUser, rejectUser };
