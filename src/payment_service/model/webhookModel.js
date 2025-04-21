const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  requestId: { type: String },
  resultCode: { type: Number },
  message: { type: String },
  transId: { type: String },
  receivedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Webhook', webhookSchema);
