const PayrollModel = require('../models/Payroll');
const EmployeeModel2 = require('../models/Employee');

// Admin-only: generate payroll for an employee for a specific month
async function generatePayroll(req, res) {
    try {
        const { employeeId, month, year, baseSalary, bonuses = 0, deductions = 0 } = req.body;
        if (!employeeId || !month || !year || !baseSalary) return res.status(400).json({ message: 'Missing required fields' });

        const emp = await EmployeeModel2.findById(employeeId);
        if (!emp) return res.status(404).json({ message: 'Employee not found' });

        const netSalary = Number(baseSalary) + Number(bonuses) - Number(deductions);
        
        const payroll = await PayrollModel.findOneAndUpdate(
            { employee: employeeId, month, year },
            { employee: employeeId, month, year, baseSalary, bonuses, deductions, netSalary, generatedAt: new Date() },
            { new: true, upsert: true }
        );
        
        return res.json({ message: 'Payroll generated', payroll });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
}

// Admin: view payroll of any employee
async function getPayrollForEmployee(req, res) {
    try {
        const { id } = req.params;
        const records = await PayrollModel.find({ employee: id }).sort({ year: -1, month: -1 });
        return res.json({ payrolls: records });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
}

// Admin: get all payrolls
async function getAllPayrolls(req, res) {
  try {
    const records = await PayrollModel.find({})
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

    const records = await PayrollModel.find({ employee: req.user.employee }).sort({ year: -1, month: -1 });
    return res.json({ payrolls: records });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { generatePayroll, getPayrollForEmployee, getAllPayrolls, getMyPayrolls };