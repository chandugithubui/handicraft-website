/**
 * server/src/modules/rbac/middleware/rbac.error.middleware.ts
 *
 * Centralized error handler for RBAC routes.
 * Translates AppError and AuthError subclasses into consistent JSON responses.
 */

import { NextFunction, Request, Response } from 'express';
import { AuthError } from '../../../errors/auth.errors';
import { AppError } from '../../../errors/app.errors';

export const rbacErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AuthError || err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
      },
    });
    return;
  }

  // Unhandled / unexpected errors
  console.error('[RBAC] Unexpected error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
    },
  });
};
