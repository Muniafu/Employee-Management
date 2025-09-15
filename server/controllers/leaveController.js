const Leave = require('../models/Leave');
const { sendNotification } = require('../utils/notificationService');
const Notification = require('../models/Notification')

// Employee self-service
async function getMyLeaves(req, res) {
  try {
    if (!req.user.employee) {
        return res.status(403).json({ message: 'No employee profile linked' });
    }

    const leaves = await Leave.find({ employee: req.user.employee })
      .populate('employee')
      .sort({ createdAt: -1 });

    return res.json({ leaves });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function requestLeave(req, res) {
    try {
        if(!req.user.employee) {
            return res.status(403).json({ message: 'No employeeprofile linked' });
        }

        const { startDate, endDate, type, reason } = req.body;
        if (!startDate || !endDate || !type) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const leave = new Leave({
             employee: req.user.employee, 
             startDate, 
             endDate, 
             type, 
             reason 
            });
        await leave.save();
        
        //Notify admin(s) - optional
        await Notification.create({
            title: 'New Leave request',
            message: `${req.user.name} requested ${type} leave from ${startDate} to ${endDate}`,
            recipient: null, // could target Admin users if stored
        });

        return res.status(201).json({ message: 'Leave requested', leave });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
}

// Admin-only view
async function getLeaves(req, res) {
    try {
        const { employeeId } = req.query;
        const filter = employeeId ? { employee: employeeId } : {};
        const leaves = await Leave.find(filter).populate('employee').sort({ createdAt: -1 });
        return res.json({ leaves });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

async function approveLeave(req, res) {
    try {
        const { id } = req.params;
        const leave = await Leave.findById(id).populate('employee');
        if (!leave) return res.status(404).json({ message: 'Leave not found' });

        leave.status = 'Approved';
        leave.approvedBy = req.user && req.user.id;
        await leave.save();

        // Notify employee
        await Notification.create({
            title: 'Leave Approved',
            message: `Your ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been approved.`,
        recipient: leave.employee.user, // assuming Employee has `user` ref
        });
        
        return res.json({ message: `Leave ${leave.status.toLowerCase()}`, leave });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }    
}

async function rejectLeave(req, res) {
    try {
        const { id } = req.params;
        const leave = await Leave.findById(id);
        if (!leave) return res.status(404).json({ message: 'Leave not found' });

        leave.status = 'Rejected';
        leave.approvedBy = req.user && req.user.id;
        await leave.save();
        
        // Notify employee
        await Notification.create({
            title: 'Leave Rejected',
            message: `Your ${leave.type} leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been rejected.`,
            recipient: leave.employee.user,
        });
        return res.json({ message: 'Leave rejected', leave });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { getMyLeaves, requestLeave, getLeaves, approveLeave, rejectLeave };