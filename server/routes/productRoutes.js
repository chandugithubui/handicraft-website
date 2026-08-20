const express = require('express');
const router = express.Router();
const Product = require('../models/product');

/*
====================================
DEBUG: GET ALL PRODUCTS (no filters)
====================================
*/
router.get('/debug', async (req, res) => {
  try {
    const allProducts = await Product.find({});
    console.log('All products in database:', allProducts.length);
    allProducts.forEach(p => {
      console.log(`- ${p.name}: category="${p.category}", material="${p.material}"`);
    });
    res.json(allProducts);
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

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
    
    // Filter by material
    if (material) {
      query.material = material;
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

    res.status(200).json(products);

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
router.post('/', async (req, res) => {

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
UPDATE PRODUCT STOCK
====================================
*/
router.patch('/:id/stock', async (req, res) => {
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