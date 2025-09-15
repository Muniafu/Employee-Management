const DepartmentModel = require('../models/Department');
const EmployeeModel = require('../models/Employee');
const { sendNotification } = require('../utils/notificationService');
const { sendEmail } = require('../utils/emailService');


async function createDepartment(req, res) {
  try {
    let { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "name required" });

    name = name.trim().toLowerCase();
    const exists = await DepartmentModel.findOne({ name });
    if (exists) return res.status(409).json({ message: "Department already exists" });

    const d = new DepartmentModel({ name, description });
    await d.save();

    // 🔔 Notify all admins
    await sendNotification({
      user: req.user._id,
      type: "department",
      message: `Department "${name}" has been created.`,
    });
    await sendEmail({
      to: req.user.email,
      subject: "Department Created",
      text: `Department "${name}" has been successfully created.`,
    });

    return res.status(201).json({ message: "Department created", department: d });
  } catch (err) {
    console.error("❌ createDepartment error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function getDepartment(req, res) {
  try {
    const { id } = req.params;
    const d = await DepartmentModel.findById(id);
    if (!d) return res.status(404).json({ message: "Department not found" });
    return res.json({ department: d });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function updateDepartment(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const d = await DepartmentModel.findByIdAndUpdate(id, updates, { new: true });
    if (!d) return res.status(404).json({ message: "Department not found" });

    // 🔔 Notify admins
    await sendNotification({
      user: req.user._id,
      type: "department",
      message: `Department "${d.name}" has been updated.`,
    });

    return res.json({ message: "Department updated", department: d });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function deleteDepartment(req, res) {
  try {
    const { id } = req.params;

    const count = await EmployeeModel.countDocuments({ department: id });
    if (count > 0) {
      return res.status(400).json({ message: "Cannot delete department with assigned employees" });
    }

    const d = await DepartmentModel.findByIdAndDelete(id);
    if (!d) return res.status(404).json({ message: "Department not found" });

    // 🔔 Notify admins
    await sendNotification({
      user: req.user._id,
      type: "department",
      message: `Department "${d.name}" has been deleted.`,
    });

    return res.json({ message: "Department deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function getDepartments(req, res) {
  try {
    const departments = await DepartmentModel.find();
    return res.json({ departments });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { createDepartment, getDepartment, getDepartments, updateDepartment, deleteDepartment };