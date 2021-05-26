const mongoose = require("mongoose");

const RevenueSchema = new mongoose.Schema({
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "schedule",
  },

  voucherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Voucher",
  },
});

const revenue = mongoose.model("revenue", RevenueSchema);
module.exports = revenue;
