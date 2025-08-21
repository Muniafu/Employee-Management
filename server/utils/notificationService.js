/**
 * Simple in-app notification service
 * In a real-world app, could extend with WebSocket, push, or DB persistence
 */
const sendNotification = async (userId, message) => {
  try {
    console.log(`Notification to ${userId}: ${message}`);
    // TODO: Save notification in DB if persistent storage is needed
    return { userId, message, status: 'delivered' };
  } catch (error) {
    console.error('Notification error:', error);
    throw new Error('Notification could not be sent');
  }
};

module.exports = { sendNotification };