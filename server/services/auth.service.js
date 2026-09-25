/**
 * server/services/auth.service.js
 *
 * Pure business logic — no req/res, no Express concepts.
 * Each function receives plain data and returns plain data
 * (or throws an AppError that the controller catches).
 */

'use strict';

const crypto   = require('crypto');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const User      = require('../models/user');
const sendEmail = require('../utils/sendEmail');
const env       = require('../config/env');

// ── Helpers ───────────────────────────────────────────────────────────────────

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

/**
 * Sign a Handicraft Hub JWT for a user document.
 * @param {object} user - Mongoose User document
 * @returns {string} signed JWT
 */
const signToken = (user) =>
  jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

/**
 * Shape of the public user object returned to the client.
 * Never expose password, resetPasswordToken, etc.
 */
const publicUser = (user) => ({
  id:     user._id,
  name:   user.name,
  email:  user.email,
  role:   user.role,
  avatar: user.avatar ?? null,
});

// ── Auth service ──────────────────────────────────────────────────────────────

/**
 * Register a new local (email/password) account.
 * @throws {Error} 409 if email already registered
 */
const register = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    const err = new Error('An account with this email already exists.');
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name:         name.trim(),
    email:        normalizedEmail,
    password:     hashedPassword,
    role:         'user',          // never from request body
    authProvider: 'local',
  });

  const token = signToken(user);
  return { token, user: publicUser(user) };
};

/**
 * Authenticate with email + password.
 * @throws {Error} 401 for any credential mismatch (generic message prevents enumeration)
 */
const login = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Include password field explicitly (schema select:false pattern not used here
  // but we still guard against Google-only accounts)
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  // Account was created via Google — no local password set
  if (!user.password) {
    const err = new Error(
      'This account uses Google Sign-In. Please continue with Google.'
    );
    err.statusCode = 400;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const token = signToken(user);
  return { token, user: publicUser(user) };
};

/**
 * Verify a Google ID token, then find-or-create a user.
 * Links Google identity to an existing local account if the
 * verified email matches.
 *
 * @param {string} credential - Raw Google ID token from @react-oauth/google
 */
const googleAuth = async (credential) => {
  // 1. Verify token with Google — throws if invalid / expired / wrong audience
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken:  credential,
      audience: env.GOOGLE_CLIENT_ID,
    });
  } catch (verifyError) {
    const err = new Error('Google token verification failed.');
    err.statusCode = 401;
    err.cause = verifyError;
    throw err;
  }

  const payload = ticket.getPayload();
  const {
    sub:            googleId,
    email,
    name,
    picture,
    email_verified: emailVerified,
  } = payload;

  if (!email || !emailVerified) {
    const err = new Error('Google email could not be verified.');
    err.statusCode = 400;
    throw err;
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 2. Lookup order: googleId first, email second
  let user =
    (await User.findOne({ googleId })) ||
    (await User.findOne({ email: normalizedEmail }));

  if (user) {
    // Link Google identity to an existing local account if not yet linked
    if (!user.googleId) {
      user.googleId     = googleId;
      user.authProvider = 'google';
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
    }
  } else {
    // Brand new Google user
    user = await User.create({
      name:         name.trim(),
      email:        normalizedEmail,
      googleId,
      authProvider: 'google',
      avatar:       picture || null,
      role:         'user',
    });
  }

  const token = signToken(user);
  return { token, user: publicUser(user) };
};

/**
 * Fetch the full profile for an authenticated user by ID.
 * @param {string} userId - from decoded JWT
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId).select(
    '-password -resetPasswordToken -resetPasswordExpires'
  );

  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  return publicUser(user);
};

/**
 * Generate a password-reset token, persist its hash, and email the link.
 * Always returns the same success message to prevent email enumeration.
 *
 * @param {string} email
 */
const forgotPassword = async (email) => {
  const SAFE_MESSAGE =
    'If an account with that email exists, a reset link has been sent.';

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  // Return early silently if account not found
  if (!user) return { message: SAFE_MESSAGE };

  // Google-only accounts have no password to reset
  if (!user.password) return { message: SAFE_MESSAGE };

  // Generate raw token — only the hash is stored
  const rawToken    = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.resetPasswordToken   = hashedToken;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
  await user.save();

  const resetUrl = `${env.FRONTEND_URL}/reset-password/${rawToken}`;

  try {
    await sendEmail({
      to:      user.email,
      subject: 'Reset Your Password — Handicraft Hub',
      html: `
        <div style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:auto">
          <h2 style="color:#7b1717">Reset Your Password</h2>
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your Handicraft Hub password.</p>
          <p style="margin:28px 0">
            <a href="${resetUrl}"
               style="background:#7b1717;color:#fff;padding:12px 22px;
                      text-decoration:none;border-radius:5px;display:inline-block">
              Reset Password
            </a>
          </p>
          <p>This link expires in <strong>15 minutes</strong>.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
          <p><strong>Handicraft Hub</strong></p>
        </div>
      `,
    });
  } catch (emailError) {
    // Roll back token so the user can retry
    user.resetPasswordToken   = null;
    user.resetPasswordExpires = null;
    await user.save();

    const err = new Error(
      'Unable to send password reset email. Please try again.'
    );
    err.statusCode = 500;
    throw err;
  }

  return { message: SAFE_MESSAGE };
};

/**
 * Consume a password-reset token and set a new password.
 * The raw URL token is hashed and compared against the stored hash.
 *
 * @param {string} rawToken - from URL param
 * @param {string} newPassword
 */
const resetPassword = async (rawToken, newPassword) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken:   hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    const err = new Error('Password reset link is invalid or has expired.');
    err.statusCode = 400;
    throw err;
  }

  user.password             = await bcrypt.hash(newPassword, 12);
  user.resetPasswordToken   = null;  // one-time use
  user.resetPasswordExpires = null;
  await user.save();

  return { message: 'Password reset successfully. You can now log in.' };
};

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  register,
  login,
  googleAuth,
  getProfile,
  forgotPassword,
  resetPassword,
};
