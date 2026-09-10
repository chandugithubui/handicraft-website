const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');
const { auth } = require('../middleware/auth');

/* =========================================================
   CREATE NEW ORDER
   POST /api/orders
========================================================= */

router.post('/', auth, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod
    } = req.body;

    /* -------------------------------------------------------
       1. Validate items
    ------------------------------------------------------- */

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Order creation error: Items array is empty or invalid');

      return res.status(400).json({
        message: 'Order must contain at least one item'
      });
    }

    /* -------------------------------------------------------
       2. Validate each item and get real product data
    ------------------------------------------------------- */

    const validatedItems = [];

    for (const item of items) {
      // Validate product ID
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        console.error(
          'Order creation error: Invalid product ID:',
          item.product
        );

        return res.status(400).json({
          message: `Invalid product ID: ${item.product}`
        });
      }

      // Validate quantity
      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          message: 'Product quantity must be a positive integer'
        });
      }

      // Find product in MongoDB
      const product = await Product.findById(item.product);

      if (!product) {
        console.error(
          'Order creation error: Product not found:',
          item.product
        );

        return res.status(404).json({
          message: `Product not found: ${item.product}`
        });
      }

      // Check stock
      if (product.stock < item.quantity) {
        console.error(
          'Order creation error: Insufficient stock',
          {
            product: product.name,
            available: product.stock,
            requested: item.quantity
          }
        );

        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      /* -----------------------------------------------------
         Use trusted product information from database.

         Do NOT trust price/name/image sent by frontend.
      ----------------------------------------------------- */

      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.imageUrl
      });
    }

    /* -------------------------------------------------------
       3. Calculate total from database prices
    ------------------------------------------------------- */

    const calculatedTotal = validatedItems.reduce(
      (sum, item) => {
        return sum + item.price * item.quantity;
      },
      0
    );

    /* -------------------------------------------------------
       4. Reduce product stock
    ------------------------------------------------------- */

    for (const item of validatedItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity }
        },
        {
          $inc: {
            stock: -item.quantity
          }
        },
        {
          new: true
        }
      );

      // Stock may have changed between validation and update
      if (!updatedProduct) {
        return res.status(400).json({
          message: `Unable to reserve stock for ${item.name}. Please try again.`
        });
      }
    }

    /* -------------------------------------------------------
       5. Create order
    ------------------------------------------------------- */

    const order = new Order({
      user: req.user.userId,
      items: validatedItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      totalAmount: calculatedTotal
    });

    /* -------------------------------------------------------
       6. Save order
    ------------------------------------------------------- */

    await order.save();

    console.log(
      'Order created successfully:',
      order._id.toString()
    );

    /* -------------------------------------------------------
       7. Send response
    ------------------------------------------------------- */

    return res.status(201).json({
      message: 'Order placed successfully',
      order
    });

  } catch (error) {
    console.error('========== ORDER CREATION ERROR ==========');
    console.error('Message:', error.message);
    console.error('Name:', error.name);
    console.error('Stack:', error.stack);
    console.error('Request body:', req.body);
    console.error('User:', req.user);
    console.error('==========================================');

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error: ' + error.message
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid data format: ' + error.message
      });
    }

    return res.status(500).json({
      message: error.message || 'Server error during order creation'
    });
  }
});


/* =========================================================
   GET USER ORDERS
   GET /api/orders/my-orders
========================================================= */

router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.userId
    })
      .sort({ createdAt: -1 })
      .lean();

    /* -------------------------------------------------------
       Fix image paths and ensure item values are available
    ------------------------------------------------------- */

    const ordersWithFixedImages = orders.map((order) => {
      const fixedItems = order.items.map((item) => {
        let imageUrl = item.image;

        // Remove accidental double extensions
        if (imageUrl && imageUrl.endsWith('.jpg.jpg')) {
          imageUrl = imageUrl.replace('.jpg.jpg', '.jpg');
        }

        if (imageUrl && imageUrl.endsWith('.jpeg.jpeg')) {
          imageUrl = imageUrl.replace('.jpeg.jpeg', '.jpeg');
        }

        return {
          ...item,
          image: imageUrl,
          price: item.price ?? 0,
          quantity: item.quantity ?? 1
        };
      });

      return {
        ...order,
        items: fixedItems
      };
    });

    return res.json(ordersWithFixedImages);

  } catch (error) {
    console.error('Get orders error:', error);

    return res.status(500).json({
      message: 'Server error'
    });
  }
});


/* =========================================================
   GET SINGLE ORDER
   GET /api/orders/:id
========================================================= */

router.get('/:id', auth, async (req, res) => {
  try {
    // Validate order ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(req.params.id).lean();

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    /* -------------------------------------------------------
       Check ownership or admin access
    ------------------------------------------------------- */

    if (
      !order.user ||
      (
        order.user.toString() !== req.user.userId &&
        req.user.role !== 'admin'
      )
    ) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    /* -------------------------------------------------------
       Fix item image paths and values
    ------------------------------------------------------- */

    const fixedItems = order.items.map((item) => {
      let imageUrl = item.image;

      if (imageUrl && imageUrl.endsWith('.jpg.jpg')) {
        imageUrl = imageUrl.replace('.jpg.jpg', '.jpg');
      }

      if (imageUrl && imageUrl.endsWith('.jpeg.jpeg')) {
        imageUrl = imageUrl.replace('.jpeg.jpeg', '.jpeg');
      }

      return {
        ...item,
        image: imageUrl,
        price: item.price ?? 0,
        quantity: item.quantity ?? 1
      };
    });

    return res.json({
      ...order,
      items: fixedItems
    });

  } catch (error) {
    console.error('Get order error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid order ID'
      });
    }

    return res.status(500).json({
      message: 'Server error'
    });
  }
});


/* =========================================================
   UPDATE ORDER STATUS
   PATCH /api/orders/:id/status

   Admin only
========================================================= */

router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { orderStatus } = req.body;

    /* -------------------------------------------------------
       Admin check
    ------------------------------------------------------- */

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Admin only.'
      });
    }

    /* -------------------------------------------------------
       Validate order ID
    ------------------------------------------------------- */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid order ID'
      });
    }

    /* -------------------------------------------------------
       Validate order status
    ------------------------------------------------------- */

    const allowedStatuses = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: 'Invalid order status'
      });
    }

    /* -------------------------------------------------------
       Update order
    ------------------------------------------------------- */

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    return res.json(order);

  } catch (error) {
    console.error('Update order status error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error: ' + error.message
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid order ID'
      });
    }

    return res.status(500).json({
      message: 'Server error'
    });
  }
});


/* =========================================================
   EXPORT ROUTER
========================================================= */

module.exports = router;