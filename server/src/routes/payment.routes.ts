/**
 * server/src/routes/payment.routes.ts
 *
 * Payment routes in TypeScript using Razorpay.
 */

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import env from '../config/env';

const Razorpay = require('razorpay');

const router = Router();

let razorpay: any = null;
if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}

// Create Razorpay Order
router.post('/create-order', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!razorpay) {
      res.status(400).json({
        message: 'Razorpay is not configured. Please use COD payment method.',
      });
      return;
    }

    const { amount } = req.body;

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      message: 'Error creating Razorpay order',
      error: error.message,
    });
  }
});

// Verify Payment
router.post('/verify-payment', async (req: Request, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay || !env.RAZORPAY_KEY_SECRET) {
      res.status(400).json({
        message: 'Razorpay is not configured.',
      });
      return;
    }

    const generatedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
      res.json({
        success: true,
        message: 'Payment verified successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid signature',
      });
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      message: 'Error verifying payment',
      error: error.message,
    });
  }
});

export default router;
