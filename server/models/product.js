const mongoose = require('mongoose');

// Define the schema for the product
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  description: { type: String, required: true },
  image: { type: String, required: true }, // Main product image
  images: [{ type: String }], // Additional images array
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  rating: { type: Number, default: 4 },
  reviews: { type: Number, default: 0 },
  isNew: { type: Boolean, default: false },
  discount: { type: Number, default: 0 },
  stock: { type: Number, default: 10 },
  details: {
    material: String,
    dimensions: String,
    weight: String,
    artisan: String,
    origin: String
  }
}, {
  timestamps: true // Add createdAt and updatedAt timestamps
});

// Create the model from the schema
const Product = mongoose.model('Product', productSchema);

// Export the model to use it in other files
module.exports = Product;
