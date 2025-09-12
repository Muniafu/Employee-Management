const logger = require("../config/logger");
const User = require("../models/User");
const Employee = require("../models/Employee");
const { generateToken } = require("../config/jwt");

async function register (req, res) {
    try {
        const { username, firstName, lastName, email, password, role, employeeId } = req.body;

        if (!username || !firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'Username, firstName, lastName, email, and password are required' });
        }

        let employeeRef = null;
        if (employeeId) {
            // Admin manually links user to existing employee
            const emp = await Employee.findById(employeeId);
            if (!emp) 
                return res.status(400).json({ message: 'Invalid employee ID' });
            employeeRef = emp._id;
        } else if (role === 'Employee') {
            // Auto-create profile for employees
            const emp = new Employee({
                firstName,
                lastName,
                email,
            });
            await emp.save();
            employeeRef = emp._id;
        }

        const existing = await User.findOne({ 
            $or: [{ username}, { email}], 
        });
        if (existing) 
            return res.status(409).json({ message: 'Username or email already exists' });

        const user = new User({ 
            username, 
            email, 
            password, 
            role: role || 'Employee', 
            employee: employeeRef 
        });
        await user.save();

        const payload = {
            id: user._id,
            role: user.role,
            username: user.username,
            email: user.email,
            employeeId: user.employee || null, // always present
        };

        const token = generateToken(payload);

        logger.info(`User registered: ${user.username}`);
        return res.status(201).json({ 
            token,
            user: payload
        });
    } catch (err) {
        logger.error('register error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

async function login(req, res) {
    try {
        const { usernameOrEmail, password } = req.body;
        if (!usernameOrEmail || !password) {
            return res.status(400).json({ message: 'usernameOrEmail and password required' });
        }

        const user = await User.findOne({ 
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] 
        }).populate('employee');

        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        
        const payload = { 
            id: user._id, 
            role: user.role, 
            username: user.username,
            email: user.email,
            employeeId: user.employee ? user.employee._id : null, // always present
        };

        const token = generateToken(payload);

        return res.json({ token, user: payload });
    } catch (err) {
        logger.error('login error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}


async function getProfile(req, res) {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const user = await User.findById(userId).select('-password').populate({ path: 'employee', populate: { path: 'department' } });

        if (!user) return res.status(404).json({ message: 'User not found' });
        
        return res.json({ 
            user: {
                id: user._id,
                role: user.role,
                username: user.username,
                email: user.email,
                employeeId: user.employee ? user.employee._id : null, // always present
            },
        });
    } catch (err) {

        logger.error('getProfile error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}


module.exports = { register, login, getProfile };