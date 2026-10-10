const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Authentication required' });
    if (!user.isActive) return res.status(403).json({ message: 'Your account has been disabled' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Authentication required' });
  }
};

const roleMiddleware = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission' });
  }
  next();
};

module.exports = { authMiddleware, roleMiddleware };
