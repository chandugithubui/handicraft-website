const mongoose = require('mongoose');
const Product = require('./models/product');
const Category = require('./models/category');
require('dotenv').config();

// Use the live MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;

// Sample categories data
const sampleCategories = [
  {
    name: "Paintings",
    description: "Traditional Pattachitra paintings on cotton canvas and palm leaf"
  },
  {
    name: "Sculptures", 
    description: "Handcrafted wooden and stone sculptures from traditional artisans"
  },
  {
    name: "Textiles",
    description: "Handwoven textiles and traditional Odisha fabrics"
  },
  {
    name: "Home Decor",
    description: "Decorative items for home including wall art and accessories"
  }
];

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
    category: "Paintings",
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
    category: "Paintings",
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
    category: "Paintings",
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
    category: "Paintings",
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
    category: "Home Decor",
    details: {
      material: "Natural colors on mini canvas",
      dimensions: "8 x 8 inches each",
      weight: "100 grams per piece",
      artisan: "Various artisans",
      origin: "Raghurajpur, Puri"
    }
  },
  {
    name: "Wooden Sculpture - Dancing Ganesha",
    price: 12000,
    originalPrice: 15000,
    description: "Hand-carved wooden sculpture of Lord Ganesha in dancing pose. Made from premium teak wood with intricate details.",
    image: "/images/ganesha-sculpture.jpg",
    images: [
      "/images/ganesha-sculpture-1.jpg",
      "/images/ganesha-sculpture-2.jpg"
    ],
    rating: 5,
    reviews: 15,
    isNew: true,
    discount: 20,
    stock: 3,
    category: "Sculptures",
    details: {
      material: "Premium teak wood",
      dimensions: "12 x 8 x 6 inches",
      weight: "2.5 kg",
      artisan: "Ramesh Pattnaik",
      origin: "Raghurajpur, Puri"
    }
  },
  {
    name: "Traditional Odisha Wall Hanging",
    price: 2800,
    originalPrice: 3500,
    description: "Colorful wall hanging featuring traditional Odisha motifs. Perfect for adding ethnic charm to any room.",
    image: "/images/wall-hanging.jpg",
    images: [
      "/images/wall-hanging-1.jpg",
      "/images/wall-hanging-2.jpg"
    ],
    rating: 4,
    reviews: 7,
    isNew: false,
    discount: 20,
    stock: 20,
    category: "Home Decor",
    details: {
      material: "Cotton fabric with natural dyes",
      dimensions: "36 x 24 inches",
      weight: "300 grams",
      artisan: "Meera Devi",
      origin: "Raghurajpur, Puri"
    }
  },
  {
    name: "Pattachitra Coaster Set",
    price: 800,
    originalPrice: 1000,
    description: "Set of 6 coasters with Pattachitra art designs. Practical and beautiful way to protect your furniture.",
    image: "/images/coaster-set.jpg",
    images: [
      "/images/coaster-set-1.jpg",
      "/images/coaster-set-2.jpg"
    ],
    rating: 4,
    reviews: 11,
    isNew: false,
    discount: 20,
    stock: 25,
    category: "Home Decor",
    details: {
      material: "MDF wood with printed art",
      dimensions: "4 x 4 inches each",
      weight: "500 grams total",
      artisan: "Artisan Collective",
      origin: "Raghurajpur, Puri"
    }
  },
  {
    name: "Handwoven Saree",
    price: 4500,
    originalPrice: 5500,
    description: "Traditional Odisha handwoven saree with intricate Pattachitra border designs. Perfect for special occasions.",
    image: "/images/handwoven-saree.jpg",
    images: [
      "/images/handwoven-saree-1.jpg",
      "/images/handwoven-saree-2.jpg"
    ],
    rating: 5,
    reviews: 18,
    isNew: true,
    discount: 18,
    stock: 8,
    category: "Textiles",
    details: {
      material: "Pure silk with cotton blend",
      dimensions: "6.5 meters length",
      weight: "400 grams",
      artisan: "Sashi Bhanu",
      origin: "Raghurajpur, Puri"
    }
  },
  {
    name: "Stone Sculpture - Buddha",
    price: 8500,
    originalPrice: 10000,
    description: "Meditating Buddha sculpture carved from soapstone. Brings peace and tranquility to any space.",
    image: "/images/buddha-sculpture.jpg",
    images: [
      "/images/buddha-sculpture-1.jpg",
      "/images/buddha-sculpture-2.jpg"
    ],
    rating: 5,
    reviews: 9,
    isNew: false,
    discount: 15,
    stock: 5,
    category: "Sculptures",
    details: {
      material: "Soapstone",
      dimensions: "10 x 8 x 6 inches",
      weight: "3.2 kg",
      artisan: "Kamalakanta Sahoo",
      origin: "Raghurajpur, Puri"
    }
  },
  {
    name: "Pattachitra Jewelry Box",
    price: 1500,
    originalPrice: 2000,
    description: "Beautiful jewelry box adorned with Pattachitra art. Perfect for storing your precious items.",
    image: "/images/jewelry-box.jpg",
    images: [
      "/images/jewelry-box-1.jpg",
      "/images/jewelry-box-2.jpg"
    ],
    rating: 4,
    reviews: 6,
    isNew: false,
    discount: 25,
    stock: 12,
    category: "Home Decor",
    details: {
      material: "Wood with hand-painted art",
      dimensions: "8 x 6 x 4 inches",
      weight: "800 grams",
      artisan: "Loknath Das",
      origin: "Raghurajpur, Puri"
    }
  },
  {
    name: "Traditional Wall Panel",
    price: 3200,
    originalPrice: 4000,
    description: "Large wall panel with traditional Pattachitra storytelling. Makes a stunning focal point for any room.",
    image: "/images/wall-panel.jpg",
    images: [
      "/images/wall-panel-1.jpg",
      "/images/wall-panel-2.jpg"
    ],
    rating: 4,
    reviews: 8,
    isNew: true,
    discount: 20,
    stock: 6,
    category: "Home Decor",
    details: {
      material: "Wood canvas with natural colors",
      dimensions: "24 x 18 inches",
      weight: "1.2 kg",
      artisan: "Gopal Moharana",
      origin: "Raghurajpur, Puri"
    }
  },
  {
    name: "Handwoven Scarf",
    price: 1200,
    originalPrice: 1500,
    description: "Soft handwoven scarf with traditional Odisha patterns. Perfect accessory for any outfit.",
    image: "/images/handwoven-scarf.jpg",
    images: [
      "/images/handwoven-scarf-1.jpg",
      "/images/handwoven-scarf-2.jpg"
    ],
    rating: 4,
    reviews: 5,
    isNew: false,
    discount: 20,
    stock: 18,
    category: "Textiles",
    details: {
      material: "Cotton and silk blend",
      dimensions: "72 x 24 inches",
      weight: "200 grams",
      artisan: "Santi Devi",
      origin: "Raghurajpur, Puri"
    }
  },
  {
    name: "Miniature Pattachitra Set",
    price: 1800,
    originalPrice: 2500,
    description: "Set of 5 miniature Pattachitra paintings. Perfect for small spaces or as collectible items.",
    image: "/images/miniature-set.jpg",
    images: [
      "/images/miniature-set-1.jpg",
      "/images/miniature-set-2.jpg"
    ],
    rating: 5,
    reviews: 12,
    isNew: true,
    discount: 28,
    stock: 10,
    category: "Paintings",
    details: {
      material: "Natural colors on mini canvas",
      dimensions: "4 x 4 inches each",
      weight: "50 grams each",
      artisan: "Miniature Art Collective",
      origin: "Raghurajpur, Puri"
    }
  },
  {
    name: "Decorative Lamp Shade",
    price: 2200,
    originalPrice: 3000,
    description: "Hand-painted lamp shade with Pattachitra designs. Creates beautiful ambient lighting.",
    image: "/images/lamp-shade.jpg",
    images: [
      "/images/lamp-shade-1.jpg",
      "/images/lamp-shade-2.jpg"
    ],
    rating: 4,
    reviews: 4,
    isNew: false,
    discount: 27,
    stock: 8,
    category: "Home Decor",
    details: {
      material: "Fabric with hand-painted art",
      dimensions: "8 x 6 x 8 inches",
      weight: "400 grams",
      artisan: "Lighting Artisans",
      origin: "Raghurajpur, Puri"
    }
  },
  {
    name: "Wooden Wall Art Panel",
    price: 3800,
    originalPrice: 5000,
    description: "Large wooden wall panel with carved Pattachitra motifs. Adds traditional elegance to any wall.",
    image: "/images/wooden-panel.jpg",
    images: [
      "/images/wooden-panel-1.jpg",
      "/images/wooden-panel-2.jpg"
    ],
    rating: 5,
    reviews: 7,
    isNew: true,
    discount: 24,
    stock: 4,
    category: "Sculptures",
    details: {
      material: "Sheesham wood with carving",
      dimensions: "30 x 20 inches",
      weight: "2.8 kg",
      artisan: "Wood Carvers Guild",
      origin: "Raghurajpur, Puri"
    }
  }
];

// Seed the database
async function seedDatabase() {
  try {
    console.log('Connecting to live MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('Cleared existing products and categories');

    // Insert categories first
    const insertedCategories = await Category.insertMany(sampleCategories);
    console.log('Sample categories inserted successfully');

    // Create a map of category names to their ObjectIds
    const categoryMap = {};
    insertedCategories.forEach(category => {
      categoryMap[category.name] = category._id;
    });

    // Update products with category ObjectIds
    const productsWithCategoryIds = sampleProducts.map(product => ({
      ...product,
      category: categoryMap[product.category]
    }));

    // Insert products
    await Product.insertMany(productsWithCategoryIds);
    console.log('Sample products inserted successfully');

    // Disconnect from database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    console.log('Database seeded successfully!');
    console.log(`Inserted ${sampleCategories.length} categories and ${sampleProducts.length} products`);
    console.log('Live database is now populated!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seedDatabase();
