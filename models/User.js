const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../utils/constants');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2 },
  email: {
    type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Enter a valid email'],
  },
  phone: { type: String, required: [true, 'Phone is required'], match: [/^\d{10}$/, 'Phone must be 10 digits'] },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ROLES, default: 'customer' },
  location: { type: String, required: [true, 'Location is required'], trim: true },
  shopName: { type: String, trim: true },
  shopAddress: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
