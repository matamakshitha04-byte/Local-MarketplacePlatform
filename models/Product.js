const mongoose = require('mongoose');
const { CATEGORIES } = require('../utils/constants');

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Product name is required'], trim: true },
  description: { type: String, required: [true, 'Description is required'], trim: true },
  category: { type: String, required: true, enum: CATEGORIES },
  price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
  quantity: {
    type: Number, required: true, min: [0, 'Quantity cannot be negative'],
    validate: { validator: Number.isInteger, message: 'Quantity must be a whole number' },
  },
  location: { type: String, required: true, trim: true },
  image: { type: String, default: '', trim: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
