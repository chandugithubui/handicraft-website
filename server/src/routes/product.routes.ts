/**
 * server/src/routes/product.routes.ts
 *
 * Product catalog, filtering, review aggregations, and admin CRUD routes in TypeScript.
 */

import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/product.model';
import { Review } from '../models/review.model';
import { adminAuth } from '../middleware/auth.middleware';

const router = Router();

// GET all products with filters
router.get('/', async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      material,
      page = '1',
      limit = '12',
      sort = 'newest',
    } = req.query as Record<string, string>;

    const pageNumber = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNumber = Math.max(1, parseInt(String(limit), 10) || 12);
    const skip = (pageNumber - 1) * limitNumber;

    let sortOption: any = { _id: -1 };
    switch (sort) {
      case 'price-low-high':
        sortOption = { price: 1 };
        break;
      case 'price-high-low':
        sortOption = { price: -1 };
        break;
      case 'name-a-z':
        sortOption = { name: 1 };
        break;
      case 'newest':
      default:
        sortOption = { _id: -1 };
        break;
    }

    const query: any = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (material) query.material = { $regex: new RegExp(`^${material}$`, 'i') };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortOption).skip(skip).limit(limitNumber);

    const productIds = products.map((p) => p._id);
    const reviewStats = await Review.aggregate([
      { $match: { product: { $in: productIds } } },
      {
        $group: {
          _id: '$product',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const reviewStatsMap: Record<string, { averageRating: number; totalReviews: number }> = {};
    reviewStats.forEach((stat) => {
      reviewStatsMap[stat._id.toString()] = {
        averageRating: Number(stat.averageRating.toFixed(1)),
        totalReviews: stat.totalReviews,
      };
    });

    const productsWithFixedImages = products.map((product) => {
      const productData = product.toObject();
      if (productData.imageUrl) {
        if (productData.imageUrl.endsWith('.jpg.jpg')) {
          productData.imageUrl = productData.imageUrl.replace('.jpg.jpg', '.jpg');
        }
        if (productData.imageUrl.endsWith('.jpeg.jpeg')) {
          productData.imageUrl = productData.imageUrl.replace('.jpeg.jpeg', '.jpeg');
        }
      }
      const stats = reviewStatsMap[product._id.toString()];
      productData.rating = stats ? stats.averageRating : 0;
      productData.numReviews = stats ? stats.totalReviews : 0;
      return productData;
    });

    const totalPages = Math.ceil(totalProducts / limitNumber);

    return res.status(200).json({
      products: productsWithFixedImages,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalProducts,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error('Product fetch error:', error);
    return res.status(500).json({ message: 'Error retrieving products' });
  }
});

// GET single product by ID
router.get('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productData = product.toObject();
    if (productData.imageUrl) {
      if (productData.imageUrl.endsWith('.jpg.jpg')) {
        productData.imageUrl = productData.imageUrl.replace('.jpg.jpg', '.jpg');
      }
      if (productData.imageUrl.endsWith('.jpeg.jpeg')) {
        productData.imageUrl = productData.imageUrl.replace('.jpeg.jpeg', '.jpeg');
      }
    }

    return res.status(200).json(productData);
  } catch (error) {
    console.error('Single product fetch error:', error);
    return res.status(500).json({ message: 'Error retrieving product' });
  }
});

// POST add new product - Admin
router.post('/', adminAuth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, price, description, imageUrl, category, material, stock } = req.body;

    if (!name || !price || !description || !imageUrl) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newProduct = new Product({
      name,
      price,
      description,
      imageUrl,
      category: category || 'General',
      material,
      stock: stock || 0,
    });

    const savedProduct = await newProduct.save();
    return res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Product save error:', error);
    return res.status(500).json({ message: 'Error adding product' });
  }
});

// PUT edit product - Admin
router.put('/:id', adminAuth, async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const allowedFields = [
      'name',
      'price',
      'description',
      'imageUrl',
      'category',
      'material',
      'stock',
      'featured',
    ];
    const updates: Record<string, any> = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(product);
  } catch (error: any) {
    console.error('Edit product error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: `Validation error: ${error.message}` });
    }
    return res.status(500).json({ message: 'Error updating product' });
  }
});

// DELETE product - Admin
router.delete('/:id', adminAuth, async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ message: 'Error deleting product' });
  }
});

// PATCH update stock - Admin
router.patch('/:id/stock', adminAuth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    console.error('Stock update error:', error);
    return res.status(500).json({ message: 'Error updating stock' });
  }
});

export default router;
