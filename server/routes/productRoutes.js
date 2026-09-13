const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');
const { adminAuth } = require('../middleware/auth');

/*
====================================
GET ALL PRODUCTS WITH FILTERS
====================================
*/
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, material } = req.query;
    
    console.log('Query params received:', { search, category, minPrice, maxPrice, material });
    
    let query = {};
    
    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Filter by category
    if (category) {
      query.category = category;
      console.log('Filtering by category:', category);
    }
    
    // Filter by material (case-insensitive)
    if (material) {
      query.material = { $regex: new RegExp(`^${material}$`, 'i') };
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    console.log('MongoDB query:', query);
    const products = await Product.find(query);
    console.log('Products found:', products.length);

    // Fix image paths for deployment - ensure they work with frontend
    const productsWithFixedImages = products.map(product => {
      if (product.imageUrl) {
        // Remove double extensions
        let imageUrl = product.imageUrl;
        if (imageUrl.endsWith('.jpg.jpg')) {
          imageUrl = imageUrl.replace('.jpg.jpg', '.jpg');
        }
        if (imageUrl.endsWith('.jpeg.jpeg')) {
          imageUrl = imageUrl.replace('.jpeg.jpeg', '.jpeg');
        }
        return { ...product.toObject(), imageUrl };
      }
      return product;
    });

    res.status(200).json(productsWithFixedImages);

  } catch (error) {
    console.error("Product fetch error:", error);

    res.status(500).json({
      message: "Error retrieving products"
    });
  }
});

/*
====================================
ADD NEW PRODUCT
====================================
*/
router.post('/', adminAuth, async (req, res) => {

  try {

    const { name, price, description, imageUrl, category, material, stock } = req.body;

    if (!name || !price || !description || !imageUrl) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const newProduct = new Product({
      name,
      price,
      description,
      imageUrl,
      category: category || 'General',
      material,
      stock: stock || 0
    });

    const savedProduct = await newProduct.save();

    console.log("Product added:", savedProduct._id);

    res.status(201).json(savedProduct);

  } catch (error) {

    console.error("Product save error:", error);

    res.status(500).json({
      message: "Error adding product"
    });
  }
});

/*
====================================
EDIT PRODUCT
PUT /:id — admin only
====================================
*/
router.put('/:id', adminAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Only allow known fields to be updated — prevents injecting extra keys
    const allowedFields = ['name', 'price', 'description', 'imageUrl', 'category', 'material', 'stock', 'featured'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(product);

  } catch (error) {
    console.error('Edit product error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error: ' + error.message });
    }
    return res.status(500).json({ message: 'Error updating product' });
  }
});

/*
====================================
DELETE PRODUCT
DELETE /:id — admin only
====================================
*/
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ message: 'Error deleting product' });
  }
});

/*
====================================
UPDATE PRODUCT STOCK
====================================
*/
router.patch('/:id/stock', adminAuth, async (req, res) => {
  try {
    const { stock } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Stock update error:', error);
    res.status(500).json({ message: 'Error updating stock' });
  }
});

module.exports = router;