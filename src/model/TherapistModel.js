const mongoose = require("mongoose");

const therapistSchema = new mongoose.Schema({
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  firstName: {
    type: String,
    default: "",
  },
  lastName: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  mobile: {
    type: Number,
  },
  isCertificated: {
    type: Boolean,
    required: true,
    default: false,
  },
  salaryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SalaryDetail",
    required: true,
  },
  tfn: {
    type: Number,
    required: true,
  },
  superNumber: {
    type: Number,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    required: true,
    default: true,
  },
  colour: {
    type: String,
    required: true,
    default: "FF0000",
  },
});

const TherapistDB = mongoose.model("Therapist", therapistSchema);

module.exports = TherapistDB;
