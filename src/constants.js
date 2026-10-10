export const CATEGORIES = [
  { name: 'Groceries', emoji: '🥬', hue: 140 },
  { name: 'Electronics', emoji: '🎧', hue: 215 },
  { name: 'Clothing', emoji: '👕', hue: 280 },
  { name: 'Handmade', emoji: '🏺', hue: 25 },
  { name: 'Food', emoji: '🍲', hue: 10 },
  { name: 'Home & Kitchen', emoji: '🍳', hue: 45 },
  { name: 'Books', emoji: '📚', hue: 190 },
  { name: 'Personal Care', emoji: '🧼', hue: 330 },
];
export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Delivered', 'Cancelled'];
export const inr = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export const homeFor = (role) => (role === 'seller' ? '/seller' : role === 'admin' ? '/admin' : '/dashboard');
