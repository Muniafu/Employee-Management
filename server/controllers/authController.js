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
      role, // Admin | Employee
      department,
      position,
      salary,
      phone,
      address,
    } = req.body;

    if (!username || !firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, firstName, lastName, email, and password are required",
        data: null
      });
    }

    // Ensure unique email/username
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username or email already exists",
        data: null
      });
    }

    // 🔹 Admin self-signup restriction    
    if (role === "Admin") {
      const existingAdmin = await User.findOne({ role: "Admin" });
      if (existingAdmin) {
        return res.status(403).json({
          success: false,
          message: "Admin already exists. Contact system administrator.",
          data: null
        });
      }
    }

    // Create User first
    const user = new User({
      username,
      email,
      password,
      role: role || "Employee",
    });
    await user.save();    

    let employeeRef = null;

    // Auto-create Employee profile if Employee role and not linked
    if (user.role === "Employee") {
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
      success: true,
      message: "Registration successful",
      data: {
        token,
        user: payload,
      }
    });
  } catch (err) {
    if (err && err.code === 11000) {
      logger.error('register error (duplicate)', err);
      return res.status(409).json({
        success: false,
        message: 'Duplicate key error',
        data: { details: err.keyValue || err.message }
      });
    }
    logger.error("register error", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      data: null
    });
  }
}

// ================== LOGIN ==================
async function login(req, res) {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "usernameOrEmail and password required",
        data: null
      });
    }

    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    }).populate("employee");

    if (!user) return res.status(401).json({
      success: false,
      message: "Invalid credentials",
      data: null
    });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({
      success: false,
      message: "Invalid credentials",
      data: null
    });

    const payload = {
      id: user._id,
      role: user.role,
      username: user.username,
      email: user.email,
      employeeId: user.employee ? user.employee._id : null,
    };

    const token = generateToken(payload);

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: payload,
      }
    });
  } catch (err) {
    logger.error("login error", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      data: null
    });
  }
}

// ================== PROFILE ==================
async function getProfile(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({
      success: false,
      message: "Unauthorized",
      data: null
    });

    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "employee",
        populate: { path: "department" },
      });

    if (!user) return res.status(404).json({
      success: false,
      message: "User not found",
      data: null
    });

    return res.json({
      success: true,
      message: "Profile retrieved successfully",
      data: {
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
      }
    });
  } catch (err) {
    logger.error("getProfile error", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      data: null
    });
  }
}

module.exports = { register, login, getProfile };