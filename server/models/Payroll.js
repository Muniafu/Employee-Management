const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },
    baseSalary: { type: Number, required: true },
    bonuses: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    generatedAt: { type: Date, default: Date.now },
}, { timestamps: true }
);

// Prevent duplicate payroll entries for the same employee, month, and year
PayrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });


module.exports = mongoose.model('Payroll', PayrollSchema);