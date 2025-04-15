const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String },
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  discount: { type: Number, required: true },
  color: { type: String },
  total_price: { type: Number, require: true },
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    customerInformation: [
      {
        name: { type: String, require: true },
        phone: { type: Number, require: true },
      },
    ],
    shippingAddress: [
      {
        ward: { type: String, require: true },
        district: { type: String, required: true },
        city: { type: String, require: true },
        country: { type: String, require: true },
      },
    ],
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CREDIT_CARD', 'INTERNET_BANKING', 'MOMO'],
      default: 'CASH',
    },
    statusOrder: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    totalPrice: { type: Number },
    orderDetails: [orderDetailSchema],
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
  },
);
const Order = mongoose.model('Order', orderSchema); // tạo bảng
module.exports = { Order };
