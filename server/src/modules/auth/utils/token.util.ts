/**
 * server/src/modules/auth/utils/token.util.ts
 *
 * Cryptographic helpers for signing, verifying, and hashing tokens.
 */

import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { googleOAuthConfig } from '../../../config/google-oauth.config';
import { IUserDocument } from '../../../models/user.model';
import {
  JwtAccessPayload,
  JwtRefreshPayload,
  PublicUser,
  TokenPair,
} from '../types/auth.types';
import { InvalidRefreshTokenError, UnauthorizedError } from '../../../errors/auth.errors';

/**
 * Sign a short-lived access JWT for an authenticated user.
 */
export const signAccessToken = (payload: JwtAccessPayload): string => {
  const options: SignOptions = {
    expiresIn: googleOAuthConfig.jwt.accessExpiresIn as unknown as number,
  };
  return jwt.sign(
    { ...payload, type: 'access' },
    googleOAuthConfig.jwt.accessSecret,
    options
  );
};

/**
 * Sign a long-lived refresh JWT for rotating refresh tokens.
 */
export const signRefreshToken = (payload: JwtRefreshPayload): string => {
  const options: SignOptions = {
    expiresIn: googleOAuthConfig.jwt.refreshExpiresIn as unknown as number,
  };
  return jwt.sign(
    { ...payload, type: 'refresh' },
    googleOAuthConfig.jwt.refreshSecret,
    options
  );
};

/**
 * Verify an access JWT and return its payload.
 * Throws UnauthorizedError if verification fails.
 */
export const verifyAccessToken = (token: string): JwtAccessPayload => {
  try {
    const decoded = jwt.verify(
      token,
      googleOAuthConfig.jwt.accessSecret
    ) as JwtAccessPayload;
    return decoded;
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Access token has expired.');
    }
    throw new UnauthorizedError('Invalid access token.');
  }
};

/**
 * Verify a refresh JWT and return its payload.
 * Throws InvalidRefreshTokenError if verification fails.
 */
export const verifyRefreshToken = (token: string): JwtRefreshPayload => {
  try {
    const decoded = jwt.verify(
      token,
      googleOAuthConfig.jwt.refreshSecret
    ) as JwtRefreshPayload;
    return decoded;
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new InvalidRefreshTokenError('Refresh token has expired.');
    }
    throw new InvalidRefreshTokenError('Invalid refresh token.');
  }
};

/**
 * SHA-256 hash helper for storing sensitive refresh tokens securely in database.
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate cryptographically secure random hex string (for state, nonce, family IDs).
 */
export const generateRandomToken = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Maps a Mongoose User document to the sanitized public user structure.
 * Guaranteed never to expose password, reset tokens, or refresh token hashes.
 */
export const toPublicUser = (user: IUserDocument): PublicUser => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar ?? null,
    authProviders: user.authProviders || ['local'],
  };
};

/**
 * Build a full token pair along with public expiration information.
 */
export const createTokenPair = (
  accessPayload: JwtAccessPayload,
  refreshPayload: JwtRefreshPayload
): TokenPair => {
  const accessToken = signAccessToken(accessPayload);
  const refreshToken = signRefreshToken(refreshPayload);

  return {
    accessToken,
    refreshToken,
    expiresIn: googleOAuthConfig.jwt.accessExpiresInSeconds,
  };
};
