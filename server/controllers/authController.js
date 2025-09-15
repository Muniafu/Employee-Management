const logger = require("../config/logger");
const User = require("../models/User");
const Employee = require("../models/Employee");
const { generateToken } = require("../config/jwt");

// ================== REGISTER ==================
async function register(req, res) {
  try {
    const {
      username,
      firstName,
      lastName,
      email,
      password,
      role,
      employeeId,
      department,
      position,
      salary,
      phone,
      address,
    } = req.body;

    if (!username || !firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({
          message:
            "Username, firstName, lastName, email, and password are required",
        });
    }

    // Ensure unique email/username
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: "Username or email already exists" });
    }

    let employeeRef = null;

    // Create User first
    const user = new User({
      username,
      email,
      password,
      role: role || "Employee",
    });
    await user.save();
    
    // I f Admin provided an employeeId, link user to it
    if (employeeId) {
      // Admin manually links user to existing employee
      const emp = await Employee.findById(employeeId);
      if (!emp) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }
      emp.user = user._id;
      await emp.save();
      employeeRef = emp._id;
      user.employee = emp._id;
      await user.save();
    }

    // Auto-create Employee profile if Employee role and not linked
    if (user.role === "Employee" && !employeeId) {
      const emp = new Employee({
        firstName,
        lastName,
        department: department || null,
        position: position || null,
        salary: salary || null,
        phone: phone || null,
        address: address || null,
        user: user._id,
      });
      await emp.save();
      employeeRef = emp._id;

      // Link back
      user.employee = emp._id;
      await user.save();
    }

    const payload = {
      id: user._id,
      role: user.role,
      username: user.username,
      email: user.email,
      employeeId: employeeRef,
    };

    const token = generateToken(payload);
    logger.info(`User registered: ${user.username}`);

    return res.status(201).json({
      token,
      user: payload,
    });
  } catch (err) {
    if (err && err.code === 11000) {
      logger.error('register error (duplicate)', err);
      return res.status(409).json({ message: 'Duplicate key error', details: err.keyValue || err.message });
    }
    logger.error("register error", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ================== LOGIN ==================
async function login(req, res) {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res
        .status(400)
        .json({ message: "usernameOrEmail and password required" });
    }

    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    }).populate("employee");

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const payload = {
      id: user._id,
      role: user.role,
      username: user.username,
      email: user.email,
      employeeId: user.employee ? user.employee._id : null,
    };

    const token = generateToken(payload);

    return res.json({
      token,
      user: payload,
    });
  } catch (err) {
    logger.error("login error", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ================== PROFILE ==================
async function getProfile(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "employee",
        populate: { path: "department" },
      });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      user: {
        id: user._id,
        role: user.role,
        username: user.username,
        email: user.email,
        employeeId: user.employee ? user.employee._id : null,
        employee: user.employee
          ? {
              firstName: user.employee.firstName,
              lastName: user.employee.lastName,
              department: user.employee.department || null,
            }
          : null,
      },
    });
  } catch (err) {
    logger.error("getProfile error", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { register, login, getProfile };