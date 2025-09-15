const Notification = require('../models/Notification');

// Admin-only: create a notification
async function createNotification(req, res) {
  try {
    const { title, message, recipient, type } = req.body;
    if (!title || !message || !recipient) {
      return res.status(400).json({ message: 'title, message, and recipient required' });
    }

    const n = await Notification.create({ title, message, recipient, type });

    // 🔌 Emit notification via socket.io
    const io = req.app.get("io");
    if (io) {
      if (recipient) {
        io.to(recipient.toString()).emit("notification", n);
      } else {
        io.emit("notification", n); // broadcast
      }
    }

    return res.status(201).json({ notification: n });
  } catch (err) {
    console.error("CreateNotification Error:", err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Employee self-service
async function getMyNotifications(req, res) {
  try {
    const notes = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 });
    return res.json({ notifications: notes });
  } catch (err) {
    console.error("GetMyNotifications Error:", err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Admin can list all / filter by user
async function listNotifications(req, res) {
  try {
    const { userId } = req.query;
    const filter = userId ? { recipient: userId } : {};
    const notes = await Notification.find(filter).sort({ createdAt: -1 });
    return res.json({ notifications: notes });
  } catch (err) {
    console.error("ListNotifications Error:", err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const n = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!n) return res.status(404).json({ message: 'Notification not found' });
    return res.json({ notification: n });
  } catch (err) {
    console.error("MarkAsRead Error:", err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { createNotification, getMyNotifications, listNotifications, markAsRead };