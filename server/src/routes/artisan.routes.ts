/**
 * server/src/routes/artisan.routes.ts
 *
 * Artisan routes in TypeScript.
 */

import { Router, Request, Response } from 'express';
import { Artisan } from '../models/artisan.model';
import { Product } from '../models/product.model';
import { auth, adminAuth } from '../middleware/auth.middleware';

const router = Router();

// GET products by artisan slug
router.get('/:slug/products', async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = (req.params.slug as string).toLowerCase();
    const artisan = await Artisan.findOne({ slug });

    if (!artisan) {
      res.status(404).json({ message: 'Artisan not found' });
      return;
    }

    const products = await Product.find({ artisan: artisan._id }).sort({ _id: -1 });
    res.status(200).json(products);
  } catch (error: any) {
    console.error('Get artisan products error:', error.message);
    res.status(500).json({ message: 'Failed to fetch artisan products' });
  }
});

// GET all artisans
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const artisans = await Artisan.find();
    const artisanOrder = ['rakesh-prusty', 'monalisa-sahoo', 'jagannath-das'];

    artisans.sort((a, b) => {
      const idxA = artisanOrder.indexOf(a.slug);
      const idxB = artisanOrder.indexOf(b.slug);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    res.status(200).json(artisans);
  } catch (error: any) {
    console.error('Get artisans error:', error.message);
    res.status(500).json({ message: 'Failed to fetch artisans' });
  }
});

// GET single artisan by slug
router.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = (req.params.slug as string).toLowerCase();
    const artisan = await Artisan.findOne({ slug });

    if (!artisan) {
      res.status(404).json({ message: 'Artisan not found' });
      return;
    }

    res.status(200).json(artisan);
  } catch (error: any) {
    console.error('Get artisan error:', error.message);
    res.status(500).json({ message: 'Failed to fetch artisan' });
  }
});

// POST create artisan - Admin only
router.post('/', auth, adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug, ...rest } = req.body;
    const existingArtisan = await Artisan.findOne({ slug: slug?.toLowerCase() });

    if (existingArtisan) {
      res.status(400).json({ message: 'Artisan with this slug already exists' });
      return;
    }

    const artisan = new Artisan({ slug: slug?.toLowerCase(), ...rest });
    const savedArtisan = await artisan.save();
    res.status(201).json(savedArtisan);
  } catch (error: any) {
    console.error('Create artisan error:', error.message);
    res.status(500).json({ message: 'Failed to create artisan' });
  }
});

// PUT update artisan - Admin only
router.put('/:id', auth, adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const artisan = await Artisan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!artisan) {
      res.status(404).json({ message: 'Artisan not found' });
      return;
    }

    res.status(200).json(artisan);
  } catch (error: any) {
    console.error('Update artisan error:', error.message);
    res.status(500).json({ message: 'Failed to update artisan' });
  }
});

// DELETE delete artisan - Admin only
router.delete('/:id', auth, adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const artisan = await Artisan.findByIdAndDelete(req.params.id);

    if (!artisan) {
      res.status(404).json({ message: 'Artisan not found' });
      return;
    }

    res.status(200).json({ message: 'Artisan deleted successfully' });
  } catch (error: any) {
    console.error('Delete artisan error:', error.message);
    res.status(500).json({ message: 'Failed to delete artisan' });
  }
});

export default router;
