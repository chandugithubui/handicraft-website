/**
 * server/src/modules/rbac/middleware/require-permission.middleware.ts
 *
 * Fine-grained RBAC middleware factory.
 *
 * Usage:
 *   router.delete('/products/:id',
 *     authenticate,
 *     requirePermission('products:delete'),
 *     productController.delete
 *   );
 *
 * Super-admins bypass all permission checks automatically.
 * Regular admins need the explicit permission in their role.
 */

import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../../errors/auth.errors';
import { ALL_PERMISSION_KEYS } from '../permissions.manifest';

/**
 * Middleware factory that checks whether the authenticated user holds
 * a specific permission (or is a super-admin who bypasses all checks).
 *
 * @param permission - Permission key (e.g., 'products:delete')
 */
export const requirePermission = (permission: string) => {
  // Validate permission key at route-registration time (fail fast)
  if (!ALL_PERMISSION_KEYS.has(permission)) {
    throw new Error(
      `[requirePermission] Unknown permission key: "${permission}". ` +
        `Add it to permissions.manifest.ts first.`
    );
  }

  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required.'));
    }

    // Super-admin role bypasses all permission checks
    if ((req.user as any).role === 'super_admin') {
      return next();
    }

    // Check explicit permissions array on the JWT payload (populated during login)
    const userPermissions: string[] = (req.user as any).permissions ?? [];
    if (userPermissions.includes(permission)) {
      return next();
    }

    return next(
      new ForbiddenError(
        `You do not have the required permission: "${permission}".`
      )
    );
  };
};

/**
 * Middleware factory that checks whether the authenticated user holds
 * ALL of the specified permissions.
 */
export const requireAllPermissions = (...permissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required.'));
    }

    if ((req.user as any).role === 'super_admin') {
      return next();
    }

    const userPermissions: string[] = (req.user as any).permissions ?? [];
    const missing = permissions.filter((p) => !userPermissions.includes(p));

    if (missing.length > 0) {
      return next(
        new ForbiddenError(
          `Missing required permissions: ${missing.map((p) => `"${p}"`).join(', ')}.`
        )
      );
    }

    return next();
  };
};

/**
 * Middleware factory that checks whether the authenticated user holds
 * AT LEAST ONE of the specified permissions.
 */
export const requireAnyPermission = (...permissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required.'));
    }

    if ((req.user as any).role === 'super_admin') {
      return next();
    }

    const userPermissions: string[] = (req.user as any).permissions ?? [];
    const hasAny = permissions.some((p) => userPermissions.includes(p));

    if (!hasAny) {
      return next(
        new ForbiddenError(
          `Requires at least one of: ${permissions.map((p) => `"${p}"`).join(', ')}.`
        )
      );
    }

    return next();
  };
};
