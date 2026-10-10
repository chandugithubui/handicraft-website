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
import { calculateShipping } from '../utils/pricing';

const router = Router();

// POST create order
router.post('/', auth, async (req: Request, res: Response): Promise<Response> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let transactionCommitted = false;

  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Strict quantity validation: no type coercion, safe integer only
    for (const item of items) {
      const qty = item.quantity;

      // Reject non-numbers (strings, null, undefined, boolean)
      if (typeof qty !== 'number') {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Invalid quantity for product ${item.product}. Quantity must be a number, received ${typeof qty}.`
        });
      }

      // Reject unsafe integers, NaN, Infinity, non-positive
      if (!Number.isSafeInteger(qty) || qty <= 0) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Invalid quantity for product ${item.product}. Must be a safe positive integer.`
        });
      }
    }

    // Aggregate quantities for duplicate product IDs to prevent overselling
    const productMap = new Map<string, number>();
    for (const item of items) {
      const productId = String(item.product);
      const qty = item.quantity; // Already validated as safe integer
      const existing = productMap.get(productId) || 0;
      productMap.set(productId, existing + qty);
    }

    const validatedItems: any[] = [];
    for (const [productId, totalQty] of productMap.entries()) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        await session.abortTransaction();
        return res.status(400).json({ message: `Invalid product ID: ${productId}` });
      }

      const product = await Product.findById(productId).session(session);
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({ message: `Product not found: ${productId}` });
      }

      if (product.stock < totalQty) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${totalQty}`,
        });
      }

      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: totalQty,
        image: product.imageUrl,
      });
    }

    const subtotal = validatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingAmount = calculateShipping(subtotal);

    let discountAmount = 0;
    let appliedCoupon: any = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() }).session(session);
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
    const userId = req.user?.userId || req.user?.id || req.user?._id;

    const order = new Order({
      user: userId,
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

    await order.save({ session });

    // Atomically decrement stock with concurrency protection within transaction
    // If ANY product fails, entire transaction rolls back
    for (const item of validatedItems) {
      const updateResult = await Product.updateOne(
        {
          _id: item.product,
          stock: { $gte: item.quantity } // Atomic check
        },
        {
          $inc: { stock: -item.quantity }
        },
        { session }
      );

      // If stock update failed (concurrent purchase exhausted stock), abort transaction
      if (updateResult.modifiedCount === 0) {
        await session.abortTransaction();
        const failedProduct = await Product.findById(item.product);
        return res.status(400).json({
          message: `Insufficient stock for "${failedProduct?.name}". Order cancelled, no changes made.`
        });
      }
    }

    // Increment coupon usage within transaction
    if (appliedCoupon) {
      await Coupon.findByIdAndUpdate(
        appliedCoupon._id,
        { $inc: { usedCount: 1 } },
        { session }
      );
    }

    // Commit transaction - all or nothing
    await session.commitTransaction();
    transactionCommitted = true;

    // Send email ONLY after successful transaction commit
    // Email failure does NOT affect order success
    try {
      const customer = await User.findById(req.user?.userId || req.user?.id).select('name email');
      if (customer?.email) {
        await sendEmail({
          to: customer.email,
          subject: 'Order Confirmation - Handicraft Hub',
          html: `<h2>Order Confirmation</h2><p>Hi ${customer.name}, your order #${order._id} has been placed.</p><p>Total Amount: ₹${totalAmount}</p>`,
        });
      }
    } catch (emailError: any) {
      // Log email failure but do not fail the order response
      console.error('Order confirmation email failed:', emailError.message);
    }

    return res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error: any) {
    // Only abort if transaction was not already committed
    if (!transactionCommitted) {
      await session.abortTransaction();
    }
    console.error('Order creation error:', error);
    return res.status(500).json({ message: error.message || 'Server error during order creation' });
  } finally {
    session.endSession();
  }
});

// GET user orders
router.get('/my-orders', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
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

    const userId = req.user?.userId || req.user?.id || req.user?._id;
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
