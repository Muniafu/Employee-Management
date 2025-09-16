const Leave = require("../models/Leave");
const { sendNotification } = require("../utils/notificationService");
const Notification = require("../models/Notification");

// Utility wrapper for async controllers
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Employee: View my leaves
const getMyLeaves = asyncHandler(async (req, res) => {
  if (!req.user.employee) {
    return res.status(403).json({ success: false, message: "No employee profile linked" });
  }

  const leaves = await Leave.find({ employee: req.user.employee })
    .populate("employee")
    .sort({ createdAt: -1 });

  return res.json({ success: true, data: leaves });
});

// Employee: Request leave
const requestLeave = asyncHandler(async (req, res) => {
  if (!req.user.employee) {
    return res.status(403).json({ success: false, message: "No employee profile linked" });
  }

  const { startDate, endDate, type, reason } = req.body;
  if (!startDate || !endDate || !type) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const leave = await Leave.create({
    employee: req.user.employee,
    startDate,
    endDate,
    type,
    reason,
  });

  // Notify admins (optional)
  await Notification.create({
    title: "New Leave Request",
    message: `${req.user.username} requested ${type} leave from ${new Date(startDate).toDateString()} to ${new Date(endDate).toDateString()}`,
    recipient: null, // placeholder, can target Admin group
    type: "leave",
  });

  return res.status(201).json({
    success: true,
    message: "Leave requested successfully",
    data: leave,
  });
});

// Admin: View all leaves or filter by employee
const getLeaves = asyncHandler(async (req, res) => {
  const { employeeId } = req.query;
  const filter = employeeId ? { employee: employeeId } : {};

  const leaves = await Leave.find(filter)
    .populate("employee")
    .sort({ createdAt: -1 });

  return res.json({ success: true, data: leaves });
});

// Admin: Approve leave
const approveLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const leave = await Leave.findById(id).populate("employee");

  if (!leave) {
    return res.status(404).json({ success: false, message: "Leave not found" });
  }

  leave.status = "Approved";
  leave.approvedBy = req.user._id;
  await leave.save();

  // Notify employee
  await sendNotification({
    userId: leave.employee.user,
    title: "Leave Approved",
    message: `Your ${leave.type} leave (${leave.startDate.toDateString()} - ${leave.endDate.toDateString()}) has been approved.`,
    type: "leave",
  });

  return res.json({
    success: true,
    message: "Leave approved",
    data: leave,
  });
});

// Admin: Reject leave
const rejectLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const leave = await Leave.findById(id).populate("employee");

  if (!leave) {
    return res.status(404).json({ success: false, message: "Leave not found" });
  }

  leave.status = "Rejected";
  leave.approvedBy = req.user._id;
  await leave.save();

  // Notify employee
  await sendNotification({
    userId: leave.employee.user,
    title: "Leave Rejected",
    message: `Your ${leave.type} leave (${leave.startDate.toDateString()} - ${leave.endDate.toDateString()}) has been rejected.`,
    type: "leave",
  });

  return res.json({
    success: true,
    message: "Leave rejected",
    data: leave,
  });
});

module.exports = {
  getMyLeaves,
  requestLeave,
  getLeaves,
  approveLeave,
  rejectLeave,
};