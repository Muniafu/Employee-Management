// server/controllers/departmentController.js
const DepartmentModel = require('../models/Department');
const EmployeeModel = require('../models/Employee');
const { sendNotification } = require('../utils/notificationService');
const { sendEmail } = require('../utils/emailService');

// ✅ Standardized response helper
function response(res, status, success, message, data = null, error = null) {
  return res.status(status).json({ success, message, data, error });
}

async function createDepartment(req, res) {
  try {
    let { name, description } = req.body;
    if (!name) return response(res, 400, false, "Department name required");

    name = name.trim().toLowerCase();
    const exists = await DepartmentModel.findOne({ name });
    if (exists) return response(res, 409, false, "Department already exists");

    const d = new DepartmentModel({ name, description });
    await d.save();

    // 🔔 Notify all admins
    await sendNotification({
      userId: req.user._id,
      type: "department",
      title: "Department Created",
      message: `Department "${name}" has been created.`,
      email: req.user.email,
    });

    return response(res, 201, true, "Department created", d);
  } catch (err) {
    console.error("❌ createDepartment error:", err);
    return response(res, 500, false, "Server error", null, err.message);
  }
}

async function getDepartment(req, res) {
  try {
    const { id } = req.params;
    const d = await DepartmentModel.findById(id);
    if (!d) return response(res, 404, false, "Department not found");

    return response(res, 200, true, "Department retrieved", d);
  } catch (err) {
    return response(res, 500, false, "Server error", null, err.message);
  }
}

async function updateDepartment(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const d = await DepartmentModel.findByIdAndUpdate(id, updates, { new: true });
    if (!d) return response(res, 404, false, "Department not found");

    // 🔔 Notify admins
    await sendNotification({
      userId: req.user._id,
      type: "department",
      title: "Department Updated",
      message: `Department "${d.name}" has been updated.`,
      email: req.user.email,
    });

    return response(res, 200, true, "Department updated", d);
  } catch (err) {
    return response(res, 500, false, "Server error", null, err.message);
  }
}

async function deleteDepartment(req, res) {
  try {
    const { id } = req.params;

    const count = await EmployeeModel.countDocuments({ department: id });
    if (count > 0) {
      return response(res, 400, false, "Cannot delete department with assigned employees");
    }

    const d = await DepartmentModel.findByIdAndDelete(id);
    if (!d) return response(res, 404, false, "Department not found");

    // 🔔 Notify admins
    await sendNotification({
      userId: req.user._id,
      type: "department",
      title: "Department Deleted",
      message: `Department "${d.name}" has been deleted.`,
      email: req.user.email,
    });

    return response(res, 200, true, "Department deleted");
  } catch (err) {
    return response(res, 500, false, "Server error", null, err.message);
  }
}

async function getDepartments(req, res) {
  try {
    const departments = await DepartmentModel.find();
    return response(res, 200, true, "Departments retrieved", departments);
  } catch (err) {
    return response(res, 500, false, "Server error", null, err.message);
  }
}

module.exports = {
  createDepartment,
  getDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
};