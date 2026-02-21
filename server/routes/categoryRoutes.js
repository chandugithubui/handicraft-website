// routes/categoryRoutes.js
const express = require('express');
const Category = require('../models/category');
const router = express.Router();

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find(); // Fetch all categories from DB
    res.json(categories); // Return categories as a JSON response
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories', error: err });
  }
});

// POST a new category
router.post('/', async (req, res) => {
  const { name, description } = req.body;

  // Validate request body
  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required' });
  }

  try {
    const newCategory = new Category({ name, description });
    await newCategory.save(); // Save the category to DB
    res.status(201).json(newCategory); // Return the created category
  } catch (err) {
    res.status(500).json({ message: 'Failed to create category', error: err });
  }
});

module.exports = router;
