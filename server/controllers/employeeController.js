const EmployeeModel = require('../models/Employee');
const UserModel = require('../models/User');

async function createEmployee(req, res) {
    try {
        const data = req.body;
        if (!data.firstName || !data.lastName || !data.email) return res.status(400).json({ message: 'firstName, lastName, email required' });

        const exists = await EmployeeModel.findOne({ email: data.email });
        if (exists) return res.status(409).json({ message: 'Employee with this email already exists' });

        const emp = new EmployeeModel(data);
        await emp.save();

        return res.status(201).json({ message: 'Employee created', employee: emp });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
}

async function listEmployees(req, res) {
    try {
        const employees = await EmployeeModel.find().populate('department');
        return res.json({ employees });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

async function getEmployeeById(req, res) {
    try {
        const { id } = req.params;
        const emp = await EmployeeModel.findById(id).populate('department');
        if (!emp) return res.status(404).json({ message: 'Employee not found' });
        return res.json({ employee: emp });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

async function updateEmployee(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;
        const emp = await EmployeeModel.findByIdAndUpdate(id, updates, { new: true }).populate('department');
        if (!emp) return res.status(404).json({ message: 'Employee not found' });
        return res.json({ message: 'Employee updated', employee: emp });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

async function deleteEmployee(req, res) {
    try {
        const { id } = req.params;
        const emp = await EmployeeModel.findByIdAndDelete(id);
        if (!emp) return res.status(404).json({ message: 'Employee not found' });
        
        await UserModel.findOneAndDelete({ employee: emp._id });

        return res.json({ message: 'Employee deleted' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { createEmployee, listEmployees, getEmployeeById, updateEmployee, deleteEmployee };