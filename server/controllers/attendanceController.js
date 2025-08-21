const AttendanceModel = require('../models/Attendance');
const Employee = require('../models/Employee');


async function clockIn(req, res) {
    try {
        const { employeeId } = req.body;
        if (!employeeId) return res.status(400).json({ message: 'employeeId required' });
        
        
        const emp = await Employee.findById(employeeId);
        if (!emp) return res.status(404).json({ message: 'Employee not found' });
        
        const today = new Date();
        const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        let attendance = await AttendanceModel.findOne({ employee: employeeId, date: dateOnly });
        if (attendance) {
            if (attendance.checkIn) return res.status(400).json({ message: 'Already clocked in for today' });
            attendance.checkIn = new Date();
        } else {
            attendance = new AttendanceModel({ employee: employeeId, date: dateOnly, status: 'Present', checkIn: new Date() });
        }
        
        await attendance.save();
        return res.json({ message: 'Clocked in', attendance });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
}

async function clockOut(req, res) {
    try {
        const { employeeId } = req.body;
        if (!employeeId) return res.status(400).json({ message: 'employeeId required' });

        const today = new Date();
        const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const attendance = await AttendanceModel.findOne({ employee: employeeId, date: dateOnly });
        if (!attendance) return res.status(404).json({ message: 'No attendance record for today' });

        if (attendance.checkOut) return res.status(400).json({ message: 'Already clocked out for today' });
        
        attendance.checkOut = new Date();
        await attendance.save();
        return res.json({ message: 'Clocked out', attendance });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}


async function getAttendanceForEmployee(req, res) {
    try {
        const { id } = req.params;
        const records = await AttendanceModel.find({ employee: id }).sort({ date: -1 });
        return res.json({ attendance: records });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { clockIn, clockOut, getAttendanceForEmployee };