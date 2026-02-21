// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const Contact = require('../models/contact'); // Ensure correct path

// POST route to handle contact form submission
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  // Check if any required fields are missing
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const newContact = new Contact({
    name,
    email,
    message,
  });

  try {
    await newContact.save();
    res.status(201).json(newContact);  // Respond with the saved contact object
  } catch (err) {
    res.status(400).json({ message: 'Error saving contact message', error: err });
  }
});

module.exports = router;
