const mongoose = require('mongoose');
const Product = require('./models/product');
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

// Sample products with authentic Raghurajpur village art - 35 products matching frontend catalogue
const sampleProducts = [
  // Pattachitra (5 products)
  {
    name: 'Lord Jagannath Pattachitra',
    price: 4500,
    description: 'Traditional Pattachitra painting depicting Lord Jagannath with intricate details and natural colors',
    imageUrl: '/images/pattachitra1.jpg.jpg',
    category: 'pattachitra',
    material: 'Fabric',
    stock: 10,
    rating: 4.9,
    numReviews: 45
  },
  {
    name: 'Jagannath Temple Scene',
    price: 3800,
    description: 'Beautiful portrayal of Jagannath temple with traditional Pattachitra art style',
    imageUrl: '/images/jagannathpainting.jpg',
    category: 'pattachitra',
    material: 'Fabric',
    stock: 12,
    rating: 4.8,
    numReviews: 35
  },
  {
    name: 'Kurma Avatar Painting',
    price: 5200,
    description: 'Mythological painting of Lord Vishnu in Kurma avatar form',
    imageUrl: '/images/kurmaavatar.jpg',
    category: 'pattachitra',
    material: 'Fabric',
    stock: 8,
    rating: 4.9,
    numReviews: 28
  },
  {
    name: 'Tiled Pattachitra Panel',
    price: 2500,
    description: 'Beautiful tiled Pattachitra panel with traditional motifs',
    imageUrl: '/images/tilledpattachitra.webp',
    category: 'pattachitra',
    material: 'Fabric',
    stock: 15,
    rating: 4.6,
    numReviews: 22
  },
  {
    name: 'Pattachitra Wall Art',
    price: 6500,
    description: 'Large Pattachitra wall painting depicting Hindu mythology',
    imageUrl: '/images/pattachitrawall.jpg',
    category: 'pattachitra',
    material: 'Fabric',
    stock: 5,
    rating: 5.0,
    numReviews: 52
  },

  // Palm Leaf (4 products)
  {
    name: 'Palm Leaf Tray',
    price: 1800,
    description: 'Intricately engraved palm leaf tray with traditional patterns',
    imageUrl: '/images/woodentray.jpg',
    category: 'palm-leaf',
    material: 'Bamboo',
    stock: 18,
    rating: 4.6,
    numReviews: 20
  },
  {
    name: 'Palm Leaf Teapot Design',
    price: 1200,
    description: 'Artistic engraving of traditional teapot on palm leaf',
    imageUrl: '/images/teapot.webp',
    category: 'palm-leaf',
    material: 'Bamboo',
    stock: 20,
    rating: 4.5,
    numReviews: 18
  },
  {
    name: 'Pattachitra Wall Painting',
    price: 2200,
    description: 'Palm leaf wall art with traditional Pattachitra motifs',
    imageUrl: '/images/pattachitrawallpainting.webp',
    category: 'palm-leaf',
    material: 'Bamboo',
    stock: 15,
    rating: 4.7,
    numReviews: 25
  },
  {
    name: 'Pattachitra Art Panel',
    price: 2800,
    description: 'Traditional Pattachitra art on palm leaf panel',
    imageUrl: '/images/pattachitra1.jpg.jpeg',
    category: 'palm-leaf',
    material: 'Bamboo',
    stock: 15,
    rating: 4.8,
    numReviews: 38
  },

  // Sarees (3 products)
  {
    name: 'Handwoven Sambalpuri Saree',
    price: 8500,
    description: 'Traditional handwoven Sambalpuri saree with ikat patterns',
    imageUrl: '/images/pattachitra2.jpg.jpg',
    category: 'sarees',
    material: 'Fabric',
    stock: 8,
    rating: 4.9,
    numReviews: 28
  },
  {
    name: 'Traditional Ikat Saree',
    price: 7200,
    description: 'Beautiful ikat saree with traditional Odisha patterns',
    imageUrl: '/images/pattachitra2.jpg.jpeg',
    category: 'sarees',
    material: 'Fabric',
    stock: 12,
    rating: 4.8,
    numReviews: 32
  },
  {
    name: 'Bomkai Handloom Saree',
    price: 9200,
    description: 'Authentic Bomkai handloom saree with temple border',
    imageUrl: '/images/pattachitra3.jpg.jpg',
    category: 'sarees',
    material: 'Fabric',
    stock: 6,
    rating: 4.9,
    numReviews: 15
  },

  // Wooden Crafts (6 products)
  {
    name: 'Decorative Wooden Plate',
    price: 2200,
    description: 'Hand-carved decorative plate with floral patterns',
    imageUrl: '/images/decorativeplate.webp',
    category: 'wooden',
    material: 'Wood',
    stock: 15,
    rating: 4.7,
    numReviews: 25
  },
  {
    name: 'Handcrafted Wooden Vase',
    price: 3500,
    description: 'Elegant wooden vase with carved motifs',
    imageUrl: '/images/handmadevase.webp',
    category: 'wooden',
    material: 'Wood',
    stock: 10,
    rating: 4.8,
    numReviews: 30
  },
  {
    name: 'Metal Lamp Stand',
    price: 1800,
    description: 'Traditional metal lamp with wooden base',
    imageUrl: '/images/metallamp.jpg',
    category: 'wooden',
    material: 'Metal',
    stock: 12,
    rating: 4.6,
    numReviews: 22
  },
  {
    name: 'Handcrafted Wooden Bowl',
    price: 2800,
    description: 'Beautiful wooden bowl with intricate carvings',
    imageUrl: '/images/handcraftedwoodenBowl2.jpg',
    category: 'wooden',
    material: 'Wood',
    stock: 18,
    rating: 4.7,
    numReviews: 28
  },
  {
    name: 'Carved Wooden Handcraft',
    price: 3200,
    description: 'Intricately carved wooden handicraft piece',
    imageUrl: '/images/carvedwooden.jpg',
    category: 'wooden',
    material: 'Wood',
    stock: 10,
    rating: 4.8,
    numReviews: 20
  },
  {
    name: 'Wooden Handcraft Art',
    price: 2900,
    description: 'Traditional wooden handcraft with artistic carvings',
    imageUrl: '/images/woodenhandcraft.jpg',
    category: 'wooden',
    material: 'Wood',
    stock: 14,
    rating: 4.7,
    numReviews: 24
  },

  // Sculptures (4 products)
  {
    name: 'Brass Sculpture',
    price: 4500,
    description: 'Traditional brass sculpture with intricate details',
    imageUrl: '/images/sculpture.webp',
    category: 'sculptures',
    material: 'Metal',
    stock: 8,
    rating: 4.9,
    numReviews: 30
  },
  {
    name: 'Elephant Figurine',
    price: 3500,
    description: 'Handcrafted elephant sculpture in traditional style',
    imageUrl: '/images/elephant.webp',
    category: 'sculptures',
    material: 'Metal',
    stock: 12,
    rating: 4.7,
    numReviews: 25
  },
  {
    name: 'Decorative Toys',
    price: 1500,
    description: 'Traditional wooden toys set with hand-painted details',
    imageUrl: '/images/toys.jpg',
    category: 'sculptures',
    material: 'Wood',
    stock: 25,
    rating: 4.5,
    numReviews: 18
  },
  {
    name: 'Wooden Toys Set',
    price: 1800,
    description: 'Traditional wooden toys for children',
    imageUrl: '/images/woodentoys.jpg',
    category: 'sculptures',
    material: 'Wood',
    stock: 25,
    rating: 4.5,
    numReviews: 18
  },

  // Home Decor (5 products)
  {
    name: 'Home Decor Vase',
    price: 2900,
    description: 'Elegant home decor vase with hand-painted design',
    imageUrl: '/images/handcraftvase.jpg',
    category: 'decor',
    material: 'Clay',
    stock: 15,
    rating: 4.6,
    numReviews: 22
  },
  {
    name: 'Clay Pot',
    price: 1200,
    description: 'Traditional clay pottery with artistic design',
    imageUrl: '/images/claypot.jpg',
    category: 'decor',
    material: 'Clay',
    stock: 20,
    rating: 4.5,
    numReviews: 18
  },
  {
    name: 'Glass Bottle Art',
    price: 1800,
    description: 'Hand-painted glass bottle with traditional motifs',
    imageUrl: '/images/glassbottle.webp',
    category: 'decor',
    material: 'Clay',
    stock: 18,
    rating: 4.6,
    numReviews: 20
  },
  {
    name: 'Handcrafted Wooden Bowl Premium',
    price: 3200,
    description: 'Premium wooden bowl with artistic carvings',
    imageUrl: '/images/handcraftedwoodenBowl3.webp',
    category: 'decor',
    material: 'Wood',
    stock: 12,
    rating: 4.8,
    numReviews: 32
  },
  {
    name: 'Handcrafted Wooden Bowl Classic',
    price: 2400,
    description: 'Classic wooden bowl for home decor',
    imageUrl: '/images/HandcraftedWoodenBowl.webp',
    category: 'decor',
    material: 'Wood',
    stock: 20,
    rating: 4.9,
    numReviews: 30
  },

  // Gifts (4 products)
  {
    name: 'Gift Items Set',
    price: 3200,
    description: 'Handcrafted gift collection with multiple items',
    imageUrl: '/images/GiftsItems.webp',
    category: 'gifts',
    material: 'Wood',
    stock: 15,
    rating: 4.7,
    numReviews: 25
  },
  {
    name: 'Related Product Set',
    price: 2800,
    description: 'Curated gift set with related handicraft items',
    imageUrl: '/images/relatedProduct.webp',
    category: 'gifts',
    material: 'Wood',
    stock: 12,
    rating: 4.6,
    numReviews: 20
  },
  {
    name: 'Traditional Craft Gift',
    price: 3600,
    description: 'Traditional handicraft gift collection',
    imageUrl: '/images/pattachitra3.jpg.jpeg',
    category: 'gifts',
    material: 'Fabric',
    stock: 10,
    rating: 4.8,
    numReviews: 22
  },
  {
    name: 'Wooden Craft Gift Set',
    price: 4200,
    description: 'Wooden handicraft gift collection',
    imageUrl: '/images/handcraftwooden.jpg',
    category: 'gifts',
    material: 'Wood',
    stock: 8,
    rating: 4.9,
    numReviews: 28
  },

  // Additional products for better material distribution
  {
    name: 'Stone Sculpture',
    price: 5500,
    description: 'Traditional stone sculpture with intricate carvings',
    imageUrl: '/images/sculpture.webp',
    category: 'sculptures',
    material: 'Stone',
    stock: 5,
    rating: 4.9,
    numReviews: 15
  },
  {
    name: 'Clay Decorative Pot',
    price: 1600,
    description: 'Handcrafted clay pot with traditional designs',
    imageUrl: '/images/claypot.jpg',
    category: 'decor',
    material: 'Clay',
    stock: 20,
    rating: 4.5,
    numReviews: 18
  },
  {
    name: 'Metal Wall Art',
    price: 2800,
    description: 'Traditional metal wall art piece',
    imageUrl: '/images/metallamp.jpg',
    category: 'decor',
    material: 'Metal',
    stock: 10,
    rating: 4.7,
    numReviews: 25
  },
  {
    name: 'Bamboo Basket',
    price: 1400,
    description: 'Handwoven bamboo basket for storage',
    imageUrl: '/images/woodentray.jpg',
    category: 'decor',
    material: 'Bamboo',
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
