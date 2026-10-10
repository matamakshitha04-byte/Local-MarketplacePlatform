const { CATEGORIES } = require('./constants');

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRe = /^\d{10}$/;
const str = (v) => (typeof v === 'string' ? v.trim() : '');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const validateRegister = (b) => {
  if (!str(b.name) || str(b.name).length < 2) return 'Full name is required (min 2 characters)';
  if (!emailRe.test(str(b.email))) return 'Enter a valid email address';
  if (!phoneRe.test(str(b.phone))) return 'Phone number must be 10 digits';
  if (typeof b.password !== 'string' || b.password.length < 6) return 'Password must be at least 6 characters';
  if (!/[A-Za-z]/.test(b.password) || !/\d/.test(b.password)) return 'Password must contain letters and numbers';
  if (b.password !== b.confirmPassword) return 'Passwords do not match';
  if (!['customer', 'seller'].includes(b.role)) return 'Role must be customer or seller';
  if (!str(b.location)) return 'Location is required';
  if (b.role === 'seller') {
    if (!str(b.shopName)) return 'Shop name is required for sellers';
    if (!str(b.shopAddress)) return 'Shop address is required for sellers';
  }
  return null;
};

// partial=true for updates: only validates fields that are present
const validateProduct = (b, partial = false) => {
  const has = (k) => b[k] !== undefined;
  if (!partial || has('name')) if (!str(b.name)) return 'Product name is required';
  if (!partial || has('description')) if (!str(b.description)) return 'Description is required';
  if (!partial || has('category')) if (!CATEGORIES.includes(b.category)) return 'Select a valid category';
  if (!partial || has('price')) {
    const p = Number(b.price);
    if (b.price === '' || b.price === null || Number.isNaN(p) || p < 0) return 'Price must be a number that is not negative';
  }
  if (!partial || has('quantity')) {
    const q = Number(b.quantity);
    if (b.quantity === '' || b.quantity === null || !Number.isInteger(q) || q < 0) return 'Quantity must be a whole number that is not negative';
  }
  if (!partial || has('location')) if (!str(b.location)) return 'Location is required';
  return null;
};

module.exports = { validateRegister, validateProduct, escapeRegex, str, emailRe };
