const DepartmentModel = require('../models/Department');


async function createDepartment(req, res) {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: 'name required' });
        const exists = await DepartmentModel.findOne({ name });
        if (exists) return res.status(409).json({ message: 'Department already exists' });
        const d = new DepartmentModel({ name, description });
        await d.save();
        return res.status(201).json({ message: 'Department created', department: d });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

async function getDepartments(req, res) {
    try {
        const departments = await DepartmentModel.find();
        return res.json({ departments });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

async function updateDepartment(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;
        const d = await DepartmentModel.findByIdAndUpdate(id, updates, { new: true });
        if (!d) return res.status(404).json({ message: 'Department not found' });
        return res.json({ message: 'Department updated', department: d });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

async function deleteDepartment(req, res) {
    try {
        const { id } = req.params;
        const d = await DepartmentModel.findByIdAndDelete(id);
        if (!d) return res.status(404).json({ message: 'Department not found' });
        return res.json({ message: 'Department deleted' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { createDepartment, getDepartments, updateDepartment, deleteDepartment };