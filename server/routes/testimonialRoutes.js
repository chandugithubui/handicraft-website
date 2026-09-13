const express = require('express');
const router = express.Router();

const Testimonial = require('../models/testimonial');

// GET all active testimonials
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ active: true })
      .sort({ createdAt: -1 });

    res.status(200).json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      message: 'Failed to fetch testimonials'
    });
  }
});

module.exports = router;