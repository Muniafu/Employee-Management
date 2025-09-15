const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    read: { type: Boolean, default: false },
    type: { type: String, enum: ['attendance', 'leave', 'payroll', 'general'], default: 'general' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);