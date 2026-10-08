/**
 * server/src/routes/index.ts
 *
 * Central router mounting all application API endpoints with TypeScript.
 */

import { Router } from 'express';
import productRoutes from './product.routes';
import artisanRoutes from './artisan.routes';
import contactRoutes from './contact.routes';
import categoryRoutes from './category.routes';
import authRoutes from './auth.routes';
import orderRoutes from './order.routes';
import adminRoutes from './admin.routes';
import reviewRoutes from './review.routes';
import couponRoutes from './coupon.routes';
import paymentRoutes from './payment.routes';
import newsletterRoutes from './newsletter.routes';
import uploadRoutes from './upload.routes';
import testimonialRoutes from './testimonial.routes';
import rbacRoutes from '../modules/rbac/routes/rbac.routes';
import userRoutes from './user.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        status: 'healthy',
        message: 'Handicraft Hub API is running',
    });
});

router.use('/products', productRoutes);
router.use('/artisans', artisanRoutes);
router.use('/contacts', contactRoutes);
router.use('/categories', categoryRoutes);
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);
router.use('/payment', paymentRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/upload', uploadRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/rbac', rbacRoutes);
router.use('/user', userRoutes);

export default router;
