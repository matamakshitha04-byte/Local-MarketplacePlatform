const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');

exports.getStats = asyncHandler(async (req, res) => {
  const seller = req.user._id;
  const [totalProducts, availableProducts, outOfStock, totalOrders] = await Promise.all([
    Product.countDocuments({ seller }),
    Product.countDocuments({ seller, isAvailable: true, quantity: { $gt: 0 } }),
    Product.countDocuments({ seller, quantity: 0 }),
    Order.countDocuments({ 'items.seller': seller }),
  ]);
  res.json({ totalProducts, availableProducts, outOfStock, totalOrders });
});
