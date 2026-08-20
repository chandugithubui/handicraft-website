const mongoose = require('mongoose');
const Product = require('./models/product');
require('dotenv').config();

// MongoDB connection - use the same as in .env
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in .env file');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Sample products with authentic Raghurajpur village art
const sampleProducts = [
  // Paintings Category - Pattachitra paintings only
  {
    name: 'Pattachitra Wall Art - Lord Jagannath',
    price: 3500,
    description: 'Authentic Pattachitra painting from Raghurajpur village, Odisha. Depicts Lord Jagannath, Balabhadra, and Subhadra. Hand-painted on treated cloth using natural mineral colors by village artisans.',
    imageUrl: '/images/pattachitra1.jpg.jpg',
    category: 'Paintings',
    material: 'Cloth',
    stock: 10,
    rating: 4.9,
    numReviews: 45
  },
  {
    name: 'Pattachitra Scroll - Ramayana',
    price: 5500,
    description: 'Large Pattachitra scroll narrating Ramayana episodes. Hand-painted by master artist from Raghurajpur using traditional techniques passed down through generations.',
    imageUrl: '/images/pattachitra2.jpg.jpg',
    category: 'Paintings',
    material: 'Cloth',
    stock: 5,
    rating: 5.0,
    numReviews: 52
  },
  {
    name: 'Pattachitra Painting - Tree of Life',
    price: 3800,
    description: 'Traditional Tree of Life Pattachitra painting. Symbolizes growth and prosperity. Hand-painted with natural colors on treated cloth by village artist.',
    imageUrl: '/images/pattachitra3.jpg.jpg',
    category: 'Paintings',
    material: 'Cloth',
    stock: 10,
    rating: 4.9,
    numReviews: 40
  },
  {
    name: 'Pattachitra Wall Hanging',
    price: 4200,
    description: 'Large Pattachitra wall hanging featuring village life scenes. Vibrant colors and intricate details showcase the rich cultural heritage of Raghurajpur.',
    imageUrl: '/images/pattachitrawall.jpg',
    category: 'Paintings',
    material: 'Cloth',
    stock: 12,
    rating: 4.8,
    numReviews: 35
  },
  {
    name: 'Pattachitra Wall Painting',
    price: 4500,
    description: 'Traditional Pattachitra wall painting with intricate details. Features mythological scenes painted using natural colors.',
    imageUrl: '/images/pattachitrawallpainting.webp',
    category: 'Paintings',
    material: 'Cloth',
    stock: 8,
    rating: 4.7,
    numReviews: 28
  },
  {
    name: 'Tiled Pattachitra Art',
    price: 2800,
    description: 'Beautiful tiled Pattachitra artwork. Each tile tells a different story from Odisha mythology.',
    imageUrl: '/images/tilledpattachitra.webp',
    category: 'Paintings',
    material: 'Cloth',
    stock: 15,
    rating: 4.6,
    numReviews: 22
  },

  // Palm Leaf Art Category - Palm leaf engravings only
  {
    name: 'Palm Leaf Engraving - Radha Krishna',
    price: 2800,
    description: 'Traditional Talapatra Chitra (palm leaf engraving) from Raghurajpur. Intricate carving on dried palm leaves depicting divine love of Radha Krishna.',
    imageUrl: '/images/pattachitra1.jpg.jpeg',
    category: 'Palm Leaf',
    material: 'Palm Leaf',
    stock: 15,
    rating: 4.8,
    numReviews: 38
  },
  {
    name: 'Palm Leaf Engraving - Village Life',
    price: 3200,
    description: 'Palm leaf engraving depicting village life and daily activities of Raghurajpur artisans. Each stroke tells a story.',
    imageUrl: '/images/pattachitra2.jpg.jpeg',
    category: 'Palm Leaf',
    material: 'Palm Leaf',
    stock: 10,
    rating: 4.7,
    numReviews: 25
  },
  {
    name: 'Palm Leaf Bookmark Set',
    price: 600,
    description: 'Set of 5 palm leaf bookmarks with traditional engravings. Each bookmark features different motifs from Odisha culture.',
    imageUrl: '/images/pattachitra3.jpg.jpeg',
    category: 'Palm Leaf',
    material: 'Palm Leaf',
    stock: 40,
    rating: 4.6,
    numReviews: 22
  },
  {
    name: 'Palm Leaf Lamp Shade',
    price: 2200,
    description: 'Unique lamp shade made from engraved palm leaves. Creates beautiful patterns when lit. Traditional craft with modern utility.',
    imageUrl: '/images/teapot.webp',
    category: 'Palm Leaf',
    material: 'Palm Leaf',
    stock: 10,
    rating: 4.7,
    numReviews: 18
  },

  // Sarees Category - Handwoven sarees only
  {
    name: 'Handpainted Saree - Pattachitra Border',
    price: 8500,
    description: 'Beautiful cotton saree with hand-painted Pattachitra border. Each motif tells a story from Odisha mythology. Painted by Raghurajpur women artisans.',
    imageUrl: '/images/handcraftedwoodenBowl2.jpg',
    category: 'Sarees',
    material: 'Cotton',
    stock: 8,
    rating: 4.9,
    numReviews: 28
  },
  {
    name: 'Handwoven Saree - Ikat Pattern',
    price: 6500,
    description: 'Traditional Odisha Ikat saree with handwoven patterns. Natural dyes used for vibrant colors. Woven by skilled weavers from nearby villages.',
    imageUrl: '/images/handcraftedwoodenBowl3.webp',
    category: 'Sarees',
    material: 'Silk Blend',
    stock: 12,
    rating: 4.8,
    numReviews: 32
  },

  // Wooden Crafts Category - Wooden handicrafts
  {
    name: 'Handcrafted Wooden Bowl',
    price: 1200,
    description: 'Beautiful wooden bowl handcrafted by skilled artisans using traditional techniques. Perfect for serving or decoration.',
    imageUrl: '/images/HandcraftedWoodenBowl.webp',
    category: 'Wooden Crafts',
    material: 'Wood',
    stock: 20,
    rating: 4.9,
    numReviews: 30
  },
  {
    name: 'Wooden Mask - Traditional',
    price: 1800,
    description: 'Hand-carved wooden mask from Raghurajpur artisans. Used in traditional dance performances. Features intricate carvings and natural finish.',
    imageUrl: '/images/carvedwooden.jpg',
    category: 'Wooden Crafts',
    material: 'Wood',
    stock: 15,
    rating: 4.7,
    numReviews: 25
  },
  {
    name: 'Wooden Sculpture - Village Scene',
    price: 4500,
    description: 'Hand-carved wooden sculpture depicting village life. Shows artisans at work in Raghurajpur. Detailed carving by master craftsman.',
    imageUrl: '/images/woodenhandcraft.jpg',
    category: 'Wooden Crafts',
    material: 'Wood',
    stock: 5,
    rating: 4.9,
    numReviews: 15
  },
  {
    name: 'Wooden Tray - Traditional',
    price: 1500,
    description: 'Hand-carved wooden tray with traditional motifs. Perfect for serving or decorative use.',
    imageUrl: '/images/woodentray.jpg',
    category: 'Wooden Crafts',
    material: 'Wood',
    stock: 18,
    rating: 4.6,
    numReviews: 20
  },
  {
    name: 'Wooden Toys Set',
    price: 800,
    description: 'Set of hand-carved wooden toys. Traditional designs passed down through generations.',
    imageUrl: '/images/woodentoys.jpg',
    category: 'Wooden Crafts',
    material: 'Wood',
    stock: 25,
    rating: 4.5,
    numReviews: 18
  }
];

// Seed the database
async function seedDatabase() {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${insertedProducts.length} sample products`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
