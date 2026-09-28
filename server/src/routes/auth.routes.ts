/**
 * server/src/routes/auth.routes.ts
 *
 * Authentication router with rate limiting and Google OAuth integration.
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller';
import { auth } from '../middleware/auth.middleware';
import oauthRoutes from '../modules/auth/routes/auth.routes';

const router = Router();

const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Too many reset requests. Please try again in 1 hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Email / Password
router.post('/register', credentialLimiter, authController.register);
router.post('/login', credentialLimiter, authController.login);
router.post('/logout', authController.logout);

// Protected profile
router.get('/profile', auth, authController.getProfile);

// Password reset
router.post('/forgot-password', resetLimiter, authController.forgotPassword);
router.post('/reset-password/:token', resetLimiter, authController.resetPassword);

// OAuth 2.0 & Session management
router.use('/', oauthRoutes);

export default router;
