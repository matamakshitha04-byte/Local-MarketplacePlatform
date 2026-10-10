const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

(async () => {
  const password = process.env.SEED_PASSWORD;
  if (!process.env.MONGO_URI || !password) {
    console.error('Set MONGO_URI and SEED_PASSWORD in .env before seeding.');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany({}), Product.deleteMany({}), Order.deleteMany({})]);

  // create() so the bcrypt pre-save hook hashes each password
  const mk = (d) => User.create({ password, ...d });
  await mk({ name: 'Market Admin', email: 'admin@localmarket.com', phone: '9000000000', role: 'admin', location: 'Hyderabad' });
  const s1 = await mk({ name: 'Ravi Kumar', email: 'ravi@localmarket.com', phone: '9111111111', role: 'seller', location: 'Banjara Hills', shopName: 'Ravi Fresh Mart', shopAddress: 'Road No. 12, Banjara Hills, Hyderabad' });
  const s2 = await mk({ name: 'Anita Rao', email: 'anita@localmarket.com', phone: '9222222222', role: 'seller', location: 'Madhapur', shopName: 'Anita Crafts & Gadgets', shopAddress: 'Plot 45, Madhapur, Hyderabad' });
  await mk({ name: 'Priya Sharma', email: 'priya@localmarket.com', phone: '9333333333', role: 'customer', location: 'Jubilee Hills' });
  await mk({ name: 'Arjun Reddy', email: 'arjun@localmarket.com', phone: '9444444444', role: 'customer', location: 'Madhapur' });
  await mk({ name: 'Sneha Iyer', email: 'sneha@localmarket.com', phone: '9555555555', role: 'customer', location: 'Gachibowli' });

 const p = (seller, name, category, price, quantity, description, image, location) => ({
  seller: seller._id,
  name,
  category,
  price,
  quantity,
  description,
  location: location || seller.location,
  image,
  isAvailable: true
});
  await Product.insertMany([
  p(s1, 'Organic Basmati Rice 5kg', 'Groceries', 549, 40, 'Aged long-grain basmati rice sourced from local farms.', '/images/rice.jpg'),
  p(s1, 'Cold-Pressed Groundnut Oil 1L', 'Groceries', 285, 25, 'Traditional wooden-press oil, no additives.', '/images/oil.jpg'),
  p(s1, 'Fresh Seasonal Fruit Box', 'Food', 399, 15, 'A mixed box of fruit picked this morning.', '/images/fruits.jpg'),
  p(s1, 'Homemade Mango Pickle 500g', 'Food', 220, 30, 'Small-batch Andhra-style avakaya pickle.', '/images/pickle.jpg'),
  p(s1, 'Herbal Neem Soap (Pack of 3)', 'Personal Care', 150, 60, 'Handmade neem and tulsi soap bars.', '/images/soap.jpg'),
  p(s1, 'Stainless Steel Lunch Box', 'Home & Kitchen', 480, 0, 'Three-tier insulated tiffin carrier.', '/images/lunchbox.jpg'),
  p(s2, 'Handwoven Cotton Kurta', 'Clothing', 899, 12, 'Breathable handloom cotton, available in blue and white.', '/images/kurta.jpg'),
  p(s2, 'Terracotta Plant Pots (Set of 4)', 'Handmade', 650, 20, 'Hand-painted pots for balcony gardens.', '/images/pots.jpg'),
  p(s2, 'Bluetooth Earbuds', 'Electronics', 1499, 18, 'Wireless earbuds with 24-hour battery case.', '/images/earbuds.jpg'),
  p(s2, 'USB-C Fast Charger 30W', 'Electronics', 799, 35, 'Compact charger compatible with most phones.', '/images/charger.jpg'),
  p(s2, 'Used Engineering Maths Textbook', 'Books', 250, 5, 'Good condition, lightly highlighted.', '/images/textbook.jpg'),
  p(s2, 'Jute Shoulder Bag', 'Handmade', 420, 14, 'Stitched by a local women’s collective.', '/images/bag.jpg')
]);
  console.log('Seed complete: 1 admin, 2 sellers, 3 customers, 12 products.');
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
