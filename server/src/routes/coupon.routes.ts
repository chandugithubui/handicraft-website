/**
 * server/src/routes/coupon.routes.ts
 *
 * Coupon management and validation routes in TypeScript.
 */

import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Coupon } from '../models/coupon.model';
import { auth, adminAuth } from '../middleware/auth.middleware';

const router = Router();

// Create coupon - Admin
router.post('/', auth, adminAuth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minimumOrderAmount,
      maxDiscountAmount,
      expiryDate,
      usageLimit,
      isActive,
    } = req.body;

    if (!code || !discountType || discountValue === undefined || !expiryDate) {
      return res.status(400).json({
        message: 'Code, discount type, discount value and expiry date are required',
      });
    }

    if (discountType === 'percentage' && discountValue > 100) {
      return res.status(400).json({
        message: 'Percentage discount cannot exceed 100%',
      });
    }

    const existingCoupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
    });

    if (existingCoupon) {
      return res.status(400).json({
        message: 'Coupon code already exists',
      });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minimumOrderAmount: minimumOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      expiryDate,
      usageLimit: usageLimit || null,
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({
      message: 'Coupon created successfully',
      coupon,
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    return res.status(500).json({
      message: 'Error creating coupon',
    });
  }
});

// Get coupons - Admin (supports pagination and search)
router.get('/', auth, adminAuth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const isPaginated = Boolean(req.query.page || req.query.limit || req.query.paginate);
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 10);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.search) {
      filter.code = new RegExp(String(req.query.search).trim(), 'i');
    }

    const totalCoupons = await Coupon.countDocuments(filter);
    const query = Coupon.find(filter).sort({ createdAt: -1 });

    if (isPaginated) {
      query.skip(skip).limit(limit);
    }

    const coupons = await query;

    if (isPaginated) {
      return res.status(200).json({
        coupons,
        pagination: {
          page,
          limit,
          total: totalCoupons,
          totalPages: Math.ceil(totalCoupons / limit) || 1,
        },
      });
    }

    return res.status(200).json(coupons);
  } catch (error) {
    console.error('Get coupons error:', error);
    return res.status(500).json({
      message: 'Error retrieving coupons',
    });
  }
});

// Validate / Apply Coupon - User
router.post('/validate', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { code, cartTotal } = req.body;

    if (!code || cartTotal === undefined) {
      return res.status(400).json({
        message: 'Coupon code and cart total are required',
      });
    }

    const numericCartTotal = Number(cartTotal);

    if (!Number.isFinite(numericCartTotal) || numericCartTotal < 0) {
      return res.status(400).json({
        message: 'Invalid cart total',
      });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
    });

    if (!coupon) {
      return res.status(404).json({
        message: 'Invalid coupon code',
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        message: 'This coupon is inactive',
      });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({
        message: 'This coupon has expired',
      });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        message: 'Coupon usage limit has been reached',
      });
    }

    if (numericCartTotal < coupon.minimumOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount is ₹${coupon.minimumOrderAmount}`,
      });
    }

    let discountAmount = 0;

    if (coupon.discountType === 'percentage') {
      discountAmount = (numericCartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount !== null && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, numericCartTotal);
    discountAmount = Number(discountAmount.toFixed(2));
    const finalAmount = Number((numericCartTotal - discountAmount).toFixed(2));

    return res.status(200).json({
      message: 'Coupon applied successfully',
      coupon: {
        id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      cartTotal: numericCartTotal,
      discountAmount,
      finalAmount,
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    return res.status(500).json({
      message: 'Error validating coupon',
    });
  }
});

// Update coupon - Admin
router.put('/:id', auth, adminAuth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minimumOrderAmount,
      maxDiscountAmount,
      expiryDate,
      usageLimit,
      isActive,
    } = req.body;

    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        message: 'Coupon not found',
      });
    }

    if (code !== undefined) coupon.code = code.trim().toUpperCase();
    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minimumOrderAmount !== undefined) coupon.minimumOrderAmount = minimumOrderAmount;
    if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = maxDiscountAmount;
    if (expiryDate !== undefined) coupon.expiryDate = expiryDate;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    return res.status(200).json({
      message: 'Coupon updated successfully',
      coupon,
    });
  } catch (error: any) {
    console.error('Update coupon error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    return res.status(500).json({ message: 'Failed to update coupon' });
  }
});

// Delete coupon - Admin
router.delete('/:id', auth, adminAuth, async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
      return res.status(400).json({ message: 'Invalid coupon ID' });
    }

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await coupon.deleteOne();
    return res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    return res.status(500).json({ message: 'Error deleting coupon' });
  }
});

// Active coupons - Public
router.get('/active', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gt: now },
      $or: [{ usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }],
    })
      .select('code discountType discountValue minimumOrderAmount maxDiscountAmount expiryDate')
      .sort({ createdAt: -1 });

    return res.status(200).json(coupons);
  } catch (error) {
    console.error('Fetch active coupons error:', error);
    return res.status(500).json({ message: 'Failed to fetch active coupons' });
  }
});

export default router;
