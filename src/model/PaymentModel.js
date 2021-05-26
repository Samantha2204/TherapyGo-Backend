const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  paymentTime: {
    type: String,
    default: ''
  },
  paymentDate: {
    type: Date,
    default: ''
  },
  method: {
    type: String,
    default: 'Card',
  },
  amount: {
    type: Number,
    required: true,
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
    
  },
});

const PaymentDB = mongoose.model('Payment', paymentSchema);
module.exports = PaymentDB;
