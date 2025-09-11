const mongoose2 = require('mongoose');


const Notification = mongoose2.models.Notification || mongoose2.model('Notification', new mongoose2.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  recipient: { type: mongoose2.Schema.Types.ObjectId, ref: 'User' },
  read: { type: Boolean, default: false },
}, { timestamps: true }));

async function createNotification(req, res) {
    try {
        const { title, message, recipient } = req.body;
        if (!title || !message) return res.status(400).json({ message: 'title and message required' });
        const n = new Notification({ title, message, recipient });
        await n.save();

        return res.status(201).json({ notification: n });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

// Employee self-service
async function getMyNotifications(req, res) {
  try {
    const notes = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
    return res.json({ notifications: notes });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function listNotifications(req, res) {
    try {
        const { userId } = req.query;
        const filter = userId ? { recipient: userId } : {};
        const notes = await Notification.find(filter).sort({ createdAt: -1 });
        return res.json({ notifications: notes });
    } catch (err) {
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
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { createNotification, getMyNotifications, listNotifications, markAsRead };