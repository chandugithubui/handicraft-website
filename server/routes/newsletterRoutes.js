const express = require('express');
const router = express.Router();
const Newsletter = require('../models/newsletter');

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    
    if (existingSubscriber) {
      if (existingSubscriber.status === 'unsubscribed') {
        // Reactivate if previously unsubscribed
        existingSubscriber.status = 'active';
        existingSubscriber.subscribedAt = Date.now();
        await existingSubscriber.save();
        return res.status(200).json({ 
          success: true, 
          message: 'Welcome back! You have been resubscribed to our newsletter.' 
        });
      }
      return res.status(200).json({ 
        success: true, 
        message: 'You are already subscribed to our newsletter!' 
      });
    }

    // Create new subscriber
    const subscriber = new Newsletter({
      email: email.toLowerCase()
    });

    await subscriber.save();

    res.status(201).json({ 
      success: true, 
      message: 'Thank you for subscribing to our newsletter!' 
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred. Please try again later.' 
    });
  }
});

// Get all subscribers (admin only)
router.get('/subscribers', async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ status: 'active' })
      .sort({ subscribedAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      subscribers 
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching subscribers' 
    });
  }
});

// Unsubscribe
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    
    if (!subscriber) {
      return res.status(404).json({ 
        success: false, 
        message: 'Email not found in our newsletter list' 
      });
    }

    subscriber.status = 'unsubscribed';
    await subscriber.save();

    res.status(200).json({ 
      success: true, 
      message: 'You have been unsubscribed from our newsletter' 
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred. Please try again later.' 
    });
  }
});

module.exports = router;
