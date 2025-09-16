const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { sendNotification } = require('../utils/notificationService');
const { sendEmail } = require('../utils/emailService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

async function clockIn(req, res) {
    try {
        const { employeeId } = req.body;
        if (!employeeId) return res.status(400).json({ message: 'employeeId required' });

        const emp = await Employee.findById(employeeId).populate('user');
        if (!emp) return res.status(404).json({ message: 'Employee not found' });

        const today = new Date();
        const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        let attendance = await Attendance.findOne({ employee: employeeId, date: dateOnly });
        if (attendance) {
            if (attendance.checkIn) return res.status(400).json({ message: 'Already clocked in for today' });
            attendance.checkIn = new Date();
        } else {
            attendance = new Attendance({ employee: employeeId, date: dateOnly, status: 'Present', checkIn: new Date() });
        }

        await attendance.save();

        // 🔔 Fire notification
        await sendNotification({
            userId: emp.user,
            title: "Clock In Recorded",
            message: `You clocked in at ${attendance.checkIn.toLocaleTimeString()}`,
            type: "attendance"
        });

        // 📧 Fire email
        await sendEmail({
            to: emp.user.email,
            subject: "Clock In Successful",
            text: `Hi ${emp.firstName}, your clock-in at ${attendance.checkIn.toLocaleTimeString()} has been recorded.`
        });

        return successResponse(res, attendance, "Clocked in successfully");
    } catch (err) {
        return errorResponse(res, err);
    }
}

async function clockOut(req, res) {
    try {
        const { employeeId } = req.body;
        if (!employeeId) return res.status(400).json({ message: 'employeeId required' });

        const emp = await Employee.findById(employeeId).populate('user');
        if (!emp) return res.status(404).json({ message: 'Employee not found' });

        const today = new Date();
        const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const attendance = await Attendance.findOne({ employee: employeeId, date: dateOnly });
        if (!attendance) return res.status(404).json({ message: 'No attendance record for today' });

        if (attendance.checkOut) return res.status(400).json({ message: 'Already clocked out for today' });

        attendance.checkOut = new Date();
        await attendance.save();

        // 🔔 Fire notification
        await sendNotification({
            userId: emp.user,
            title: "Clock Out Recorded",
            message: `You clocked out at ${attendance.checkOut.toLocaleTimeString()}`,
            type: "attendance"
        });

        // 📧 Fire email
        await sendEmail({
            to: emp.user.email,
            subject: "Clock Out Successful",
            text: `Hi ${emp.firstName}, your clock-out at ${attendance.checkOut.toLocaleTimeString()} has been recorded.`
        });

        return successResponse(res, attendance, "Clocked out successfully");
    } catch (err) {
        return errorResponse(res, err);
    }
}

// Admin: view attendance of any employee
async function getAttendanceForEmployee(req, res) {
    try {
        const { id } = req.params;
        const records = await Attendance.find({ employee: id }).sort({ date: -1 });
        
        return successResponse(res, records, "Attendance fetched");
    } catch (err) {
        return errorResponse(res, err);
    }
}

// Employee self-service
async function getMyAttendance(req, res) {
  try {
    if (!req.user.employee) return res.status(403).json({ message: 'No employee profile linked' });

    const records = await Attendance.find({ employee: req.user.employee }).sort({ date: -1 });

    return successResponse(res, records, "My attendance fetched");
  } catch (err) {
    return errorResponse(res, err);
  }
}

async function getAllAttendance(req, res) {
    try {
        const records = await Attendance.find().populate("employee").sort({ date: -1 });

        return successResponse(res, records, "All attendance fetched");
    } catch (err) {
        return errorResponse(res, err);
    }
}

module.exports = { clockIn, clockOut, getAttendanceForEmployee, getMyAttendance, getAllAttendance };