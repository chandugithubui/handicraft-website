// models/Category.js
const mongoose = require('mongoose');

// Define the schema for a category
const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensures that category names are unique
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the creation time
  },
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
