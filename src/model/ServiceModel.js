const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: false,
  },
  customerName: {
    type: String
  },
  customerMobile: {
    type: String
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  therapistName: {
    type: String,
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
  },
  paymentStatus: {
    type: String
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
  },
  roomName: {
    type: String,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
  },
  treatmentId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Treatment',
  },
  status: {
    type: String,
    required: true,
  },
});

const ServiceDB = mongoose.model("Service", ServiceSchema);
module.exports = ServiceDB;
