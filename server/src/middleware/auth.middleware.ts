/**
 * server/src/middleware/auth.middleware.ts
 *
 * Production JWT authentication and authorization middlewares in TypeScript.
 * Supports dual-mode token extraction (Authorization Bearer header & httpOnly cookies).
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';

const COOKIE_NAME = 'hh_token';

export interface AuthenticatedUserPayload {
  id?: string;
  userId?: string;
  _id?: string;
  email: string;
  role: string;
  permissions?: string[];
  [key: string]: any;
}

export const extractToken = (req: Request): string | null => {
  const authHeader = req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return (req as any).cookies?.[COOKIE_NAME] ?? null;
};

/**
 * Ensures request has a valid JWT token.
 */
export const auth = (req: Request, res: Response, next: NextFunction): void => {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({
      message: 'Authentication required. Please log in.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUserPayload;
    (req as any).user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        message: 'Session expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }
    res.status(401).json({
      message: 'Invalid authentication token.',
    });
  }
};

/**
 * Ensures user has an active session and either admin or super_admin role.
 */
export const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({
      message: 'Authentication required. Please log in.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUserPayload;

    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      res.status(403).json({
        message: 'Access denied. Administrator privileges required.',
      });
      return;
    }

    (req as any).user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        message: 'Session expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }
    res.status(401).json({
      message: 'Invalid authentication token.',
    });
  }
};

export default { auth, adminAuth };
