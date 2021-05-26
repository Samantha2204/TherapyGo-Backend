const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
   used: {
    type: Boolean,
    required: true
  },
  
   sellername: {
    type: String,
    required: true
  }
})

const voucher = mongoose.model('voucher', VoucherSchema);
module.exports = voucher;
