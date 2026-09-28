/**
 * server/src/routes/category.routes.ts
 *
 * Category routes in TypeScript.
 */

import { Router, Request, Response } from 'express';
import { Category } from '../models/category.model';

const router = Router();

// GET all categories
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories', error: err });
  }
});

// POST new category
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { name, description } = req.body;

  if (!name || !description) {
    res.status(400).json({ message: 'Name and description are required' });
    return;
  }

  try {
    const newCategory = new Category({ name, description });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create category', error: err });
  }
});

export default router;
