/**
 * server/config/env.js
 *
 * Single source of truth for all environment variables.
 * Validates required vars at startup so missing config is
 * caught immediately rather than producing cryptic runtime errors.
 */

'use strict';

const REQUIRED = [
  'MONGODB_URI',
  'JWT_SECRET',
];

const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `[Config] FATAL — missing required environment variables:\n  ${missing.join('\n  ')}`
  );
  process.exit(1);
}

module.exports = {
  // ── Server ────────────────────────────────────────────────────────────────
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // ── Database ──────────────────────────────────────────────────────────────
  MONGODB_URI: process.env.MONGODB_URI,

  // ── Auth ──────────────────────────────────────────────────────────────────
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // ── CORS ──────────────────────────────────────────────────────────────────
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',

  // ── Frontend (used in password-reset emails) ─────────────────────────────
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // ── Email (Resend) ────────────────────────────────────────────────────────
  RESEND_API_KEY: process.env.RESEND_API_KEY,

  // ── Payments ─────────────────────────────────────────────────────────────
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
};
