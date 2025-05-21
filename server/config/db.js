const mongoose = require("mongoose");
require("dotenv").config();

const Connection = mongoose.connect(process.env.MONGODB_URL);

module.exports = {Connection};