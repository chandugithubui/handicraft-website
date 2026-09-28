/**
 * server/src/routes/newsletter.routes.ts
 *
 * Newsletter subscription routes in TypeScript.
 */

import { Router, Request, Response } from 'express';
import { Newsletter } from '../models/newsletter.model';
import { adminAuth } from '../middleware/auth.middleware';

const router = Router();

// Subscribe
router.post('/subscribe', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || !email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      });
      return;
    }

    const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (existingSubscriber) {
      if (existingSubscriber.status === 'unsubscribed') {
        existingSubscriber.status = 'active';
        existingSubscriber.subscribedAt = new Date();
        await existingSubscriber.save();
        res.status(200).json({
          success: true,
          message: 'Welcome back! You have been resubscribed to our newsletter.',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'You are already subscribed to our newsletter!',
      });
      return;
    }

    const subscriber = new Newsletter({
      email: email.toLowerCase(),
    });

    await subscriber.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing to our newsletter!',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.',
    });
  }
});

// Admin get subscribers (supports pagination and search)
router.get('/subscribers', adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const isPaginated = Boolean(req.query.page || req.query.limit || req.query.paginate);
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 10);
    const skip = (page - 1) * limit;

    const filter: any = { status: 'active' };
    if (req.query.search) {
      filter.email = new RegExp(String(req.query.search).trim(), 'i');
    }

    const totalSubscribers = await Newsletter.countDocuments(filter);
    const query = Newsletter.find(filter).sort({ subscribedAt: -1 });

    if (isPaginated) {
      query.skip(skip).limit(limit);
    }

    const subscribers = await query;

    res.status(200).json({
      success: true,
      subscribers,
      pagination: {
        page,
        limit,
        total: totalSubscribers,
        totalPages: Math.ceil(totalSubscribers / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscribers',
    });
  }
});

// Unsubscribe
router.post('/unsubscribe', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (!subscriber) {
      res.status(404).json({
        success: false,
        message: 'Email not found in our newsletter list',
      });
      return;
    }

    subscriber.status = 'unsubscribed';
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: 'You have been unsubscribed from our newsletter',
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.',
    });
  }
});

export default router;
