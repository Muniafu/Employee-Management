const mongoose = require('mongoose');


const EmployeeSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    position: { type: String },
    dateOfJoining: { type: Date },
    salary: { type: Number },
    address: { type: String },
    emergencyContact: { name: String, phone: String },
}, { timestamps: true }
);


module.exports = mongoose.model('Employee', EmployeeSchema);