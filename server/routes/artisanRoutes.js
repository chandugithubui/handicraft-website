const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Artisan = require('../models/artisan');
const { auth, adminAuth } = require('../middleware/auth');


// GET /api/artisans/:slug/products
// Get real products belonging to an artisan
router.get('/:slug/products', async (req, res) => {
  try {
    const artisan = await Artisan.findOne({
      slug: req.params.slug.toLowerCase()
    });

    if (!artisan) {
      return res.status(404).json({
        message: 'Artisan not found'
      });
    }

    const products = await Product.find({
      artisan: artisan._id
    }).sort({ _id: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error('Get artisan products error:', error.message);

    res.status(500).json({
      message: 'Failed to fetch artisan products'
    });
  }
});

// GET /api/artisans
// Get all artisans
router.get('/', async (req, res) => {
  try {
    const artisans = await Artisan.find();

    const artisanOrder = [
      'rakesh-prusty',
      'monalisa-sahoo',
      'jagannath-das'
    ];

    artisans.sort((a, b) => {
      return (
        artisanOrder.indexOf(a.slug) -
        artisanOrder.indexOf(b.slug)
      );
    });

    res.status(200).json(artisans);
  } catch (error) {
    console.error('Get artisans error:', error.message);

    res.status(500).json({
      message: 'Failed to fetch artisans'
    });
  }
});


// GET /api/artisans/:slug
// Get a single artisan using slug
router.get('/:slug', async (req, res) => {
  try {
    const artisan = await Artisan.findOne({
      slug: req.params.slug.toLowerCase()
    });

    if (!artisan) {
      return res.status(404).json({
        message: 'Artisan not found'
      });
    }

    res.status(200).json(artisan);
  } catch (error) {
    console.error('Get artisan error:', error.message);

    res.status(500).json({
      message: 'Failed to fetch artisan'
    });
  }
});


// POST /api/artisans
// Create artisan - Admin only
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const {
      name,
      slug,
      craft,
      location,
      years,
      story,
      image,
      specialty,
      craftProcess,
      featured
    } = req.body;

    const existingArtisan = await Artisan.findOne({
      slug: slug?.toLowerCase()
    });

    if (existingArtisan) {
      return res.status(400).json({
        message: 'Artisan with this slug already exists'
      });
    }

    const artisan = new Artisan({
      name,
      slug,
      craft,
      location,
      years,
      story,
      image,
      specialty,
      craftProcess,
      featured
    });

    const savedArtisan = await artisan.save();

    res.status(201).json(savedArtisan);
  } catch (error) {
    console.error('Create artisan error:', error.message);

    res.status(500).json({
      message: 'Failed to create artisan'
    });
  }
});


// PUT /api/artisans/:id
// Update artisan - Admin only
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const artisan = await Artisan.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!artisan) {
      return res.status(404).json({
        message: 'Artisan not found'
      });
    }

    res.status(200).json(artisan);
  } catch (error) {
    console.error('Update artisan error:', error.message);

    res.status(500).json({
      message: 'Failed to update artisan'
    });
  }
});


// DELETE /api/artisans/:id
// Delete artisan - Admin only
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const artisan = await Artisan.findByIdAndDelete(req.params.id);

    if (!artisan) {
      return res.status(404).json({
        message: 'Artisan not found'
      });
    }

    res.status(200).json({
      message: 'Artisan deleted successfully'
    });
  } catch (error) {
    console.error('Delete artisan error:', error.message);

    res.status(500).json({
      message: 'Failed to delete artisan'
    });
  }
});

module.exports = router;