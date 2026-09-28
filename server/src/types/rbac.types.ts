import { Request } from 'express';
import { JwtAccessPayload, UserRole } from '../modules/auth/types/auth.types';

export type PermissionKey =
  | 'products:read'
  | 'products:create'
  | 'products:update'
  | 'products:delete'
  | 'orders:read'
  | 'orders:update'
  | 'orders:delete'
  | 'users:read'
  | 'users:update'
  | 'users:delete'
  | 'roles:read'
  | 'roles:create'
  | 'roles:update'
  | 'roles:delete'
  | 'roles:assign'
  | 'coupons:read'
  | 'coupons:create'
  | 'coupons:update'
  | 'coupons:delete'
  | 'newsletters:read'
  | 'newsletters:delete'
  | 'contacts:read'
  | 'contacts:delete'
  | 'reviews:read'
  | 'reviews:delete'
  | 'analytics:read'
  | 'settings:manage'
  | string;

export interface PermissionItem {
  key: string;
  name: string;
  description: string;
}

export interface PermissionModule {
  id: string;
  name: string;
  description: string;
  permissions: PermissionItem[];
}

export interface IRole {
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Payload attached to req.user for RBAC-aware routes. */
export interface AuthUserPayload extends JwtAccessPayload {
  /** Extra permission overrides beyond the role — already merged into permissions[] at JWT sign time. */
  customPermissions?: string[];
}

/** Typed Express Request for routes that require authentication. */
export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

// Re-export for convenience
export type { UserRole };
