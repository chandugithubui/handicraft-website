const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/product');
const Review = require('../models/review');

const { adminAuth } = require('../middleware/auth');

/*
====================================
GET ALL PRODUCTS WITH FILTERS
====================================
*/
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      material,
      page = 1,
      limit = 12,
      sort = 'newest'
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, parseInt(limit, 10) || 12);

    const skip = (pageNumber - 1) * limitNumber;

    let sortOption = { _id: -1 };

    switch (sort) {
      case 'price-low-high':
        sortOption = { price: 1 };
        break;

      case 'price-high-low':
        sortOption = { price: -1 };
        break;

      case 'name-a-z':
        sortOption = { name: 1 };
        break;

      case 'newest':
      default:
        sortOption = { _id: -1 };
        break;
    }

    console.log('Query params received:', {
      search,
      category,
      minPrice,
      maxPrice,
      material
    });

    let query = {};

    // Search by name
    if (search) {
      query.name = {
        $regex: search,
        $options: 'i'
      };
    }

    // Filter by category
    if (category) {
      query.category = category;

      console.log(
        'Filtering by category:',
        category
      );
    }

    // Filter by material
    if (material) {
      query.material = {
        $regex: new RegExp(`^${material}$`, 'i')
      };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) {
        query.price.$gte = parseFloat(minPrice);
      }

      if (maxPrice) {
        query.price.$lte = parseFloat(maxPrice);
      }
    }

    console.log('MongoDB query:', query);

    /*
    ====================================
    FETCH PRODUCTS
    ====================================
    */
    const totalProducts = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    /*
    ====================================
    FETCH REAL REVIEW STATISTICS
    ====================================
    */
    const productIds = products.map(
      (product) => product._id
    );

    const reviewStats = await Review.aggregate([
      {
        $match: {
          product: {
            $in: productIds
          }
        }
      },
      {
        $group: {
          _id: '$product',
          averageRating: {
            $avg: '$rating'
          },
          totalReviews: {
            $sum: 1
          }
        }
      }
    ]);

    /*
    Convert review statistics into:
    
    {
      productId: {
        averageRating: 5,
        totalReviews: 1
      }
    }
    */
    const reviewStatsMap = {};

    reviewStats.forEach((stat) => {
      reviewStatsMap[
        stat._id.toString()
      ] = {
        averageRating: Number(
          stat.averageRating.toFixed(1)
        ),
        totalReviews: stat.totalReviews
      };
    });

    console.log(
      'Products found:',
      products.length
    );

    /*
    ====================================
    PREPARE PRODUCT RESPONSE
    ====================================
    */
    const productsWithFixedImages =
      products.map((product) => {
        const productData =
          product.toObject();

        /*
        Fix image paths
        */
        if (productData.imageUrl) {
          if (
            productData.imageUrl.endsWith(
              '.jpg.jpg'
            )
          ) {
            productData.imageUrl =
              productData.imageUrl.replace(
                '.jpg.jpg',
                '.jpg'
              );
          }

          if (
            productData.imageUrl.endsWith(
              '.jpeg.jpeg'
            )
          ) {
            productData.imageUrl =
              productData.imageUrl.replace(
                '.jpeg.jpeg',
                '.jpeg'
              );
          }
        }

        /*
        Get real review statistics
        */
        const stats =
          reviewStatsMap[
          product._id.toString()
          ];

        /*
        Replace old seeded rating values
        with real review data.
        */
        productData.rating = stats
          ? stats.averageRating
          : 0;

        productData.numReviews = stats
          ? stats.totalReviews
          : 0;

        return productData;
      });

    const totalPages = Math.ceil(
      totalProducts / limitNumber
    );

    return res.status(200).json({
      products: productsWithFixedImages,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalProducts,
        limit: limitNumber
      }
    });

  } catch (error) {
    console.error(
      'Product fetch error:',
      error
    );

    return res.status(500).json({
      message: 'Error retrieving products'
    });
  }
});

/*
====================================
GET SINGLE PRODUCT BY ID
====================================
*/
router.get('/:id', async (req, res) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message: 'Invalid product ID'
      });
    }

    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    let productData =
      product.toObject();

    if (productData.imageUrl) {
      if (
        productData.imageUrl.endsWith(
          '.jpg.jpg'
        )
      ) {
        productData.imageUrl =
          productData.imageUrl.replace(
            '.jpg.jpg',
            '.jpg'
          );
      }

      if (
        productData.imageUrl.endsWith(
          '.jpeg.jpeg'
        )
      ) {
        productData.imageUrl =
          productData.imageUrl.replace(
            '.jpeg.jpeg',
            '.jpeg'
          );
      }
    }

    return res
      .status(200)
      .json(productData);

  } catch (error) {
    console.error(
      'Single product fetch error:',
      error
    );

    return res.status(500).json({
      message: 'Error retrieving product'
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
    const {
      name,
      price,
      description,
      imageUrl,
      category,
      material,
      stock
    } = req.body;

    if (
      !name ||
      !price ||
      !description ||
      !imageUrl
    ) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    const newProduct = new Product({
      name,
      price,
      description,
      imageUrl,
      category:
        category || 'General',
      material,
      stock: stock || 0
    });

    const savedProduct =
      await newProduct.save();

    console.log(
      'Product added:',
      savedProduct._id
    );

    return res
      .status(201)
      .json(savedProduct);

  } catch (error) {
    console.error(
      'Product save error:',
      error
    );

    return res.status(500).json({
      message: 'Error adding product'
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
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message: 'Invalid product ID'
      });
    }

    const allowedFields = [
      'name',
      'price',
      'description',
      'imageUrl',
      'category',
      'material',
      'stock',
      'featured'
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (
        req.body[field] !== undefined
      ) {
        updates[field] =
          req.body[field];
      }
    });

    if (
      Object.keys(updates).length === 0
    ) {
      return res.status(400).json({
        message:
          'No valid fields provided for update'
      });
    }

    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        updates,
        {
          new: true,
          runValidators: true
        }
      );

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    return res.json(product);

  } catch (error) {
    console.error(
      'Edit product error:',
      error
    );

    if (
      error.name === 'ValidationError'
    ) {
      return res.status(400).json({
        message:
          'Validation error: ' +
          error.message
      });
    }

    return res.status(500).json({
      message: 'Error updating product'
    });
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
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message: 'Invalid product ID'
      });
    }

    const product =
      await Product.findByIdAndDelete(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    return res.json({
      message:
        'Product deleted successfully'
    });

  } catch (error) {
    console.error(
      'Delete product error:',
      error
    );

    return res.status(500).json({
      message: 'Error deleting product'
    });
  }
});

/*
====================================
UPDATE PRODUCT STOCK
====================================
*/
router.patch(
  '/:id/stock',
  adminAuth,
  async (req, res) => {
    try {
      const { stock } = req.body;

      const product =
        await Product.findByIdAndUpdate(
          req.params.id,
          { stock },
          { new: true }
        );

      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      return res.json(product);

    } catch (error) {
      console.error(
        'Stock update error:',
        error
      );

      return res.status(500).json({
        message:
          'Error updating stock'
      });
    }
  }
);

module.exports = router;