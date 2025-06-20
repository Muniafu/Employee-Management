const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  goal_name: {
    type: String,
    required: true,
    trim: true,
  },
  goal_description: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
