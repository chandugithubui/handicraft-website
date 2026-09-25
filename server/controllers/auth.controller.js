/**
 * server/controllers/auth.controller.js
 *
 * Thin HTTP layer — validate input shapes, call the service,
 * send the response. Zero business logic lives here.
 *
 * Cookie strategy
 * ───────────────
 * On every successful auth action we set an httpOnly cookie
 * ("hh_token") AND return the token in the JSON body so that
 * the React client can store it in memory / localStorage as
 * well (dual-mode — supports both patterns).
 */

'use strict';

const authService = require('../services/auth.service');
const env         = require('../config/env');

// ── Cookie helpers ────────────────────────────────────────────────────────────

const COOKIE_NAME = 'hh_token';

/** Milliseconds for a 7-day cookie */
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

/**
 * Write the httpOnly auth cookie on the response.
 * sameSite=None + secure=true are required for cross-origin
 * requests (Vercel frontend → Render backend).
 */
const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   env.isProduction,
    sameSite: env.isProduction ? 'None' : 'Lax',
    maxAge:   COOKIE_MAX_AGE,
  });
};

/** Clear ALL auth cookies on logout (legacy + new OAuth). */
const clearAuthCookie = (res) => {
  const opts = {
    httpOnly: true,
    secure:   env.isProduction,
    sameSite: env.isProduction ? 'None' : 'Lax',
  };
  res.clearCookie(COOKIE_NAME, opts);         // hh_token (legacy)
  res.clearCookie('access_token', opts);      // short-lived access token
  res.clearCookie('refresh_token', opts);     // long-lived refresh token
  res.clearCookie('oauth_state', opts);       // CSRF state cookie
  res.clearCookie('oauth_nonce', opts);       // nonce cookie
  res.clearCookie('oauth_redirect_uri', opts);// redirect URI cookie
};

// ── Error handler ─────────────────────────────────────────────────────────────

/**
 * Normalise any thrown value into a JSON error response.
 * Service functions attach a `statusCode` property so we
 * honour it; everything else gets a 500.
 */
const handleError = (res, error) => {
  const status  = error.statusCode || 500;
  const message = error.message    || 'An unexpected error occurred.';

  if (status >= 500) {
    // Only log stack traces for server errors — not for 4xx
    console.error(`[Auth] ${status} —`, error);
  }

  return res.status(status).json({ message });
};

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const result = await authService.register({ name, email, password });
    setAuthCookie(res, result.token);
    return res.status(201).json({
      message: 'Account created successfully.',
      token:   result.token,
      user:    result.user,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const result = await authService.login({ email, password });
    setAuthCookie(res, result.token);
    return res.json({
      message: 'Login successful.',
      token:   result.token,
      user:    result.user,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * GET /api/auth/profile
 * Requires auth middleware — reads userId from req.user (set by middleware).
 */
const getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.userId);
    return res.json({ user });
  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * POST /api/auth/logout
 * Clears the httpOnly cookie. Body/token state is managed by the client.
 */
const logout = (_req, res) => {
  clearAuthCookie(res);
  return res.json({ message: 'Logged out successfully.' });
};

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const result = await authService.forgotPassword(email);
    return res.json(result);
  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * POST /api/auth/reset-password/:token
 * Body: { password }
 */
const resetPassword = async (req, res) => {
  const { token }    = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'New password is required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const result = await authService.resetPassword(token, password);
    return res.json(result);
  } catch (err) {
    return handleError(res, err);
  }
};

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  register,
  login,
  getProfile,
  logout,
  forgotPassword,
  resetPassword,
};
