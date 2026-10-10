const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { ORDER_STATUSES } = require('../utils/constants');
const { str } = require('../utils/validators');

// Show a seller only their own line items and subtotal
const forSeller = (order, sellerId) => {
  const o = order.toObject();
  o.items = o.items.filter((i) => String(i.seller) === String(sellerId));
  o.sellerTotal = o.items.reduce((s, i) => s + i.price * i.quantity, 0);
  return o;
};

const restoreStock = (items) =>
  Promise.all(items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { quantity: i.quantity } })));

exports.createOrder = asyncHandler(async (req, res) => {
  const { items, deliveryLocation } = req.body;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Your cart is empty' });
  if (!str(deliveryLocation)) return res.status(400).json({ message: 'Delivery location is required' });

  // merge duplicates and validate quantities
  const merged = new Map();
  for (const it of items) {
    const qty = Number(it.quantity);
    if (!it.productId || !Number.isInteger(qty) || qty < 1) return res.status(400).json({ message: 'Invalid item quantity' });
    merged.set(String(it.productId), (merged.get(String(it.productId)) || 0) + qty);
  }

  const reserved = [];
  const orderItems = [];
  try {
    for (const [productId, qty] of merged) {
      // atomic stock reservation prevents overselling
      const product = await Product.findOneAndUpdate(
        { _id: productId, isAvailable: true, quantity: { $gte: qty } },
        { $inc: { quantity: -qty } },
        { new: true }
      );
      if (!product) {
        await restoreStock(reserved);
        const existing = await Product.findById(productId).select('name');
        if (!existing) return res.status(404).json({ message: 'Product not found' });
        return res.status(400).json({ message: `Requested quantity is unavailable for "${existing.name}"` });
      }
      reserved.push({ product: product._id, quantity: qty });
      orderItems.push({
        product: product._id, seller: product.seller, name: product.name,
        image: product.image, price: product.price, quantity: qty,
      });
    }
    const totalAmount = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const order = await Order.create({
      customer: req.user._id, items: orderItems, totalAmount, deliveryLocation: str(deliveryLocation),
    });
    res.status(201).json({ order });
  } catch (err) {
    await restoreStock(reserved);
    throw err;
  }
});

exports.getOrders = asyncHandler(async (req, res) => {
  const { role, _id } = req.user;
  let query = {};
  if (role === 'customer') query = { customer: _id };
  else if (role === 'seller') query = { 'items.seller': _id };
  const orders = await Order.find(query).populate('customer', 'name email phone').sort({ createdAt: -1 });
  res.json({ orders: role === 'seller' ? orders.map((o) => forSeller(o, _id)) : orders });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('customer', 'name email phone');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const { role, _id } = req.user;

  if (role === 'customer') {
    if (String(order.customer._id) !== String(_id)) return res.status(403).json({ message: 'You do not have permission' });
    return res.json({ order });
  }
  if (role === 'seller') {
    if (!order.items.some((i) => String(i.seller) === String(_id))) return res.status(403).json({ message: 'You do not have permission' });
    return res.json({ order: forSeller(order, _id) });
  }
  res.json({ order });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid order status' });

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const { role, _id } = req.user;

  if (role === 'customer') {
    if (String(order.customer) !== String(_id)) return res.status(403).json({ message: 'You do not have permission' });
    if (status !== 'Cancelled') return res.status(403).json({ message: 'You do not have permission' });
    if (order.status !== 'Pending') return res.status(400).json({ message: 'Only pending orders can be cancelled' });
  } else if (role === 'seller') {
    if (!order.items.some((i) => String(i.seller) === String(_id))) return res.status(403).json({ message: 'You do not have permission' });
  }

  if (['Delivered', 'Cancelled'].includes(order.status)) {
    return res.status(400).json({ message: `Order is already ${order.status.toLowerCase()}` });
  }
  if (status === 'Cancelled') await restoreStock(order.items);
  order.status = status;
  await order.save();
  res.json({ order: role === 'seller' ? forSeller(order, _id) : order });
});
