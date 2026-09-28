/**
 * server/src/routes/user.routes.ts
 *
 * Customer User Dashboard, Profile, Cart, and Wishlist routes.
 * Enables persistent database synchronization for Cart & Wishlist with Redux on the client.
 */

import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Product } from '../models/product.model';
import { Order } from '../models/order.model';
import { auth } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/user/profile
 * Get authenticated user's profile details.
 */
router.get('/profile', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const user = await User.findById(userId).select('-password -refreshTokens -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, user });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PUT /api/user/profile
 * Update authenticated user's profile details.
 */
router.put('/profile', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { name, phone, address } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone ? phone.trim() : null;
    if (address !== undefined) user.address = address ? address.trim() : null;

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/user/dashboard-summary
 * Get aggregated dashboard statistics for customer user.
 */
router.get('/dashboard-summary', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId || req.user?.id;

    // Fetch user with cart & wishlist counts
    const user = await User.findById(userId).select('cart wishlist name email phone address');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch user's orders
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o: any) => o.orderStatus === 'pending' || o.orderStatus === 'processing').length;
    const deliveredOrders = orders.filter((o: any) => o.orderStatus === 'delivered').length;
    const totalSpent = orders
      .filter((o: any) => o.orderStatus !== 'cancelled')
      .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

    const cartCount = (user.cart || []).reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
    const wishlistCount = (user.wishlist || []).length;

    return res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
        },
        stats: {
          totalOrders,
          pendingOrders,
          deliveredOrders,
          totalSpent,
          cartCount,
          wishlistCount,
        },
        recentOrders: orders.slice(0, 5),
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard summary:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/user/cart
 * Get user's cart populated with current product data (stock, price, etc.)
 */
router.get('/cart', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const user = await User.findById(userId).populate({
      path: 'cart.product',
      select: 'name price imageUrl category stock description rating numReviews',
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Filter out any products that were deleted from DB
    const validCartItems = (user.cart || [])
      .filter((item: any) => item.product && item.product._id)
      .map((item: any) => {
        const prod = item.product;
        return {
          _id: prod._id,
          name: prod.name,
          price: prod.price,
          image: prod.imageUrl,
          imageUrl: prod.imageUrl,
          category: prod.category,
          stock: prod.stock,
          quantity: Math.min(item.quantity, prod.stock > 0 ? prod.stock : 1),
        };
      });

    return res.json({ success: true, items: validCartItems });
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/user/cart
 * Add or update an item in user's cart in DB.
 */
router.post('/cart', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.cart) {
      user.cart = [];
    }

    const existingIndex = user.cart.findIndex(
      (item: any) => item.product.toString() === productId.toString()
    );

    let targetQuantity = quantity;

    if (existingIndex > -1) {
      targetQuantity = quantity;
      // Cap at product stock
      if (product.stock !== undefined && targetQuantity > product.stock) {
        targetQuantity = product.stock;
      }
      if (targetQuantity <= 0) {
        user.cart.splice(existingIndex, 1);
      } else {
        user.cart[existingIndex].quantity = targetQuantity;
      }
    } else {
      if (targetQuantity <= 0) {
        return res.status(400).json({ success: false, message: 'Quantity must be greater than 0' });
      }
      if (product.stock !== undefined && targetQuantity > product.stock) {
        targetQuantity = product.stock;
      }
      user.cart.push({
        product: new mongoose.Types.ObjectId(productId),
        quantity: targetQuantity,
      });
    }

    await user.save();

    return res.json({
      success: true,
      message: 'Cart updated in database',
      cart: user.cart,
    });
  } catch (error: any) {
    console.error('Error updating cart:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PUT /api/user/cart/sync
 * Bulk synchronize guest cart items to DB upon login.
 */
router.put('/cart/sync', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { items = [] } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.cart) {
      user.cart = [];
    }

    // Merge items
    for (const item of items) {
      const pId = item._id || item.product;
      if (!pId) continue;

      const product = await Product.findById(pId);
      if (!product) continue;

      const existing = user.cart.find((ci: any) => ci.product.toString() === pId.toString());
      if (existing) {
        existing.quantity = Math.min(
          existing.quantity + (item.quantity || 1),
          product.stock || 99
        );
      } else {
        user.cart.push({
          product: new mongoose.Types.ObjectId(pId),
          quantity: Math.min(item.quantity || 1, product.stock || 99),
        });
      }
    }

    await user.save();

    // Populate and return merged cart
    const populatedUser = await User.findById(userId).populate({
      path: 'cart.product',
      select: 'name price imageUrl category stock',
    });

    const validCartItems = (populatedUser?.cart || [])
      .filter((ci: any) => ci.product && ci.product._id)
      .map((ci: any) => ({
        _id: ci.product._id,
        name: ci.product.name,
        price: ci.product.price,
        image: ci.product.imageUrl,
        imageUrl: ci.product.imageUrl,
        category: ci.product.category,
        stock: ci.product.stock,
        quantity: ci.quantity,
      }));

    return res.json({ success: true, items: validCartItems });
  } catch (error: any) {
    console.error('Error syncing cart:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * DELETE /api/user/cart/:productId
 * Remove single item from cart.
 */
router.delete('/cart/:productId', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { productId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.cart) {
      user.cart = user.cart.filter((item: any) => item.product.toString() !== productId);
      await user.save();
    }

    return res.json({ success: true, message: 'Item removed from cart' });
  } catch (error: any) {
    console.error('Error removing from cart:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * DELETE /api/user/cart
 * Clear whole cart.
 */
router.delete('/cart', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId || req.user?.id;
    await User.findByIdAndUpdate(userId, { cart: [] });
    return res.json({ success: true, message: 'Cart cleared' });
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/user/wishlist
 * Get user's wishlist populated with product details.
 */
router.get('/wishlist', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const user = await User.findById(userId).populate({
      path: 'wishlist',
      select: 'name price imageUrl category stock rating numReviews originalPrice description',
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const items = (user.wishlist || [])
      .filter((p: any) => p && p._id)
      .map((p: any) => ({
        _id: p._id,
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        image: p.imageUrl,
        imageUrl: p.imageUrl,
        category: p.category,
        stock: p.stock,
        rating: p.rating,
        numReviews: p.numReviews,
        description: p.description,
      }));

    return res.json({ success: true, items });
  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/user/wishlist/:productId
 * Toggle or add product to wishlist.
 */
router.post('/wishlist/:productId', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const productId = req.params.productId as string;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.wishlist) {
      user.wishlist = [];
    }

    const exists = user.wishlist.some((id: any) => id.toString() === productId);
    let added = false;

    if (exists) {
      user.wishlist = user.wishlist.filter((id: any) => id.toString() !== productId);
    } else {
      user.wishlist.push(new mongoose.Types.ObjectId(productId));
      added = true;
    }

    await user.save();

    return res.json({
      success: true,
      added,
      message: added ? 'Product added to wishlist' : 'Product removed from wishlist',
      wishlistCount: user.wishlist.length,
    });
  } catch (error: any) {
    console.error('Error toggling wishlist:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * DELETE /api/user/wishlist/:productId
 * Remove product from wishlist.
 */
router.delete('/wishlist/:productId', auth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const productId = req.params.productId as string;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.wishlist) {
      user.wishlist = user.wishlist.filter((id: any) => id.toString() !== productId);
      await user.save();
    }

    return res.json({ success: true, message: 'Item removed from wishlist' });
  } catch (error: any) {
    console.error('Error removing from wishlist:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
