const Notification = require("../models/Notification");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Admin: Create notification (targeted or broadcast)
const createNotification = asyncHandler(async (req, res) => {
  const { title, message, recipient, type = "general" } = req.body;

  if (!title || !message) {
    return res.status(400).json({
      success: false,
      message: "Title and message are required",
    });
  }

  const notification = await Notification.create({
    title,
    message,
    recipient,
    type,
  });

  // Socket.io real-time emit
  const io = req.app.get("io");
  if (io) {
    if (recipient) {
      io.to(recipient.toString()).emit("notification", notification);
    } else {
      io.emit("notification", notification); // broadcast
    }
  }

  return res.status(201).json({
    success: true,
    message: "Notification created successfully",
    data: notification,
  });
});

// Employee: View my notifications
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 });

  return res.json({
    success: true,
    data: notifications,
  });
});

// Admin: View all notifications (optionally filter by userId)
const listNotifications = asyncHandler(async (req, res) => {
  const { userId } = req.query;
  const filter = userId ? { recipient: userId } : {};

  const notifications = await Notification.find(filter).sort({ createdAt: -1 });

  return res.json({
    success: true,
    data: notifications,
  });
});

// Employee/Admin: Mark notification as read
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findByIdAndUpdate(
    id,
    { read: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ success: false, message: "Notification not found" });
  }

  return res.json({
    success: true,
    message: "Notification marked as read",
    data: notification,
  });
});

module.exports = {
  createNotification,
  getMyNotifications,
  listNotifications,
  markAsRead,
};