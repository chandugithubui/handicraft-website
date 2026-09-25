/**
 * server/src/modules/auth/routes/auth.routes.ts
 *
 * Dedicated Express router for Google OAuth 2.0 and session management.
 * Protected with strict rate limiting and centralized error handling.
 */

import { Router } from 'express';
import { googleAuthController } from '../controllers/google-auth.controller';
import {
  authenticate,
  oauthRateLimiter,
  refreshRateLimiter,
} from '../middleware/auth.middleware';
import { authErrorHandler } from '../middleware/error.middleware';

const router = Router();

// ── Google OAuth Endpoints ────────────────────────────────────────────────────

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth 2.0 Authorization Code flow with CSRF state
 * @access  Public (Rate limited)
 */
router.get('/google', oauthRateLimiter, googleAuthController.initiateGoogleAuth);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback endpoint: exchanges code, creates/links user, sets cookies
 * @access  Public (Rate limited)
 */
router.get(
  '/google/callback',
  oauthRateLimiter,
  googleAuthController.handleGoogleCallback
);

// ── Session & Token Endpoints ─────────────────────────────────────────────────

/**
 * @route   POST /api/auth/refresh
 * @desc    Rotate refresh token and issue fresh access token
 * @access  Public with valid Refresh Token (Rate limited)
 */
router.post('/refresh', refreshRateLimiter, googleAuthController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Revoke session and clear authentication cookies
 * @access  Public / Optional Auth
 */
router.post('/logout', googleAuthController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Retrieve profile of currently authenticated user
 * @access  Protected (Requires valid Access Token)
 */
router.get('/me', authenticate, googleAuthController.getCurrentUser);

// Apply centralized authentication error handler to all auth routes
router.use(authErrorHandler);

export default router;
