const express = require('express');
const mongoose = require('mongoose');
const Coupon = require('../models/coupon');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

/* =========================================================
   CREATE COUPON - ADMIN
   ========================================================= */

router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minimumOrderAmount,
      maxDiscountAmount,
      expiryDate,
      usageLimit,
      isActive
    } = req.body;

    if (!code || !discountType || discountValue === undefined || !expiryDate) {
      return res.status(400).json({
        message: 'Code, discount type, discount value and expiry date are required'
      });
    }

    if (discountType === 'percentage' && discountValue > 100) {
      return res.status(400).json({
        message: 'Percentage discount cannot exceed 100%'
      });
    }

    const existingCoupon = await Coupon.findOne({
      code: code.trim().toUpperCase()
    });

    if (existingCoupon) {
      return res.status(400).json({
        message: 'Coupon code already exists'
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
      isActive: isActive !== undefined ? isActive : true
    });

    return res.status(201).json({
      message: 'Coupon created successfully',
      coupon
    });
  } catch (error) {
    console.error('Create coupon error:', error);

    return res.status(500).json({
      message: 'Error creating coupon'
    });
  }
});


/* =========================================================
   GET ALL COUPONS - ADMIN
   ========================================================= */

router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    return res.status(200).json(coupons);
  } catch (error) {
    console.error('Get coupons error:', error);

    return res.status(500).json({
      message: 'Error retrieving coupons'
    });
  }
});


/* =========================================================
   VALIDATE / APPLY COUPON - USER
   ========================================================= */

router.post('/validate', auth, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code || cartTotal === undefined) {
      return res.status(400).json({
        message: 'Coupon code and cart total are required'
      });
    }

    const numericCartTotal = Number(cartTotal);

    if (!Number.isFinite(numericCartTotal) || numericCartTotal < 0) {
      return res.status(400).json({
        message: 'Invalid cart total'
      });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase()
    });

    if (!coupon) {
      return res.status(404).json({
        message: 'Invalid coupon code'
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        message: 'This coupon is inactive'
      });
    }

    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({
        message: 'This coupon has expired'
      });
    }

    if (
      coupon.usageLimit !== null &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return res.status(400).json({
        message: 'Coupon usage limit has been reached'
      });
    }

    if (numericCartTotal < coupon.minimumOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount is ₹${coupon.minimumOrderAmount}`
      });
    }

    let discountAmount = 0;

    if (coupon.discountType === 'percentage') {
      discountAmount =
        (numericCartTotal * coupon.discountValue) / 100;

      if (
        coupon.maxDiscountAmount !== null &&
        discountAmount > coupon.maxDiscountAmount
      ) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Never allow discount to exceed cart total.
    discountAmount = Math.min(discountAmount, numericCartTotal);

    discountAmount = Number(discountAmount.toFixed(2));

    const finalAmount = Number(
      (numericCartTotal - discountAmount).toFixed(2)
    );

    return res.status(200).json({
      message: 'Coupon applied successfully',

      coupon: {
        id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      },

      cartTotal: numericCartTotal,
      discountAmount,
      finalAmount
    });
  } catch (error) {
    console.error('Validate coupon error:', error);

    return res.status(500).json({
      message: 'Error validating coupon'
    });
  }
});
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minimumOrderAmount,
      maxDiscountAmount,
      expiryDate,
      usageLimit,
      isActive
    } = req.body;

    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        message: 'Coupon not found'
      });
    }

    if (code !== undefined) {
      coupon.code = code.trim().toUpperCase();
    }

    if (discountType !== undefined) {
      coupon.discountType = discountType;
    }

    if (discountValue !== undefined) {
      coupon.discountValue = discountValue;
    }

    if (minimumOrderAmount !== undefined) {
      coupon.minimumOrderAmount = minimumOrderAmount;
    }

    if (maxDiscountAmount !== undefined) {
      coupon.maxDiscountAmount = maxDiscountAmount;
    }

    if (expiryDate !== undefined) {
      coupon.expiryDate = expiryDate;
    }

    if (usageLimit !== undefined) {
      coupon.usageLimit = usageLimit;
    }

    if (isActive !== undefined) {
      coupon.isActive = isActive;
    }

    await coupon.save();

    return res.status(200).json({
      message: 'Coupon updated successfully',
      coupon
    });
  } catch (error) {
    console.error('Update coupon error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Coupon code already exists'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: 'Failed to update coupon'
    });
  }
});

/* =========================================================
   DELETE COUPON - ADMIN
   ========================================================= */

router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid coupon ID'
      });
    }

    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        message: 'Coupon not found'
      });
    }

    await coupon.deleteOne();

    return res.status(200).json({
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Delete coupon error:', error);

    return res.status(500).json({
      message: 'Error deleting coupon'
    });
  }
});

module.exports = router;