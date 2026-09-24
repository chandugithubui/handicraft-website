const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);
// Rate limiter: max 10 requests per 15 minutes per IP on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Lowercase email for consistency
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user — role is always 'user', never taken from request body
    const user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user'
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: normalizedEmail, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Lowercase email for consistency
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }


    if (!user.password) {
      return res.status(400).json({
        message: 'This account uses Google Sign-In. Please continue with Google.'
      });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: normalizedEmail, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Google Login / Register
router.post('/google', authLimiter, async (req, res) => {
  console.log('\n========== GOOGLE AUTH REQUEST ==========');
  console.log('Timestamp      :', new Date().toISOString());
  console.log('Body keys      :', Object.keys(req.body));
  console.log('credential     :', req.body.credential
    ? `present (${req.body.credential.length} chars)`
    : 'MISSING');
  console.log('GOOGLE_CLIENT_ID env:', process.env.GOOGLE_CLIENT_ID
    ? `set (${process.env.GOOGLE_CLIENT_ID.slice(0, 20)}...)`
    : 'NOT SET ⚠️');
  console.log('=========================================\n');

  try {
    const { credential } = req.body;

    if (!credential) {
      console.log('[Google Auth] ❌ No credential in request body');
      return res.status(400).json({
        message: 'Google credential is required'
      });
    }

    console.log('[Google Auth] Verifying ID token with Google...');

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    console.log('[Google Auth] ✅ Token verified');
    console.log('[Google Auth] Payload email     :', payload.email);
    console.log('[Google Auth] Payload name      :', payload.name);
    console.log('[Google Auth] email_verified    :', payload.email_verified);
    console.log('[Google Auth] sub (googleId)    :', payload.sub?.slice(0, 8) + '...');

    const {
      sub: googleId,
      email,
      name,
      picture,
      email_verified: emailVerified
    } = payload;

    if (!email || !emailVerified) {
      console.log('[Google Auth] ❌ Email missing or not verified');
      return res.status(400).json({
        message: 'Google email could not be verified'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // First try Google ID
    let user = await User.findOne({ googleId });
    console.log('[Google Auth] Lookup by googleId :', user ? `found (${user._id})` : 'not found');

    // Otherwise check whether the email already exists
    if (!user) {
      user = await User.findOne({ email: normalizedEmail });
      console.log('[Google Auth] Lookup by email   :', user ? `found (${user._id})` : 'not found');
    }

    if (user) {
      // Existing local account using the same verified email:
      // safely connect Google identity to it.
      if (!user.googleId) {
        console.log('[Google Auth] Linking Google ID to existing local account');
        user.googleId = googleId;
        if (!user.avatar && picture) {
          user.avatar = picture;
        }
        await user.save();
      } else {
        console.log('[Google Auth] Existing Google account — logging in');
      }
    } else {
      // Completely new Google user
      console.log('[Google Auth] Creating new Google user:', normalizedEmail);
      user = new User({
        name,
        email: normalizedEmail,
        googleId,
        authProvider: 'google',
        avatar: picture || null,
        role: 'user'
      });
      await user.save();
      console.log('[Google Auth] ✅ New user saved, id:', user._id);
    }

    // Generate our own Handicraft Hub JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('[Google Auth] ✅ JWT issued for:', user.email);
    console.log('========== GOOGLE AUTH SUCCESS ==========\n');

    return res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('========== GOOGLE AUTH ERROR ==========');
    console.error('Message :', error.message);
    console.error('Type    :', error.constructor?.name);
    // Surface the most common failure reasons clearly
    if (error.message?.includes('Token used too late')) {
      console.error('Reason  : Token expired — system clock skew?');
    } else if (error.message?.includes('Invalid token signature')) {
      console.error('Reason  : Bad signature — wrong GOOGLE_CLIENT_ID?');
    } else if (error.message?.includes('audience')) {
      console.error('Reason  : audience mismatch — GOOGLE_CLIENT_ID env var does not match the token');
      console.error('Env ID  :', process.env.GOOGLE_CLIENT_ID ?? 'NOT SET');
    }
    console.error('Full error:', error);
    console.error('=======================================\n');

    return res.status(401).json({
      message: 'Google authentication failed'
    });
  }
});

// Forgot Password
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    });

    /*
      Return the same response even if the account does not exist.
      This prevents exposing which email addresses are registered.
    */
    if (!user) {
      return res.json({
        message:
          'If an account exists with this email, a password reset link has been sent.'
      });
    }

    // Generate secure random reset token
    const resetToken = crypto
      .randomBytes(32)
      .toString('hex');

    // Hash token before storing it in MongoDB
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = hashedToken;

    // Token valid for 15 minutes
    user.resetPasswordExpires =
      Date.now() + 15 * 60 * 1000;

    await user.save();

    // Frontend reset-password URL
    const frontendUrl =
      process.env.FRONTEND_URL ||
      'http://localhost:5173';

    const resetUrl =
      `${frontendUrl}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset Your Password - Handicraft Hub',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333333; max-width: 650px; margin: auto;">

            <h2 style="color: #7b1717;">
              Reset Your Password
            </h2>

            <p>Hi ${user.name},</p>

            <p>
              We received a request to reset your
              Handicraft Hub password.
            </p>

            <p>
              Click the button below to create a new password.
            </p>

            <p style="margin: 30px 0;">
              <a
                href="${resetUrl}"
                style="
                  background: #7b1717;
                  color: #ffffff;
                  padding: 12px 20px;
                  text-decoration: none;
                  border-radius: 5px;
                  display: inline-block;
                "
              >
                Reset Password
              </a>
            </p>

            <p>
              This password reset link will expire in
              <strong>15 minutes</strong>.
            </p>

            <p>
              If you did not request a password reset,
              you can safely ignore this email.
            </p>

            <p>
              <strong>Handicraft Hub</strong>
            </p>

          </div>
        `
      });

      console.log(
        'Password reset email sent successfully'
      );

    } catch (emailError) {
      /*
        If email fails, remove the token because
        the user never received it.
      */
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;

      await user.save();

      console.error(
        'Password reset email failed:',
        emailError.message
      );

      return res.status(500).json({
        message:
          'Unable to send password reset email. Please try again.'
      });
    }

    return res.json({
      message:
        'If an account exists with this email, a password reset link has been sent.'
    });

  } catch (error) {
    console.error(
      'Forgot password error:',
      error
    );

    return res.status(500).json({
      message: 'Server error'
    });
  }
});

// Reset Password
router.post('/reset-password/:token', authLimiter, async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validate password
    if (!password) {
      return res.status(400).json({
        message: 'New password is required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      });
    }

    // Hash the token received from the URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with matching token that has not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message:
          'Password reset link is invalid or has expired'
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    // Update password
    user.password = hashedPassword;

    // Reset token can only be used once
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    console.log(
      'Password reset successfully for user:',
      user._id.toString()
    );

    return res.json({
      message:
        'Password reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error(
      'Reset password error:',
      error
    );

    return res.status(500).json({
      message: 'Server error while resetting password'
    });
  }
});
// Get user profile (protected route)
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
