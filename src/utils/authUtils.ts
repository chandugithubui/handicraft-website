/**
 * src/utils/authUtils.ts
 *
 * Role and Permission helper utilities for frontend navigation and authorization.
 */

import { User } from '../types';

/**
 * Common admin / staff role names
 */
const ADMIN_ROLES = new Set([
  'super_admin',
  'admin',
  'moderator',
  'manager',
  'artisan',
  'staff',
]);

/**
 * Checks whether a user is an administrative / staff member based on role or permissions.
 */
export const isAdminUser = (user: User | null | undefined): boolean => {
  if (!user) return false;

  const roleLower = (user.role || '').toLowerCase();

  // Super admin & known admin roles
  if (ADMIN_ROLES.has(roleLower) || roleLower.includes('admin')) {
    return true;
  }

  // If user has administrative permissions
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    if (user.permissions.includes('*')) return true;
    const hasAdminPerm = user.permissions.some((p) =>
      p.startsWith('roles:') ||
      p.startsWith('users:') ||
      p.startsWith('products:') ||
      p.startsWith('orders:') ||
      p.startsWith('coupons:') ||
      p.startsWith('analytics:') ||
      p.startsWith('admin:')
    );
    if (hasAdminPerm) return true;
  }

  // Default normal customer/user
  return false;
};

/**
 * Checks if a user has a specific permission
 */
export const hasUserPermission = (user: User | null | undefined, permission: string): boolean => {
  if (!user) return false;

  // Super admin always has all permissions
  if (user.role === 'super_admin') return true;

  if (!Array.isArray(user.permissions) || user.permissions.length === 0) {
    // If user has 'admin' role and permissions array is somehow empty, grant standard admin rights
    if (user.role === 'admin') return true;
    return false;
  }

  const perms = user.permissions;
  if (perms.includes('*')) return true;
  if (perms.includes(permission)) return true;

  const [module] = permission.split(':');
  if (module && perms.includes(`${module}:*`)) return true;

  return false;
};

/**
 * Returns the appropriate redirect URL for a user after login.
 * Admin/Staff -> /admin
 * Normal customer -> /profile
 */
export const getRedirectUrlAfterLogin = (user: User | null | undefined): string => {
  return isAdminUser(user) ? '/admin' : '/profile';
};
