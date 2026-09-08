const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Order = require('../models/order');
const Product = require('../models/product');
const Contact = require('../models/contact');
const { adminAuth } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    
    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    res.json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

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

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all contacts
router.get('/contacts', adminAuth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ date: -1 });
    res.json(contacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
