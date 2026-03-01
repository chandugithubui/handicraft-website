// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const Contact = require('../models/contact'); // Ensure correct path

// POST route to handle contact form submission
router.post('/', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // Check if required fields are missing
  if (!name || !email || !message) {
    return res.status(400).json({ 
      success: false,
      message: 'Name, email, and message are required' 
    });
  }

  const newContact = new Contact({
    name,
    email,
    phone: phone || '',
    subject: subject || '',
    message,
  });

  try {
    await newContact.save();
    
    // Send success response (matching frontend expectations)
    res.status(200).json({ 
      success: true,
      message: 'Contact form submitted successfully',
      data: newContact
    });
    
    console.log('New contact submission:', newContact);
    
  } catch (err) {
    console.error('Error saving contact:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error saving contact message',
      error: err.message 
    });
  }
});

// GET route to retrieve all contacts (for admin)
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ date: -1 });
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving contacts',
      error: err.message
    });
  }
});

module.exports = router;
