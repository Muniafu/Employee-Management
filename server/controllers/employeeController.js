const Employee = require('../models/Employee');
const User = require('../models/User');

// Admin creates a new employee (User + Employee)
async function createEmployee(req, res) {
    try {
        const { 
            firstName, 
            lastName, 
            email, 
            username, 
            password, 
            role, 
            department, 
            position, 
            salary
        } = req.body;

        if (!firstName || !lastName) {
            return res.status(400).json({ message: 'firstName, lastName are required' });
        }

        let user = nul;

        // Create with User account
        if (username && email && password) {
            // Check duplicates
            const exists = await User.findOne({ $or: [{ email }, { username }] });
            if (exists) {
                return res.status(409).json({ message: 'Email or username already exists' });
            }
        }
        

        // Create User first
        user = new User({
            username,
            email,
            password,
            role: role || 'Employee'
        });
        await user.save();

        // Create Employee (linked to User if exists)
        const emp = new Employee({
            firstName,
            lastName,
            department,
            position,
            salary,
            user: user? user._id: null,
        });
        await emp.save();

        // Link back Employee to User
        if (user) {
            user.employee = emp._id;
            await user.save();
        }

        return res.status(201).json({
            message: 'Employee created successfully',
            employee: {
                id: emp._id,
                ...emp.toObject(),
                user: user ? {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    role: user.role
                }
                : null,
            }
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
}

async function listEmployees(req, res) {
    try {
        const employees = await Employee.find().populate('department').populate('user', 'email username role');
        return res.json({ employees });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

async function getEmployeeById(req, res) {
    try {
        const { id } = req.params;
        const emp = await Employee.findById(id).populate('department').populate('user', 'email username role');
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

        const emp = await Employee.findByIdAndUpdate(id, updates, { new: true })
            .populate('department')
            .populate('user', 'email username role');
        if (!emp) return res.status(404).json({ message: 'Employee not found' });

        return res.json({ message: 'Employee updated', employee: emp });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

async function deleteEmployee(req, res) {
    try {
        const { id } = req.params;
        const emp = await Employee.findByIdAndDelete(id);
        if (!emp) return res.status(404).json({ message: 'Employee not found' });

        // Delete linked User as well
        await User.findOneAndDelete({ employee: emp._id });

        return res.json({ message: 'Employee and linked User deleted' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}

// Self-service
async function getMyProfile(req, res) {
    try {
        if (req.user.role === "Admin") {
            return res.status(403).json({ message: "Admins do not have an employee profile" });
        }
        if (!req.user.employee) {
            return res.status(403).json({ message: "No employee profile linked" });
        }

        const employee = await Employee.findById(req.user.employee)
            .populate("department")
            .populate("user", "email username role");
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        res.json({ employee });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function updateMyProfile(req, res) {
    try {
        if (req.user.role === "Admin") {
            return res.status(403).json({ message: "Admins cannot update employee profiles here" });
        }
        if (!req.user.employee) {
            return res.status(403).json({ message: "No employee profile linked" });
        }

        const updated = await Employee.findByIdAndUpdate(req.user.employee, req.body, { new: true })
            .populate("department")
            .populate("user", "email username role");

        if (!updated) return res.status(404).json({ message: "Employee not found" });

        res.json({ employee: updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = {
    createEmployee,
    listEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    getMyProfile,
    updateMyProfile,
};