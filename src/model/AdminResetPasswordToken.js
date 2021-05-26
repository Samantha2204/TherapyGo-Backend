const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Admin"
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600
  }
});

module.exports = mongoose.model("AdminResetPasswordToken", TokenSchema);