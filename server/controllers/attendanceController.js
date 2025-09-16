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

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: start, $lte: end },
    });

    if (attendance && attendance.checkIn) {
      return res.status(400).json({ message: 'Already clocked in for today' });
    }

    if (!attendance) {
      attendance = new Attendance({
        employee: employeeId,
        date: now,
        status: 'Present',
        checkIn: now,
      });
    } else {
      attendance.checkIn = now;
      attendance.status = 'Present';
    }

    await attendance.save();

    // 🔔 Fire notification
    await sendNotification({
      userId: emp.user,
      title: 'Clock In Recorded',
      message: `You clocked in at ${attendance.checkIn.toLocaleTimeString()}`,
      type: 'attendance',
    });

    // 📧 Fire email, capture status
    const emailResult = await sendEmail({
      to: emp.user.email,
      subject: 'Clock In Successful',
      text: `Hi ${emp.firstName}, your clock-in at ${attendance.checkIn.toLocaleTimeString()} has been recorded.`,
    });

    let msg = 'Clocked in successfully';
    if (!emailResult.success) msg += ', but email could not be sent';

    return successResponse(res, attendance, msg);
  } catch (err) {
    console.error('Clock-in error:', err);
    return errorResponse(res, err);
  }
}

async function clockOut(req, res) {
  try {
    const { employeeId } = req.body;
    if (!employeeId) return res.status(400).json({ message: 'employeeId required' });

    const emp = await Employee.findById(employeeId).populate('user');
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: start, $lte: end },
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No attendance record for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already clocked out for today' });
    }

    attendance.checkOut = now;
    await attendance.save();

    // 🔔 Fire notification
    await sendNotification({
      userId: emp.user,
      title: 'Clock Out Recorded',
      message: `You clocked out at ${attendance.checkOut.toLocaleTimeString()}`,
      type: 'attendance',
    });

    // 📧 Fire email, capture status
    const emailResult = await sendEmail({
      to: emp.user.email,
      subject: 'Clock Out Successful',
      text: `Hi ${emp.firstName}, your clock-out at ${attendance.checkOut.toLocaleTimeString()} has been recorded.`,
    });

    let msg = 'Clocked out successfully';
    if (!emailResult.success) msg += ', but email could not be sent';

    return successResponse(res, attendance, msg);
  } catch (err) {
    console.error('Clock-out error:', err);
    return errorResponse(res, err);
  }
}

// Admin: view attendance of any employee
async function getAttendanceForEmployee(req, res) {
  try {
    const { id } = req.params;
    const records = await Attendance.find({ employee: id }).sort({ date: -1 });
    return successResponse(res, records, 'Attendance fetched');
  } catch (err) {
    return errorResponse(res, err);
  }
}

// Employee self-service
async function getMyAttendance(req, res) {
  try {
    if (!req.user.employee) return res.status(403).json({ message: 'No employee profile linked' });

    const records = await Attendance.find({ employee: req.user.employee }).sort({ date: -1 });
    return successResponse(res, records, 'My attendance fetched');
  } catch (err) {
    return errorResponse(res, err);
  }
}

async function getAllAttendance(req, res) {
  try {
    const records = await Attendance.find().populate('employee').sort({ date: -1 });
    return successResponse(res, records, 'All attendance fetched');
  } catch (err) {
    return errorResponse(res, err);
  }
}

module.exports = {
  clockIn,
  clockOut,
  getAttendanceForEmployee,
  getMyAttendance,
  getAllAttendance,
};