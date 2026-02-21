const mongoose = require('mongoose');

// Define the schema for the product
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true }, // URL of the product image
});

// Create the model from the schema
const Product = mongoose.model('Product', productSchema);

// Export the model to use it in other files
module.exports = Product;
