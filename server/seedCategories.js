const mongoose = require('mongoose');
const Category = require('./models/category');
const path = require('path');
const fs = require('fs');

// Load .env file manually
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log('Loaded .env from:', envPath);
} else {
  console.error('.env file not found at:', envPath);
}

// MongoDB connection - use the same as in .env
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in .env file');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Sample categories
const sampleCategories = [
  {
    name: 'Paintings',
    description: 'Traditional Pattachitra paintings from Raghurajpur village, Odisha. Hand-painted on treated cloth using natural mineral colors.'
  },
  {
    name: 'Palm Leaf',
    description: 'Traditional Talapatra Chitra (palm leaf engraving) from Raghurajpur. Intricate carvings on dried palm leaves depicting mythological scenes.'
  },
  {
    name: 'Sarees',
    description: 'Handwoven and hand-painted sarees featuring traditional Odisha patterns and Pattachitra borders.'
  },
  {
    name: 'Wooden Crafts',
    description: 'Hand-carved wooden handicrafts including bowls, masks, sculptures, and traditional toys by skilled artisans.'
  }
];

// Seed the database
async function seedDatabase() {
  try {
    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert sample categories
    const insertedCategories = await Category.insertMany(sampleCategories);
    console.log(`Inserted ${insertedCategories.length} sample categories`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
