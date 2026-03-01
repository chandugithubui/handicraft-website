const mongoose = require('mongoose');
const Product = require('./models/product');
const Category = require('./models/category');
require('dotenv').config();

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check products
    const products = await Product.find();
    console.log(`\nProducts in database: ${products.length}`);
    products.forEach(product => {
      console.log(`- ${product.name} (${product.price})`);
    });

    // Check categories
    const categories = await Category.find();
    console.log(`\nCategories in database: ${categories.length}`);
    categories.forEach(category => {
      console.log(`- ${category.name}`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkDatabase();
