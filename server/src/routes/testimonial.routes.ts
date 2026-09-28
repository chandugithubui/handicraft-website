/**
 * server/src/routes/testimonial.routes.ts
 *
 * Testimonials route in TypeScript.
 */

import { Router, Request, Response } from 'express';
import { Testimonial } from '../models/testimonial.model';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const testimonials = await Testimonial.find({ active: true }).sort({ createdAt: -1 });
    res.status(200).json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ message: 'Failed to fetch testimonials' });
  }
});

export default router;
