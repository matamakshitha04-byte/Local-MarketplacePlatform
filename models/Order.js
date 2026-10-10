const mongoose = require('mongoose');
const { ORDER_STATUSES } = require('../utils/constants');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  image: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: { type: [orderItemSchema], validate: [(v) => v.length > 0, 'Order must have at least one item'] },
  totalAmount: { type: Number, required: true, min: 0 },
  deliveryLocation: { type: String, required: [true, 'Delivery location is required'], trim: true },
  status: { type: String, enum: ORDER_STATUSES, default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

orderSchema.index({ 'items.seller': 1 });

module.exports = mongoose.model('Order', orderSchema);
