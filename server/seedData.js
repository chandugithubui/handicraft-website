const mongoose = require('mongoose');
const Product = require('./models/product');
require('dotenv').config();

// Sample products data
const sampleProducts = [
  {
    name: "Traditional Pattachitra Painting - Lord Jagannath",
    price: 8500,
    originalPrice: 10000,
    description: "A beautiful traditional Pattachitra painting depicting Lord Jagannath, Balabhadra, and Subhadra. Hand-painted by master artisans of Raghurajpur using natural colors on treated cotton canvas.",
    image: "/images/jagannath-pattachitra.jpg",
    images: [
      "/images/jagannath-pattachitra-1.jpg",
      "/images/jagannath-pattachitra-2.jpg",
      "/images/jagannath-pattachitra-3.jpg"
    ],
    rating: 5,
    reviews: 8,
    isNew: true,
    discount: 15,
    stock: 5,
    details: {
      material: "Natural colors on treated cotton canvas",
      dimensions: "24 x 18 inches",
      weight: "200 grams",
      artisan: "Raghunath Moharana",
      origin: "Raghurajpur, Puri"
    }
  },
  {
    name: "Krishna Leela Pattachitra Art",
    price: 6500,
    originalPrice: 7500,
    description: "Exquisite Pattachitra painting showcasing Krishna's divine leela. Intricate details and vibrant colors bring this mythological scene to life.",
    image: "/images/krishna-leela.jpg",
    images: [
      "/images/krishna-leela-1.jpg",
      "/images/krishna-leela-2.jpg"
    ],
    rating: 4,
    reviews: 12,
    isNew: false,
    discount: 13,
    stock: 8,
    details: {
      material: "Natural pigments on palm leaf",
      dimensions: "18 x 12 inches",
      weight: "150 grams",
      artisan: "Sushila Maharana",
      origin: "Raghurajpur, Puri"
    }
  },
  {
    name: "Radha Krishna Pattachitra",
    price: 5500,
    originalPrice: 6500,
    description: "Romantic depiction of Radha and Krishna in traditional Pattachitra style. Perfect for home decoration and spiritual ambiance.",
    image: "/images/radha-krishna.jpg",
    images: [
      "/images/radha-krishna-1.jpg",
      "/images/radha-krishna-2.jpg"
    ],
    rating: 4,
    reviews: 6,
    isNew: false,
    discount: 15,
    stock: 10,
    details: {
      material: "Natural colors on treated cotton",
      dimensions: "20 x 16 inches",
      weight: "180 grams",
      artisan: "Prakash Das",
      origin: "Raghurajpur, Puri"
    }
  },
  {
    name: "Tree of Life Pattachitra",
    price: 4500,
    originalPrice: 5500,
    description: "Traditional Tree of Life motif in Pattachitra art. Symbolizes prosperity and eternal life, perfect for auspicious home decor.",
    image: "/images/tree-of-life.jpg",
    images: [
      "/images/tree-of-life-1.jpg",
      "/images/tree-of-life-2.jpg"
    ],
    rating: 5,
    reviews: 4,
    isNew: true,
    discount: 18,
    stock: 7,
    details: {
      material: "Natural pigments on cotton canvas",
      dimensions: "16 x 16 inches",
      weight: "160 grams",
      artisan: "Raghunath Moharana",
      origin: "Raghurajpur, Puri"
    }
  },
  {
    name: "Pattachitra Wall Decor Set",
    price: 3500,
    originalPrice: 4000,
    description: "Set of 3 small Pattachitra paintings perfect for wall decoration. Each piece tells a different story from Odisha's rich mythology.",
    image: "/images/wall-decor-set.jpg",
    images: [
      "/images/wall-decor-1.jpg",
      "/images/wall-decor-2.jpg",
      "/images/wall-decor-3.jpg"
    ],
    rating: 4,
    reviews: 9,
    isNew: false,
    discount: 12,
    stock: 15,
    details: {
      material: "Natural colors on mini canvas",
      dimensions: "8 x 8 inches each",
      weight: "100 grams per piece",
      artisan: "Various artisans",
      origin: "Raghurajpur, Puri"
    }
  }
];

// Seed the database
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log('Sample products inserted successfully');

    // Disconnect from database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seedDatabase();
