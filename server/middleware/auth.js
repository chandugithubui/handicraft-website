/**
 * server/middleware/auth.js
 *
 * JWT verification middleware.
 *
 * Token lookup order (dual-mode support):
 *   1. Authorization: Bearer <token>  header  (API clients, Postman)
 *   2. hh_token httpOnly cookie               (browser sessions)
 *
 * Exports:
 *   auth      — any authenticated user
 *   adminAuth — authenticated user with role === 'admin'
 */

'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

const COOKIE_NAME = 'hh_token';

/**
 * Extract JWT from request.
 * Prefers Authorization header; falls back to the httpOnly cookie.
 *
 * @param {import('express').Request} req
 * @returns {string|null}
 */
const extractToken = (req) => {
  const authHeader = req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7); // strip "Bearer "
  }
  return req.cookies?.[COOKIE_NAME] ?? null;
};

// ── Middleware ────────────────────────────────────────────────────────────────

/**
 * Verify JWT and attach decoded payload to req.user.
 * Rejects with 401 if token is missing, malformed, or expired.
 */
const auth = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      message: 'Authentication required. Please log in.',
    });
  }

  try {
    req.user = jwt.verify(token, env.JWT_SECRET);
    return next();
  } catch (err) {
    // Distinguish expired from otherwise-invalid tokens for better UX
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Session expired. Please log in again.',
        code:    'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      message: 'Invalid authentication token.',
    });
  }
};

/**
 * Same as auth but additionally requires role === 'admin'.
 * Returns 403 (Forbidden) when the user is authenticated but not an admin.
 */
const adminAuth = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      message: 'Authentication required. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Admin privileges required.',
      });
    }

    req.user = decoded;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Session expired. Please log in again.',
        code:    'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      message: 'Invalid authentication token.',
    });
  }
};

module.exports = { auth, adminAuth };
