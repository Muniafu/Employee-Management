const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Create new employee
router.post('/add', async (req, res) => {
    const newEmployee = new Employee(req.body);
    try {
        const employee = await newEmployee.save();
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all employees (for analytics)
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get employee by email (for login)
router.get('/', async (req, res) => {
    const email = req.query.email;
    try {
      if (email) {
        const employee = await Employee.find({ email });
        res.status(200).json(employee);
      } else {
        const employees = await Employee.find();
        res.status(200).json(employees);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

module.exports = router;
