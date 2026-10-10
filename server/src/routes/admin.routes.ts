/**
 * server/src/routes/admin.routes.ts
 *
 * Administrator dashboard and reporting routes in TypeScript.
 */

import { Router, Request, Response } from 'express';
import { User } from '../models/user.model';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { Contact } from '../models/contact.model';
import { adminAuth } from '../middleware/auth.middleware';

const router = Router();

// Get dashboard statistics
router.get('/stats', adminAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    // Count only customer accounts (exclude admin roles)
    const totalUsers = await User.countDocuments({
      role: { $nin: ['admin', 'super_admin', 'moderator', 'editor'] }
    });

    // Count all orders
    const totalOrders = await Order.countDocuments();

    // Count all products
    const totalProducts = await Product.countDocuments();

    // Calculate revenue from completed/valid orders only
    // Exclude cancelled orders and failed payments
    // COD orders with 'pending' payment status are included as valid revenue expectation
    const revenueResult = await Order.aggregate([
      {
        $match: {
          orderStatus: { $nin: ['cancelled'] },
          paymentStatus: { $ne: 'failed' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    // Get recent orders with user info
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    res.json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      totalSales: totalRevenue, // Alias for backward compatibility
      recentOrders,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get orders (supports pagination, status, and search)
router.get('/orders', adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const isPaginated = Boolean(req.query.page || req.query.limit || req.query.paginate);
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 10);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.status && req.query.status !== 'all') {
      filter.orderStatus = req.query.status;
    }
    if (req.query.search) {
      const searchRegex = new RegExp(String(req.query.search).trim(), 'i');
      filter.$or = [
        { 'shippingAddress.fullName': searchRegex },
        { 'shippingAddress.email': searchRegex },
      ];
    }

    const totalOrders = await Order.countDocuments(filter);
    const query = Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    if (isPaginated) {
      query.skip(skip).limit(limit);
    }

    const orders = await query;

    const ordersWithFixedImages = orders.map((order: any) => {
      const fixedItems = (order.items || []).map((item: any) => {
        let imageUrl = item.image;
        if (imageUrl && imageUrl.endsWith('.jpg.jpg')) {
          imageUrl = imageUrl.replace('.jpg.jpg', '.jpg');
        }
        if (imageUrl && imageUrl.endsWith('.jpeg.jpeg')) {
          imageUrl = imageUrl.replace('.jpeg.jpeg', '.jpeg');
        }
        return {
          ...item,
          image: imageUrl,
          price: item.price || 0,
          quantity: item.quantity || 1,
        };
      });
      return { ...order.toObject(), items: fixedItems };
    });

    if (isPaginated) {
      res.json({
        orders: ordersWithFixedImages,
        pagination: {
          page,
          limit,
          total: totalOrders,
          totalPages: Math.ceil(totalOrders / limit) || 1,
        },
      });
      return;
    }

    res.json(ordersWithFixedImages);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get users (supports pagination, role filter, and search)
router.get('/users', adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const isPaginated = Boolean(req.query.page || req.query.limit || req.query.paginate);
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 10);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.role && req.query.role !== 'ALL') {
      filter.role = req.query.role;
    }
    if (req.query.search) {
      const searchRegex = new RegExp(String(req.query.search).trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
      ];
    }

    const totalUsers = await User.countDocuments(filter);
    const query = User.find(filter).select('-password').sort({ createdAt: -1 });

    if (isPaginated) {
      query.skip(skip).limit(limit);
    }

    const users = await query;

    if (isPaginated) {
      res.json({
        users,
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / limit) || 1,
        },
      });
      return;
    }

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get contacts (supports pagination and search)
router.get('/contacts', adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const isPaginated = Boolean(req.query.page || req.query.limit || req.query.paginate);
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 10);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.search) {
      const searchRegex = new RegExp(String(req.query.search).trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
      ];
    }

    const totalContacts = await Contact.countDocuments(filter);
    const query = Contact.find(filter).sort({ createdAt: -1, date: -1 });

    if (isPaginated) {
      query.skip(skip).limit(limit);
    }

    const contacts = await query;

    if (isPaginated) {
      res.json({
        contacts,
        pagination: {
          page,
          limit,
          total: totalContacts,
          totalPages: Math.ceil(totalContacts / limit) || 1,
        },
      });
      return;
    }

    res.json(contacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
