const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Initialize Stripe only if secret key is provided
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// Create Payment Intent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(400).json({ 
        message: 'Stripe is not configured. Please use COD payment method.' 
      });
    }

    const { amount } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency: 'inr',
      metadata: {
        userId: req.user.userId
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({ 
      message: 'Error creating payment intent',
      error: error.message 
    });
  }
});

module.exports = router;
