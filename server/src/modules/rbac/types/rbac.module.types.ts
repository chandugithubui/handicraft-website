/**
 * server/src/modules/rbac/types/rbac.types.ts
 *
 * Re-exports shared RBAC types and adds module-specific types for
 * the RBAC API request/response contracts.
 */

export type { PermissionKey, PermissionItem, PermissionModule, IRole } from '../../../types/rbac.types';

// ── Request DTOs ──────────────────────────────────────────────────────────────

export interface CreateRoleDto {
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleDto {
  displayName?: string;
  description?: string;
  permissions?: string[];
}

export interface AssignRoleDto {
  userId: string;
  roleName: string;
}

export interface AssignPermissionsDto {
  userId: string;
  permissions: string[];
}

// ── Response types ────────────────────────────────────────────────────────────

export interface RoleResponse {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserRoleResponse {
  userId: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
  /** Per-user permission overrides on top of the role permissions. */
  customPermissions: string[];
}

export interface AssignRoleWithCustomPermissionsDto {
  roleName: string;
  /** Optional custom permission overrides in addition to role permissions. */
  customPermissions?: string[];
}

export interface PermissionsManifestResponse {
  modules: {
    id: string;
    name: string;
    description: string;
    permissions: {
      key: string;
      name: string;
      description: string;
    }[];
  }[];
}
