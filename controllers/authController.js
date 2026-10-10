const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const { validateRegister, str, emailRe } = require('../utils/validators');

const publicUser = (u) => ({
  _id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role,
  location: u.location, shopName: u.shopName, shopAddress: u.shopAddress, createdAt: u.createdAt,
});

exports.register = asyncHandler(async (req, res) => {
  const error = validateRegister(req.body);
  if (error) return res.status(400).json({ message: error });

  const email = str(req.body.email).toLowerCase();
  if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });

  const isSeller = req.body.role === 'seller';
  const user = await User.create({
    name: str(req.body.name), email, phone: str(req.body.phone), password: req.body.password,
    role: req.body.role, location: str(req.body.location),
    shopName: isSeller ? str(req.body.shopName) : undefined,
    shopAddress: isSeller ? str(req.body.shopAddress) : undefined,
  });
  res.status(201).json({ token: generateToken(user._id), user: publicUser(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const email = str(req.body.email).toLowerCase();
  const password = req.body.password;
  if (!emailRe.test(email) || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  if (!user.isActive) return res.status(403).json({ message: 'Your account has been disabled' });
  res.json({ token: generateToken(user._id), user: publicUser(user) });
});

exports.getMe = (req, res) => res.json({ user: publicUser(req.user) });

exports.updateMe = asyncHandler(async (req, res) => {
  const u = req.user;
  const { name, phone, location, shopName, shopAddress } = req.body;
  if (name !== undefined) { if (str(name).length < 2) return res.status(400).json({ message: 'Name is required' }); u.name = str(name); }
  if (phone !== undefined) { if (!/^\d{10}$/.test(str(phone))) return res.status(400).json({ message: 'Phone number must be 10 digits' }); u.phone = str(phone); }
  if (location !== undefined) { if (!str(location)) return res.status(400).json({ message: 'Location is required' }); u.location = str(location); }
  if (u.role === 'seller') {
    if (shopName !== undefined) { if (!str(shopName)) return res.status(400).json({ message: 'Shop name is required' }); u.shopName = str(shopName); }
    if (shopAddress !== undefined) { if (!str(shopAddress)) return res.status(400).json({ message: 'Shop address is required' }); u.shopAddress = str(shopAddress); }
  }
  await u.save();
  res.json({ user: publicUser(u) });
});
