const Notification = require('../models/Notification');
const { sendEmail } = require('./emailService');

let ioInstance; // Socket.IO

function initNotificationService(io) {
  ioInstance = io;
}

/**
 * Central notification sender
 */
async function sendNotification({ userId, title, message, type = 'general', email }) {
  try {
    // Save in DB
    const notification = await Notification.create({
      title,
      message,
      recipient: userId,
      type,
    });

    // Real-time push
    if (ioInstance) {
      ioInstance.to(userId.toString()).emit('notification', notification);
    }

    // Email fallback
    if (email) {
      await sendEmail({
        to: email,
        subject: title,
        text: message,
      });
    }

    return notification;
  } catch (error) {
    console.error('Notification error:', error);
    throw new Error('Notification could not be sent');
  }
}

module.exports = { initNotificationService, sendNotification };