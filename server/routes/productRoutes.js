const express = require('express');
const router = express.Router();

// Assuming you have a Product model
const Product = require('../models/product');

// Route to get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();  // Retrieve all products
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving products', error: err });
  }
});

// Route to get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving product', error: err });
  }
});

// Route to add a new product
router.post('/', async (req, res) => {
  const { name, price, description, imageUrl } = req.body;

  const newProduct = new Product({
    name,
    price,
    description,
    imageUrl,
  });

  try {
    await newProduct.save();  // Save the new product to the database
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: 'Error adding product', error: err });
  }
});

// Export the router
module.exports = router;
