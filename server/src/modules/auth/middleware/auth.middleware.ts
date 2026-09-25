/**
 * server/src/modules/auth/middleware/auth.middleware.ts
 *
 * JWT authentication and role authorization middleware,
 * supporting both Bearer Authorization headers and secure httpOnly cookies.
 */

import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { googleOAuthConfig } from '../../../config/google-oauth.config';
import { ForbiddenError, UnauthorizedError } from '../../../errors/auth.errors';
import { JwtAccessPayload } from '../types/auth.types';
import { verifyAccessToken } from '../utils/token.util';

// Extend Express Request interface to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtAccessPayload;
    }
  }
}

/**
 * Extracts access token from either Bearer Authorization header or httpOnly cookie.
 */
export const extractAccessToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // Look in configured cookie name, or fallback to legacy hh_token cookie
  if (req.cookies) {
    const primary = req.cookies[googleOAuthConfig.cookies.accessTokenName];
    if (primary) return primary;
    const legacy = req.cookies.hh_token;
    if (legacy) return legacy;
  }

  return null;
};

/**
 * Authentication middleware: verifies valid access token.
 */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const token = extractAccessToken(req);

  if (!token) {
    return next(new UnauthorizedError('Authentication required. No access token provided.'));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    return next();
  } catch (err) {
    return next(err);
  }
};

/**
 * Role-based authorization middleware requiring admin privileges.
 */
export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required.'));
  }

  if (req.user.role !== 'admin') {
    return next(new ForbiddenError('Administrative privileges required.'));
  }

  return next();
};

/**
 * Rate limiter for sensitive OAuth endpoints (authorization redirect, callback).
 */
export const oauthRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per IP per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for token refresh requests.
 */
export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many token refresh attempts. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
