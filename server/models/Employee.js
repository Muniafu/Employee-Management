const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: String,
    email: String,
    goals: String,
    progress: String,
    evaluationScore: Number
});

module.exports = mongoose.model('Employee', employeeSchema);