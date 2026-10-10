/**
 * server/src/routes/payment.routes.ts
 *
 * Industry-standard Payment routes using Razorpay.
 * Features:
 * - Server-side amount validation & tampering protection
 * - Cryptographic HMAC-SHA256 signature verification
 * - Idempotency protection against double-click/replay requests
 * - Atomic stock decrementing and order creation
 * - Razorpay webhook listener for asynchronous capture events
 */

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import env from '../config/env';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { Coupon } from '../models/coupon.model';
import { User } from '../models/user.model';
import { auth } from '../middleware/auth.middleware';
import sendEmail from '../utils/sendEmail';
import { calculateShipping } from '../utils/pricing';

const Razorpay = require('razorpay');

const router = Router();

let razorpay: any = null;
if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * Helper to calculate server-verified order totals
 */
async function calculateOrderTotals(items: any[], couponCode?: string | null, session?: mongoose.ClientSession) {
  // Strict validation: quantities must be safe integers > 0, no silent conversion
  for (const item of items) {
    const qty = item.quantity;

    // Type must be number (no strings, null, undefined, booleans)
    if (typeof qty !== 'number') {
      throw new Error(`Invalid quantity type for product ${item.product || item._id}. Expected number, got ${typeof qty}.`);
    }

    // Must be safe integer > 0
    if (!Number.isSafeInteger(qty) || qty <= 0) {
      throw new Error(`Invalid quantity ${qty} for product ${item.product || item._id}. Must be a safe positive integer.`);
    }
  }

  // Aggregate quantities for duplicate product IDs
  const productMap = new Map<string, number>();
  for (const item of items) {
    const productId = String(item.product || item._id);
    const qty = item.quantity; // Already validated as safe integer
    const existing = productMap.get(productId) || 0;
    productMap.set(productId, existing + qty);
  }

  const validatedItems: any[] = [];
  for (const [productId, totalQty] of productMap.entries()) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error(`Invalid product ID: ${productId}`);
    }

    // Validate aggregated quantity is still a safe integer
    if (!Number.isSafeInteger(totalQty) || totalQty <= 0) {
      throw new Error(`Aggregated quantity ${totalQty} for product ${productId} is invalid.`);
    }

    const product = session
      ? await Product.findById(productId).session(session)
      : await Product.findById(productId);

    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    if (product.stock < totalQty) {
      throw new Error(
        `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${totalQty}`
      );
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
    const coupon = session
      ? await Coupon.findOne({ code: couponCode.trim().toUpperCase() }).session(session)
      : await Coupon.findOne({ code: couponCode.trim().toUpperCase() });

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

  return {
    validatedItems,
    subtotal,
    shippingAmount,
    discountAmount,
    totalAmount,
    appliedCoupon,
  };
}

// ── 1. CREATE RAZORPAY ORDER (Server-Verified Amount) ───────────────────────────
router.post('/create-order', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!razorpay) {
      return res.status(400).json({
        message: 'Razorpay is not configured. Please use COD payment method.',
      });
    }

    // SECURITY: Only accept items, never trust client-submitted amounts
    if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({ message: 'Valid order items are required' });
    }

    const totals = await calculateOrderTotals(req.body.items, req.body.couponCode);
    const payableAmount = totals.totalAmount;

    if (payableAmount <= 0) {
      return res.status(400).json({ message: 'Order amount must be greater than zero' });
    }

    const userId = req.user?.userId || req.user?.id || req.user?._id || 'guest';
    const shortUserId = String(userId).slice(-6);

    const options = {
      amount: Math.round(payableAmount * 100), // In paise
      currency: 'INR',
      receipt: `rcpt_${shortUserId}_${Date.now()}`,
      payment_capture: 1,
      notes: {
        userId: String(userId),
        itemCount: req.body.items.length,
        serverCalculatedAmount: payableAmount,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Store Razorpay order ID mapping for verification
    // Note: In production, store this mapping in Redis or database
    // For now, we rely on server-side recalculation during verification

    return res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return res.status(500).json({
      message: error.message || 'Error creating Razorpay order',
    });
  }
});

// ── 2. VERIFY AND ATOMICALLY CREATE ORDER (Industry Standard with Idempotency) ───
router.post('/verify-and-create-order', auth, async (req: Request, res: Response): Promise<Response> => {
  let session: mongoose.ClientSession | null = null;
  let transactionCommitted = false;

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shippingAddress,
      couponCode,
      idempotencyKey,
    } = req.body;

    if (!razorpay || !env.RAZORPAY_KEY_SECRET) {
      return res.status(400).json({ message: 'Razorpay is not configured on the server.' });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: 'Missing required Razorpay payment verification fields.',
      });
    }

    // ── STEP 1: Verify Signature BEFORE Any Database Operations ──────────────────
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('[Payment] Signature mismatch detected for payment:', razorpay_payment_id);
      return res.status(400).json({
        success: false,
        message: 'Cryptographic payment verification failed. Invalid signature.',
      });
    }

    // ── STEP 2: Verify Payment Details via Razorpay API ──────────────────────────
    let razorpayPayment: any;
    try {
      razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (apiError: any) {
      console.error('[Payment] Failed to fetch payment from Razorpay:', apiError);
      return res.status(400).json({
        success: false,
        message: 'Failed to verify payment with Razorpay. Please try again.',
      });
    }

    // Verify payment belongs to the Razorpay order
    if (razorpayPayment.order_id !== razorpay_order_id) {
      console.error('[Payment] Payment order ID mismatch:', {
        expected: razorpay_order_id,
        received: razorpayPayment.order_id,
      });
      return res.status(400).json({
        success: false,
        message: 'Payment does not belong to this order.',
      });
    }

    // Verify payment status
    if (razorpayPayment.status !== 'captured') {
      console.error('[Payment] Payment not captured:', razorpayPayment.status);
      return res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${razorpayPayment.status}`,
      });
    }

    // Verify currency
    if (razorpayPayment.currency !== 'INR') {
      console.error('[Payment] Invalid currency:', razorpayPayment.currency);
      return res.status(400).json({
        success: false,
        message: 'Invalid payment currency.',
      });
    }

    // Fetch Razorpay order to verify amount
    let razorpayOrder: any;
    try {
      razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
    } catch (apiError: any) {
      console.error('[Payment] Failed to fetch Razorpay order:', apiError);
      return res.status(400).json({
        success: false,
        message: 'Failed to verify order with Razorpay.',
      });
    }

    // ── STEP 3: Idempotency Check AFTER Signature Verification ───────────────────
    const userId = req.user?.userId || req.user?.id || req.user?._id;

    session = await mongoose.startSession();
    session.startTransaction();

    const existingOrder = await Order.findOne({
      user: userId,
      $or: [
        { paymentId: razorpay_payment_id },
        ...(idempotencyKey ? [{ idempotencyKey, razorpayOrderId: razorpay_order_id }] : []),
      ],
    }).session(session).lean();

    if (existingOrder) {
      await session.abortTransaction();
      return res.status(200).json({
        success: true,
        message: 'Order already processed successfully.',
        order: existingOrder,
      });
    }

    // ── STEP 4: Validate Items and Calculate Server-Side Totals ──────────────────
    if (!items || !Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Order must contain items.' });
    }

    const totals = await calculateOrderTotals(items, couponCode, session);

    // ── STEP 5: Verify Payment Amount Matches Server-Calculated Amount ───────────
    const serverAmountPaise = Math.round(totals.totalAmount * 100);
    const razorpayAmountPaise = razorpayOrder.amount;

    if (razorpayAmountPaise !== serverAmountPaise) {
      await session.abortTransaction();
      console.error('[Payment] Amount mismatch:', {
        serverCalculated: serverAmountPaise,
        razorpayOrder: razorpayAmountPaise,
        paymentReceived: razorpayPayment.amount,
      });
      return res.status(400).json({
        success: false,
        message: 'Payment amount mismatch. Order cannot be processed.',
      });
    }

    // ── STEP 6: Create Order Record within Transaction ────────────────────────────
    const order = new Order({
      user: userId,
      items: totals.validatedItems,
      shippingAddress,
      paymentMethod: 'Razorpay',
      paymentStatus: 'paid',
      orderStatus: 'processing',
      subtotal: totals.subtotal,
      shippingAmount: totals.shippingAmount,
      couponCode: totals.appliedCoupon ? totals.appliedCoupon.code : null,
      discountAmount: totals.discountAmount,
      totalAmount: totals.totalAmount,
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature,
      idempotencyKey: idempotencyKey || null,
    });

    await order.save({ session });

    // ── STEP 7: Atomically Decrement Inventory within Transaction ────────────────
    for (const item of totals.validatedItems) {
      const updateResult = await Product.updateOne(
        {
          _id: item.product,
          stock: { $gte: item.quantity }
        },
        {
          $inc: { stock: -item.quantity }
        },
        { session }
      );

      if (updateResult.modifiedCount === 0) {
        await session.abortTransaction();
        const failedProduct = await Product.findById(item.product);

        // CRITICAL: Payment captured but order cannot be fulfilled
        console.error(
          `[Payment Critical] Stock exhausted after payment capture. ` +
          `Payment ID: ${razorpay_payment_id}, Razorpay Order: ${razorpay_order_id}, ` +
          `Product: ${failedProduct?.name}, User: ${userId}. ` +
          `REQUIRES MANUAL REFUND via Razorpay Dashboard or API.`
        );

        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${failedProduct?.name}". Your payment has been received and will be refunded by our support team.`,
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          requiresRefund: true,
        });
      }
    }

    // Increment coupon usage within transaction
    if (totals.appliedCoupon) {
      await Coupon.findByIdAndUpdate(
        totals.appliedCoupon._id,
        { $inc: { usedCount: 1 } },
        { session }
      );
    }

    // ── STEP 8: Commit Transaction ────────────────────────────────────────────────
    await session.commitTransaction();
    transactionCommitted = true;

    // ── STEP 9: Post-Commit Operations (Email) ────────────────────────────────────
    // Email failures do NOT affect order success
    try {
      const customer = await User.findById(userId).select('name email');
      if (customer?.email) {
        await sendEmail({
          to: customer.email,
          subject: 'Order & Payment Confirmation - Handicraft Hub',
          html: `<h2>Payment Successful!</h2><p>Hi ${customer.name}, your order #${order._id} has been placed.</p><p>Payment ID: ${razorpay_payment_id}</p><p>Total Paid: ₹${totals.totalAmount}</p>`,
        });
      }
    } catch (emailError: any) {
      // Log but don't fail the response - order is already committed
      console.error('Order confirmation email failed (non-critical):', emailError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Payment verified and order placed successfully.',
      order,
    });
  } catch (error: any) {
    // Only abort if transaction not yet committed
    if (session && !transactionCommitted) {
      await session.abortTransaction();
    }

    console.error('Payment verification and order placement error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error processing payment and creating order.',
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
});

// ── 3. STANDALONE VERIFY PAYMENT (Backward compatibility) ───────────────────────
router.post('/verify-payment', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay || !env.RAZORPAY_KEY_SECRET) {
      return res.status(400).json({ message: 'Razorpay is not configured.' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
      return res.json({
        success: true,
        message: 'Payment verified successfully',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature',
      });
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return res.status(500).json({
      message: 'Error verifying payment',
      error: error.message,
    });
  }
});

// ── 4. RAZORPAY WEBHOOK (Edge Case Handler for Network Interruptions) ───────────
/**
 * IMPORTANT: Razorpay webhooks should use a separate webhook secret (not API secret).
 *
 * Configuration Required:
 * 1. Go to Razorpay Dashboard → Settings → Webhooks
 * 2. Generate a webhook secret
 * 3. Add to environment: RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx
 *
 * Current Implementation: Uses RAZORPAY_KEY_SECRET as fallback (acceptable for development)
 * Production: Use dedicated webhook secret for better security
 */
router.post('/webhook', async (req: Request, res: Response): Promise<Response> => {
  try {
    // Prefer dedicated webhook secret, fallback to API secret
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_KEY_SECRET;
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!webhookSecret || !signature) {
      return res.status(400).send('Webhook secret or signature missing');
    }

    // CRITICAL: Use raw body for signature verification
    // Express body-parser must be configured to preserve raw body for webhooks
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('[Webhook] Invalid Razorpay webhook signature');
      return res.status(400).send('Invalid signature');
    }

    const event = req.body.event;
    console.log(`[Webhook] Received Razorpay event: ${event}`);

    // Handle payment captured events
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload?.payment?.entity;
      const paymentId = paymentEntity?.id;

      if (paymentId) {
        // Idempotent update - only update if order exists
        const result = await Order.findOneAndUpdate(
          { paymentId },
          { paymentStatus: 'paid' },
          { new: false } // Return old doc to detect if it was already paid
        );

        if (result) {
          console.log(`[Webhook] Updated payment status for order with paymentId: ${paymentId}`);
        }
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err: any) {
    console.error('[Webhook] Error processing Razorpay webhook:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
