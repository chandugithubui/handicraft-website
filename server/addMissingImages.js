const mongoose = require('mongoose');
const Product = require('./models/product');
require('dotenv').config();

// Missing images that need to be added to database
const missingImages = [
  {
    name: 'Glass Bottle',
    price: 1000,
    image: '/images/glassbottle.webp',
    description: 'Decorative glass bottle with traditional Pattachitra paintings. Beautiful home decor item.',
    category: 'Home Decor',
    rating: 4.3,
    reviews: 6
  },
  {
    name: 'Fish Motif Painting',
    price: 900,
    image: '/images/fish.webp',
    description: 'Traditional fish motif representing prosperity and abundance in Odisha culture.',
    category: 'Paintings',
    rating: 4.4,
    reviews: 11
  },
  {
    name: 'Pattachitra Coasters',
    price: 400,
    image: '/images/coaster.webp',
    description: 'Set of 6 coasters with traditional Pattachitra art. Practical and beautiful.',
    category: 'Home Decor',
    rating: 4.3,
    reviews: 8
  },
  {
    name: 'Sun God Painting',
    price: 1300,
    image: '/images/sun.webp',
    description: 'Traditional Sun God motif in vibrant colors. Represents energy and life.',
    category: 'Paintings',
    rating: 4.6,
    reviews: 12
  },
  {
    name: 'Traditional Mask',
    price: 1800,
    image: '/images/mask.webp',
    description: 'Traditional Odisha tribal mask with authentic craftsmanship. Cultural artifact.',
    category: 'Home Decor',
    rating: 4.9,
    reviews: 7
  }
];

// Add missing images to database
async function addMissingImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Add missing products
    for (const imageData of missingImages) {
      const newProduct = new Product({
        name: imageData.name,
        price: imageData.price,
        image: imageData.image,
        description: imageData.description,
        category: imageData.category,
        rating: imageData.rating,
        reviews: imageData.reviews,
        stock: 10,
        isNew: false,
        discount: 0
      });

      await newProduct.save();
      console.log(`Added product: ${imageData.name}`);
    }

    // Disconnect from database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    console.log('Missing images added successfully!');
  } catch (error) {
    console.error('Error adding missing images:', error);
  }
}

// Run the function
addMissingImages();
