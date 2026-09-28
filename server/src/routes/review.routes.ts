/**
 * server/src/routes/review.routes.ts
 *
 * Review routes in TypeScript.
 */

import { Router, Request, Response } from 'express';
import { Review } from '../models/review.model';
import { Order } from '../models/order.model';
import { auth } from '../middleware/auth.middleware';

const router = Router();

// Check if authenticated user can review product (verified buyer verification)
router.get('/can-review/:productId', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { productId } = req.params;

    // Check if already reviewed
    const existingReview = await Review.findOne({
      product: productId,
      user: userId,
    });

    if (existingReview) {
      return res.json({
        canReview: false,
        reason: 'already_reviewed',
        message: 'You have already reviewed this product',
      });
    }

    // Check if user has purchased this product
    const order = await Order.findOne({
      user: userId,
      'items.product': productId,
      orderStatus: { $ne: 'cancelled' },
    });

    if (!order) {
      return res.json({
        canReview: false,
        reason: 'not_purchased',
        message: 'Only verified buyers who purchased this product can write a review',
      });
    }

    return res.json({
      canReview: true,
      reason: 'eligible',
      message: 'Verified buyer - eligible to review',
    });
  } catch (error) {
    console.error('Check review eligibility error:', error);
    return res.status(500).json({ canReview: false, message: 'Server error' });
  }
});

// Create review (restricted to verified buyers)
router.post('/', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { product, rating, comment } = req.body;
    const userId = req.user?.userId || req.user?.id;

    // Check if user purchased the product
    const order = await Order.findOne({
      user: userId,
      'items.product': product,
      orderStatus: { $ne: 'cancelled' },
    });

    if (!order) {
      return res.status(403).json({
        message: 'Only verified buyers who purchased this product can write a review',
      });
    }

    const existingReview = await Review.findOne({
      product,
      user: userId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this product',
      });
    }

    const review = new Review({
      product,
      user: userId,
      rating,
      comment,
    });

    await review.save();

    return res.status(201).json({
      message: 'Review added successfully',
      review,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'You have already reviewed this product',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error('Unexpected review creation error:', error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
});

// Get reviews for a product
router.get('/product/:productId', async (req: Request, res: Response): Promise<Response> => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : 0;

    return res.json({
      reviews,
      averageRating: avgRating.toFixed(1),
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
});

// Delete review
router.delete('/:id', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: 'Review not found',
      });
    }

    const userId = req.user?.userId || req.user?.id;
    if (review.user.toString() !== userId && req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
      return res.status(403).json({
        message: 'Access denied',
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    return res.json({
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
});

export default router;
