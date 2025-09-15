const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const { sendNotification } = require('../utils/notificationService');
const { sendEmail } = require('../utils/emailService');


// Admin-only: generate payroll for an employee for a specific month
async function generatePayroll(req, res) {
    try {
        const { employeeId, month, year, baseSalary, bonuses = 0, deductions = 0 } = req.body;
        if (!employeeId || !month || !year || !baseSalary) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const emp = await Employee.findById(employeeId).populate('user');
        if (!emp) return res.status(404).json({ message: 'Employee not found' });

        const netSalary = Number(baseSalary) + Number(bonuses) - Number(deductions);

        const payroll = await Payroll.findOneAndUpdate(
            { employee: employeeId, month, year },
            { employee: employeeId, month, year, baseSalary, bonuses, deductions, netSalary, generatedAt: new Date() },
            { new: true, upsert: true }
        );

        // 🔔 Send notification to employee
        await sendNotification({
            userId: emp.user,
            title: "Payroll Generated",
            message: `Your payroll for ${month}/${year} has been generated. Net Salary: $${netSalary}`,
            type: "payroll"
        });

        // 📧 Send email to employee
        await sendEmail({
            to: emp.user.email,
            subject: `Payroll Generated - ${month}/${year}`,
            text: `Hi ${emp.firstName},\n\nYour payroll for ${month}/${year} has been generated.\nNet Salary: $${netSalary}.\n\nRegards,\nHR`
        });

        return res.json({ message: 'Payroll generated', payroll });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
}

// Admin: view payroll of any employee
async function getPayrollForEmployee(req, res) {
    try {
        const { id } = req.params;
        const records = await Payroll.find({ employee: id }).sort({ year: -1, month: -1 });
        return res.json({ payrolls: records });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
}

// Admin: get all payrolls
async function getAllPayrolls(req, res) {
  try {
    const records = await Payroll.find({})
      .populate('employee')
      .sort({ year: -1, month: -1 });
    return res.json({ payrolls: records });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Employee self-service
async function getMyPayrolls(req, res) {
  try {
    if (!req.user.employee) return res.status(403).json({ message: 'No employee profile linked' });

    const records = await Payroll.find({ employee: req.user.employee }).sort({ year: -1, month: -1 });
    return res.json({ payrolls: records });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { generatePayroll, getPayrollForEmployee, getAllPayrolls, getMyPayrolls };