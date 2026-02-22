const express = require('express');
const router = express.Router();
const Product = require('../models/product');

/*
====================================
GET ALL PRODUCTS
====================================
*/
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();

    console.log("Products fetched successfully");

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

    const { name, price, description, imageUrl } = req.body;

    if (!name || !price || !description || !imageUrl) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const newProduct = new Product({
      name,
      price,
      description,
      imageUrl
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

module.exports = router;