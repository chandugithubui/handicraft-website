/**
 * server/routes/authRoutes.js
 *
 * Thin router — wires HTTP verbs + paths to controller functions.
 * Zero business logic lives here; everything is in the service layer.
 */

'use strict';

const { Router }    = require('express');
const rateLimit     = require('express-rate-limit');
const controller    = require('../controllers/auth.controller');
const { auth }      = require('../middleware/auth');

const router = Router();

// ── Rate limiters ─────────────────────────────────────────────────────────────

/** Strict limiter for credential-sensitive endpoints */
const credentialLimiter = rateLimit({
  windowMs:       15 * 60 * 1000, // 15 minutes
  max:            10,
  message:        { message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders:  false,
});

/** Relaxed limiter for password-reset flow (email delivery can be slow) */
const resetLimiter = rateLimit({
  windowMs:       60 * 60 * 1000, // 1 hour
  max:            5,
  message:        { message: 'Too many reset requests. Please try again in 1 hour.' },
  standardHeaders: true,
  legacyHeaders:  false,
});

// ── Routes ────────────────────────────────────────────────────────────────────

// Email / password auth
router.post('/register',        credentialLimiter, controller.register);
router.post('/login',           credentialLimiter, controller.login);
router.post('/logout',                             controller.logout);

// Google OAuth (One Tap / popup credential flow)
router.post('/google',          credentialLimiter, controller.googleAuth);

// Protected profile — uses auth middleware (reads Bearer token OR cookie)
router.get('/profile',          auth,              controller.getProfile);

// Password reset flow
router.post('/forgot-password', resetLimiter,      controller.forgotPassword);
router.post('/reset-password/:token', resetLimiter, controller.resetPassword);

module.exports = router;
