const mongoose = require('mongoose');
require('dotenv').config({
  path: require('path').join(__dirname, '..', '.env'),
});

const Product = require('./models/Product');

const imageMap = {
  'Organic Basmati Rice 5kg': '/images/rice.jpg',
  'Cold-Pressed Groundnut Oil 1L': '/images/oil.jpg',
  'Fresh Seasonal Fruit Box': '/images/fruits.jpg',
  'Homemade Mango Pickle 500g': '/images/pickle.jpg',
  'Herbal Neem Soap (Pack of 3)': '/images/soap.jpg',
  'Stainless Steel Lunch Box': '/images/lunchbox.jpg',
  'Handwoven Cotton Kurta': '/images/kurta.jpg',
  'Terracotta Plant Pots (Set of 4)': '/images/pots.jpg',
  'Bluetooth Earbuds': '/images/earbuds.jpg',
  'USB-C Fast Charger 30W': '/images/charger.jpg',
  'Used Engineering Maths Textbook': '/images/textbook.jpg',
  'Jute Shoulder Bag': '/images/bag.jpg',
};

async function updateImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const [name, image] of Object.entries(imageMap)) {
      const result = await Product.updateOne(
        { name },
        { $set: { image } }
      );

      console.log(
        `${name}: ${result.matchedCount ? 'Updated' : 'Product not found'}`
      );
    }

    console.log('Image paths update complete!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

updateImages();