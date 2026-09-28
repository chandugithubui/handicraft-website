/**
 * server/src/modules/rbac/services/rbac.service.ts
 *
 * Business logic for role and permission management.
 * All database operations go through this service — controllers stay thin.
 */

import mongoose from 'mongoose';
import RoleModel, { IRoleDocument } from '../../../models/role.model';
import UserModel from '../../../models/user.model';
import {
  ConflictError,
  ForbiddenOperationError,
  NotFoundError,
  ValidationError,
} from '../../../errors/app.errors';
import { ALL_PERMISSION_KEYS, PERMISSIONS_MANIFEST } from '../permissions.manifest';
import { CreateRoleDto, RoleResponse, UpdateRoleDto, UserRoleResponse } from '../types/rbac.module.types';
import { resolvePermissions } from '../../../services/auth.service';

// ── Helpers ───────────────────────────────────────────────────────────────────

const toRoleResponse = (role: IRoleDocument): RoleResponse => ({
  id: role._id.toString(),
  name: role.name,
  displayName: role.displayName,
  description: role.description ?? '',
  permissions: role.permissions,
  isSystem: role.isSystem,
  createdAt: (role as any).createdAt?.toISOString(),
  updatedAt: (role as any).updatedAt?.toISOString(),
});

// ── Role CRUD ─────────────────────────────────────────────────────────────────

/**
 * Returns all roles sorted by system roles first, then alphabetically.
 */
export const getAllRoles = async (): Promise<RoleResponse[]> => {
  const roles = await RoleModel.find().sort({ isSystem: -1, name: 1 }).lean();
  return roles.map((r) => ({
    id: r._id.toString(),
    name: r.name,
    displayName: r.displayName,
    description: r.description ?? '',
    permissions: r.permissions,
    isSystem: r.isSystem,
    createdAt: (r as any).createdAt?.toISOString(),
    updatedAt: (r as any).updatedAt?.toISOString(),
  }));
};

/**
 * Returns a single role by its name or MongoDB ID.
 */
export const getRoleByIdOrName = async (idOrName: string): Promise<RoleResponse> => {
  const isId = mongoose.Types.ObjectId.isValid(idOrName);
  const role = await RoleModel.findOne(
    isId ? { _id: idOrName } : { name: idOrName.toLowerCase() }
  );
  if (!role) {
    throw new NotFoundError(`Role "${idOrName}" not found.`);
  }
  return toRoleResponse(role);
};

/**
 * Creates a new custom role.
 * Validates permission keys against the manifest and prevents duplicate names.
 */
export const createRole = async (dto: CreateRoleDto): Promise<RoleResponse> => {
  const name = dto.name.toLowerCase().trim();

  // Validate unique name
  const existing = await RoleModel.findOne({ name });
  if (existing) {
    throw new ConflictError(`Role with name "${name}" already exists.`);
  }

  // Validate permission keys
  const invalidPerms = dto.permissions.filter((p) => !ALL_PERMISSION_KEYS.has(p));
  if (invalidPerms.length > 0) {
    throw new ValidationError(
      `Invalid permission keys: ${invalidPerms.map((p) => `"${p}"`).join(', ')}.`
    );
  }

  const role = await RoleModel.create({
    name,
    displayName: dto.displayName.trim(),
    description: dto.description?.trim() ?? '',
    permissions: [...new Set(dto.permissions)], // deduplicate
    isSystem: false,
  });

  return toRoleResponse(role);
};

/**
 * Updates a custom role's display name, description, or permissions.
 * System roles can only have their permissions updated (not renamed/deleted).
 */
export const updateRole = async (idOrName: string, dto: UpdateRoleDto): Promise<RoleResponse> => {
  const isId = mongoose.Types.ObjectId.isValid(idOrName);
  const role = await RoleModel.findOne(
    isId ? { _id: idOrName } : { name: idOrName.toLowerCase() }
  );
  if (!role) {
    throw new NotFoundError(`Role "${idOrName}" not found.`);
  }

  if (dto.permissions !== undefined) {
    const invalidPerms = dto.permissions.filter((p) => !ALL_PERMISSION_KEYS.has(p));
    if (invalidPerms.length > 0) {
      throw new ValidationError(
        `Invalid permission keys: ${invalidPerms.map((p) => `"${p}"`).join(', ')}.`
      );
    }
    role.permissions = [...new Set(dto.permissions)];
  }

  if (!role.isSystem) {
    // Only non-system roles can be renamed/re-described
    if (dto.displayName !== undefined) role.displayName = dto.displayName.trim();
    if (dto.description !== undefined) role.description = dto.description.trim();
  }

  await role.save();
  return toRoleResponse(role);
};

/**
 * Deletes a custom role. System roles cannot be deleted.
 * Users assigned to the deleted role fall back to the default "user" role.
 */
export const deleteRole = async (idOrName: string): Promise<void> => {
  const isId = mongoose.Types.ObjectId.isValid(idOrName);
  const role = await RoleModel.findOne(
    isId ? { _id: idOrName } : { name: idOrName.toLowerCase() }
  );
  if (!role) {
    throw new NotFoundError(`Role "${idOrName}" not found.`);
  }

  if (role.isSystem) {
    throw new ForbiddenOperationError('System roles cannot be deleted.');
  }

  // Demote all users who held this role back to "user"
  await UserModel.updateMany({ role: role.name } as any, { $set: { role: 'user' } });

  await role.deleteOne();
};

// ── User Role Assignment ──────────────────────────────────────────────────────

/**
 * Returns all users with their current role and resolved permissions.
 */
export const getAllUsersWithRoles = async (): Promise<UserRoleResponse[]> => {
  const users = await UserModel.find().select('_id name email role avatar customPermissions').lean();
  return users.map((u) => ({
    userId: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    customPermissions: u.customPermissions ?? [],
  }));
};

/**
 * Resolves and returns the effective permissions for a specific user
 * (role permissions ∪ custom user permissions).
 */
export const getUserPermissions = async (userId: string): Promise<string[]> => {
  const user = await UserModel.findById(userId).select('role customPermissions').lean();
  if (!user) throw new NotFoundError(`User "${userId}" not found.`);
  return resolvePermissions(user.role, user.customPermissions ?? []);
};

/**
 * Assigns a role to a user and optionally updates their custom permission overrides.
 * Only roles that exist in the Role collection can be assigned.
 */
export const assignRoleToUser = async (
  userId: string,
  roleName: string,
  customPermissions?: string[]
): Promise<UserRoleResponse> => {
  const role = await RoleModel.findOne({ name: roleName.toLowerCase() });
  if (!role) {
    throw new NotFoundError(`Role "${roleName}" not found. Only roles that exist in the database can be assigned.`);
  }

  const updatePayload: Record<string, any> = { role: role.name };
  if (customPermissions !== undefined) {
    // Validate custom permission keys
    const invalid = customPermissions.filter((p) => !ALL_PERMISSION_KEYS.has(p));
    if (invalid.length > 0) {
      throw new ValidationError(`Invalid custom permission keys: ${invalid.map((p) => `"${p}"`).join(', ')}.`);
    }
    updatePayload.customPermissions = [...new Set(customPermissions)];
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: updatePayload } as any,
    { new: true, select: '_id name email role avatar customPermissions' }
  );
  if (!user) {
    throw new NotFoundError(`User with ID "${userId}" not found.`);
  }

  return {
    userId: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    customPermissions: user.customPermissions ?? [],
  };
};

// ── Permissions Manifest ──────────────────────────────────────────────────────

/**
 * Returns the full permissions manifest — tells the frontend what permissions
 * exist so it can render the checkboxes without hard-coding anything.
 */
export const getPermissionsManifest = () => ({
  modules: PERMISSIONS_MANIFEST,
});
