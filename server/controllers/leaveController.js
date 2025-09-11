const LeaveModel = require('../models/Leave');

// Employee self-service
async function getMyLeaves(req, res) {
  try {
    if (!req.user.employee) return res.status(403).json({ message: 'No employee profile linked' });

    const leaves = await LeaveModel.find({ employee: req.user.employee })
      .populate('employee')
      .sort({ createdAt: -1 });

    return res.json({ leaves });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function requestLeave(req, res) {
    try {
        const { employeeId, startDate, endDate, type, reason } = req.body;
        if (!employeeId || !startDate || !endDate || !type) return res.status(400).json({ message: 'Missing required fields' });


        const leave = new LeaveModel({ employee: employeeId, startDate, endDate, type, reason });
        await leave.save();
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
        const leaves = await LeaveModel.find(filter).populate('employee').sort({ createdAt: -1 });
        return res.json({ leaves });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

async function approveLeave(req, res) {
    try {
        const { id } = req.params;
        const { action } = req.body;
        if (!['approve', 'reject'].includes(action)) return res.status(400).json({ message: 'Invalid action' });

        const leave = await LeaveModel.findById(id);
        if (!leave) return res.status(404).json({ message: 'Leave not found' });

        leave.status = action === 'approve' ? 'Approved' : 'Rejected';
        leave.approvedBy = req.user && req.user.id;
        await leave.save();
        
        return res.json({ message: `Leave ${leave.status.toLowerCase()}`, leave });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }    
}

async function rejectLeave(req, res) {
    try {
        const { id } = req.params;
        const leave = await LeaveModel.findById(id);
        if (!leave) return res.status(404).json({ message: 'Leave not found' });

        leave.status = 'Rejected';
        leave.approvedBy = req.user && req.user.id;
        await leave.save();

        return res.json({ message: 'Leave rejected', leave });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { getLeaves, requestLeave, getLeaves, approveLeave, rejectLeave };