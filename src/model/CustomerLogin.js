const mongoose = require("mongoose");

const customerLoginSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    trim: true,
  },
});

const CustomerLoginDB = mongoose.model("CustomerLogin", customerLoginSchema);

module.exports = CustomerLoginDB;
