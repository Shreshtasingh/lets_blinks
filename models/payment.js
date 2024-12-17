const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, default: 'pending' },
  order: { type: String, required: true },
  paymentId: { type: String },
  signature: { type: String },
  transactionId: { type: String },
});

const paymentModel = mongoose.model('Payment', paymentSchema);

module.exports = { paymentModel };
