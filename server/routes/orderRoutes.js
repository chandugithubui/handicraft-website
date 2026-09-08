const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

// Create new order (requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

    // Validate items exists and is not empty
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Order creation error: Items array is empty or invalid');
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    const Product = require('../models/product');
    const stockUpdates = [];

    // Validate each product and check stock
    for (const item of items) {
      // Validate product ID is valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        console.error('Order creation error: Invalid product ID:', item.product);
        return res.status(400).json({ message: `Invalid product ID: ${item.product}` });
      }

      // Verify product exists
      const product = await Product.findById(item.product);
      if (!product) {
        console.error('Order creation error: Product not found:', item.product);
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      // Verify stock is sufficient
      if (product.stock < item.quantity) {
        console.error('Order creation error: Insufficient stock for product:', item.product, 'requested:', item.quantity, 'available:', product.stock);
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }

      // Queue stock update for later
      stockUpdates.push({
        productId: item.product,
        quantity: item.quantity
      });
    }

    // All validations passed - now reduce stock
    for (const update of stockUpdates) {
      await Product.findByIdAndUpdate(
        update.productId,
        { $inc: { stock: -update.quantity } }
      );
    }

    const order = new Order({
      user: req.user.userId,
      items,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      totalAmount
    });

    await order.save();

    console.log('Order created successfully:', order._id);
    res.status(201).json({
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    console.error('Order creation error:', error.message, error.name);
    
    // Return specific error messages based on error type
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error: ' + error.message });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid data format' });
    }
    
    res.status(500).json({ message: 'Server error during order creation' });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .sort({ createdAt: -1 });

    // Fix image paths for deployment
    const ordersWithFixedImages = orders.map(order => {
      const fixedItems = order.items.map(item => {
        if (item.image) {
          let imageUrl = item.image;
          // Remove double extensions
          if (imageUrl.endsWith('.jpg.jpg')) {
            imageUrl = imageUrl.replace('.jpg.jpg', '.jpg');
          }
          if (imageUrl.endsWith('.jpeg.jpeg')) {
            imageUrl = imageUrl.replace('.jpeg.jpeg', '.jpeg');
          }
          return { ...item, image: imageUrl };
        }
        return item;
      });
      return { ...order.toObject(), items: fixedItems };
    });

    res.json(ordersWithFixedImages);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (order.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { orderStatus } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
