const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { validateProduct, escapeRegex, str } = require('../utils/validators');
const { CATEGORIES } = require('../utils/constants');

const SELLER_FIELDS = 'name shopName shopAddress location phone';

exports.getProducts = asyncHandler(async (req, res) => {
  const { q, category, location, minPrice, maxPrice, availability, sort } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 48);

  const filter = {};
  if (availability !== 'all') { filter.isAvailable = true; filter.quantity = { $gt: 0 }; }
  if (category && CATEGORIES.includes(category)) filter.category = category;
  if (location) filter.location = new RegExp(escapeRegex(String(location).trim()), 'i');
  if (minPrice !== undefined && minPrice !== '' || maxPrice !== undefined && maxPrice !== '') {
    filter.price = {};
    if (minPrice !== undefined && minPrice !== '' && !Number.isNaN(Number(minPrice))) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined && maxPrice !== '' && !Number.isNaN(Number(maxPrice))) filter.price.$lte = Number(maxPrice);
    if (!Object.keys(filter.price).length) delete filter.price;
  }
  if (q && String(q).trim()) {
    const rx = new RegExp(escapeRegex(String(q).trim()), 'i');
    const sellers = await User.find({ role: 'seller', $or: [{ name: rx }, { shopName: rx }] }).select('_id');
    filter.$or = [{ name: rx }, { category: rx }, { location: rx }, { seller: { $in: sellers.map((s) => s._id) } }];
  }

  const sortMap = { price_asc: { price: 1 }, price_desc: { price: -1 }, newest: { createdAt: -1 } };
  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate('seller', SELLER_FIELDS)
    .sort(sortMap[sort] || sortMap.newest)
    .skip((page - 1) * limit).limit(limit);

  res.json({ products, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('seller', SELLER_FIELDS);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ product });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const error = validateProduct(req.body);
  if (error) return res.status(400).json({ message: error });
  const b = req.body;
  const product = await Product.create({
    name: str(b.name), description: str(b.description), category: b.category,
    price: Number(b.price), quantity: Number(b.quantity),
    location: str(b.location) || req.user.location, image: str(b.image),
    isAvailable: b.isAvailable === undefined ? true : Boolean(b.isAvailable),
    seller: req.user._id,
  });
  res.status(201).json({ product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (String(product.seller) !== String(req.user._id)) {
    return res.status(403).json({ message: 'You do not have permission' });
  }
  const error = validateProduct(req.body, true);
  if (error) return res.status(400).json({ message: error });

  const b = req.body;
  ['name', 'description', 'location', 'image'].forEach((k) => { if (b[k] !== undefined) product[k] = str(b[k]); });
  if (b.category !== undefined) product.category = b.category;
  if (b.price !== undefined) product.price = Number(b.price);
  if (b.quantity !== undefined) product.quantity = Number(b.quantity);
  if (b.isAvailable !== undefined) product.isAvailable = Boolean(b.isAvailable);
  await product.save();
  res.json({ product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (String(product.seller) !== String(req.user._id)) {
    return res.status(403).json({ message: 'You do not have permission' });
  }
  await product.deleteOne();
  res.json({ message: 'Product deleted' });
});

exports.getSellerProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
  res.json({ products });
});
