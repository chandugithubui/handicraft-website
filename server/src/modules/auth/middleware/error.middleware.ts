/**
 * server/src/modules/auth/middleware/error.middleware.ts
 *
 * Centralized error handler preventing disclosure of internal implementation details
 * while providing standard structured responses for client consumption.
 */

import { NextFunction, Request, Response } from 'express';
import { AuthError } from '../../../errors/auth.errors';

export const authErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AuthError) {
    if (err.statusCode >= 500) {
      console.error(`[AuthError ${err.statusCode} - ${err.errorCode}]:`, err.message);
    }
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
      },
    });
    return;
  }

  // Non-operational / unhandled server error
  console.error('[UnhandledServerError]:', err);

  const isProduction = process.env.NODE_ENV === 'production';

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isProduction
        ? 'An unexpected error occurred while processing authentication.'
        : err.message || 'Internal server error',
    },
  });
};
