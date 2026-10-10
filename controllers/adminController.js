const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');

exports.getStats = asyncHandler(async (req, res) => {
  const [customers, sellers, products, orders, revenue] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'seller' }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
  ]);
  res.json({ customers, sellers, products, orders, revenue: revenue[0]?.total || 0 });
});

exports.getUsers = asyncHandler(async (req, res) => {
  const filter = req.query.role ? { role: req.query.role } : {};
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ users });
});

exports.setUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') return res.status(403).json({ message: 'You do not have permission' });
  user.isActive = Boolean(req.body.isActive);
  await user.save();
  res.json({ user });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') return res.status(403).json({ message: 'You do not have permission' });
  if (user.role === 'seller') await Product.deleteMany({ seller: user._id });
  await user.deleteOne();
  res.json({ message: 'User deleted' });
});

exports.getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().populate('seller', 'name shopName').sort({ createdAt: -1 });
  res.json({ products });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  await product.deleteOne();
  res.json({ message: 'Product removed' });
});
