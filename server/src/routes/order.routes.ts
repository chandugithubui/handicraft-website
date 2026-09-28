/**
 * server/src/routes/order.routes.ts
 *
 * Order processing, inventory decrementing, customer history, and admin dispatch in TypeScript.
 */

import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { Coupon } from '../models/coupon.model';
import { User } from '../models/user.model';
import { auth } from '../middleware/auth.middleware';
import sendEmail from '../utils/sendEmail';

const router = Router();

// POST create order
router.post('/', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    const validatedItems: any[] = [];
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ message: `Invalid product ID: ${item.product}` });
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return res.status(400).json({ message: 'Product quantity must be a positive integer' });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }

      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.imageUrl,
      });
    }

    const subtotal = validatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingAmount = subtotal >= 1000 ? 0 : 50;

    let discountAmount = 0;
    let appliedCoupon: any = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() });
      if (
        coupon &&
        coupon.isActive &&
        new Date() <= new Date(coupon.expiryDate) &&
        (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit) &&
        subtotal >= coupon.minimumOrderAmount
      ) {
        appliedCoupon = coupon;
        if (coupon.discountType === 'percentage') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
        discountAmount = Math.min(discountAmount, subtotal);
      }
    }

    const totalAmount = Math.max(0, subtotal + shippingAmount - discountAmount);

    const order = new Order({
      user: req.user?.userId || req.user?.id,
      items: validatedItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'paid',
      orderStatus: 'pending',
      subtotal,
      shippingAmount,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      discountAmount,
      totalAmount,
    });

    await order.save();

    // Decrement stock
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    if (appliedCoupon) {
      await Coupon.findByIdAndUpdate(appliedCoupon._id, {
        $inc: { usedCount: 1 },
      });
    }

    const customer = await User.findById(req.user?.userId || req.user?.id).select('name email');
    if (customer?.email) {
      sendEmail({
        to: customer.email,
        subject: 'Order Confirmation - Handicraft Hub',
        html: `<h2>Order Confirmation</h2><p>Hi ${customer.name}, your order #${order._id} has been placed.</p><p>Total Amount: ₹${totalAmount}</p>`,
      }).catch((e: any) => console.error('Order email error:', e.message));
    }

    return res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return res.status(500).json({ message: error.message || 'Server error during order creation' });
  }
});

// GET user orders
router.get('/my-orders', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();

    const ordersWithFixedImages = orders.map((order: any) => {
      const fixedItems = order.items.map((item: any) => {
        let imageUrl = item.image;
        if (imageUrl && imageUrl.endsWith('.jpg.jpg')) imageUrl = imageUrl.replace('.jpg.jpg', '.jpg');
        if (imageUrl && imageUrl.endsWith('.jpeg.jpeg')) imageUrl = imageUrl.replace('.jpeg.jpeg', '.jpeg');
        return {
          ...item,
          image: imageUrl,
          price: item.price ?? 0,
          quantity: item.quantity ?? 1,
        };
      });
      return { ...order, items: fixedItems };
    });

    return res.json(ordersWithFixedImages);
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET single order
router.get('/:id', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order: any = await Order.findById(req.params.id).lean();
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const userId = req.user?.userId || req.user?.id;
    if (
      !order.user ||
      (order.user.toString() !== userId && req.user?.role !== 'admin' && req.user?.role !== 'super_admin')
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH update order status - Admin
router.patch('/:id/status', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { orderStatus } = req.body;

    if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
