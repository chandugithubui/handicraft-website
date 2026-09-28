/**
 * server/src/services/auth.service.ts
 *
 * Production authentication business logic with strict TypeScript typings.
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUserDocument } from '../models/user.model';
import RoleModel from '../models/role.model';
import sendEmail from '../utils/sendEmail';
import env from '../config/env';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  permissions?: string[];
}

export interface AuthResult {
  token: string;
  user: PublicUser;
}

/**
 * Resolves the full permission list for a user:
 *   = role.permissions  ∪  user.customPermissions
 * Super-admin gets everything without a query (fastpath).
 */
export const resolvePermissions = async (
  roleName: string,
  customPermissions: string[] = []
): Promise<string[]> => {
  const roleDoc = await RoleModel.findOne({ name: roleName.toLowerCase() }).lean();
  const rolePerms: string[] = roleDoc?.permissions ?? [];
  // Merge, deduplicate
  return [...new Set([...rolePerms, ...customPermissions])];
};

/**
 * Signs a JWT for an authenticated user.
 * Embeds userId, email, role and the fully resolved permissions array.
 */
export const signToken = async (user: IUserDocument): Promise<string> => {
  const permissions = await resolvePermissions(
    user.role,
    user.customPermissions ?? []
  );
  return jwt.sign(
    { userId: user._id.toString(), email: user.email, role: user.role, permissions },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );
};

export const publicUser = (user: IUserDocument, permissions: string[] = []): PublicUser => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar ?? null,
  permissions,
});

export const register = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> => {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    const err = new Error('An account with this email already exists.') as any;
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: 'customer',
  });

  const permissions = await resolvePermissions(user.role, user.customPermissions ?? []);
  const token = await signToken(user as unknown as IUserDocument);
  return { token, user: publicUser(user as unknown as IUserDocument, permissions) };
};

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<AuthResult> => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !user.password) {
    const err = new Error('Invalid email or password.') as any;
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Invalid email or password.') as any;
    err.statusCode = 401;
    throw err;
  }

  const permissions = await resolvePermissions(user.role, user.customPermissions ?? []);
  const token = await signToken(user as unknown as IUserDocument);
  return { token, user: publicUser(user as unknown as IUserDocument, permissions) };
};

export const getProfile = async (userId: string): Promise<PublicUser> => {
  const user = await User.findById(userId).select(
    '-password -resetPasswordToken -resetPasswordExpires'
  );

  if (!user) {
    const err = new Error('User not found.') as any;
    err.statusCode = 404;
    throw err;
  }

  const permissions = await resolvePermissions(user.role, user.customPermissions ?? []);
  return publicUser(user as unknown as IUserDocument, permissions);
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const SAFE_MESSAGE =
    'If an account with that email exists, a reset link has been sent.';

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) return { message: SAFE_MESSAGE };

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  const resetUrl = `${env.FRONTEND_URL}/reset-password/${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
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
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const err = new Error('Unable to send password reset email. Please try again.') as any;
    err.statusCode = 500;
    throw err;
  }

  return { message: SAFE_MESSAGE };
};

export const resetPassword = async (
  rawToken: string,
  newPassword: string
): Promise<{ message: string }> => {
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    const err = new Error('Password reset link is invalid or has expired.') as any;
    err.statusCode = 400;
    throw err;
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { message: 'Password reset successfully. You can now log in.' };
};
