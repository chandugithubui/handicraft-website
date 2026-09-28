/**
 * server/src/modules/rbac/controllers/rbac.controller.ts
 *
 * Thin Express controllers that delegate to rbac.service.ts.
 * All error handling is centralized — controllers just call next(err) on failure.
 */

import { NextFunction, Request, Response } from 'express';
import * as rbacService from '../services/rbac.service';
import { CreateRoleDto, UpdateRoleDto } from '../types/rbac.module.types';


// ── Roles ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/rbac/roles
 * Returns all roles (system + custom), sorted by system-first then name.
 */
export const listRoles = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roles = await rbacService.getAllRoles();
    res.json({ success: true, data: roles });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/rbac/roles/:idOrName
 * Returns a single role by ID or name slug.
 */
export const getRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const idOrName = req.params.idOrName as string;
    const role = await rbacService.getRoleByIdOrName(idOrName);
    res.json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/rbac/roles
 * Creates a new custom role.
 * Body: { name, displayName, description?, permissions[] }
 */
export const createRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto: CreateRoleDto = req.body;
    if (!dto.name || !dto.displayName) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'name and displayName are required.' },
      });
      return;
    }

    const role = await rbacService.createRole(dto);
    res.status(201).json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/rbac/roles/:idOrName
 * Updates an existing role's displayName, description, or permissions.
 * Body: { displayName?, description?, permissions[]? }
 */
export const updateRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto: UpdateRoleDto = req.body;
    const role = await rbacService.updateRole(req.params.idOrName as string, dto);
    res.json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/rbac/roles/:idOrName
 * Deletes a custom role. Returns 403 for system roles.
 */
export const deleteRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await rbacService.deleteRole(req.params.idOrName as string);
    res.json({ success: true, message: 'Role deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// ── Users & Assignments ───────────────────────────────────────────────────────

/**
 * GET /api/rbac/users
 * Returns all users with their current role.
 */
export const listUsersWithRoles = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await rbacService.getAllUsersWithRoles();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/rbac/users/:userId/role
 * Assigns a role to a user and optionally sets custom permission overrides.
 * Body: { roleName: string, customPermissions?: string[] }
 */
export const assignUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roleName, customPermissions } = req.body as {
      roleName: string;
      customPermissions?: string[];
    };
    if (!roleName) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'roleName is required.' },
      });
      return;
    }

    const user = await rbacService.assignRoleToUser(
      req.params.userId as string,
      roleName,
      customPermissions
    );
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/rbac/users/:userId/permissions
 * Returns the fully resolved effective permission list for a user
 * (role permissions ∪ user.customPermissions).
 */
export const getUserEffectivePermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permissions = await rbacService.getUserPermissions(req.params.userId as string);
    res.json({ success: true, data: { permissions } });
  } catch (err) {
    next(err);
  }
};

// ── Permissions Manifest ──────────────────────────────────────────────────────

/**
 * GET /api/rbac/permissions
 * Returns the full permissions manifest (all available permission keys organized by module).
 * The frontend uses this to render the permission selection UI dynamically.
 */
export const getPermissionsManifest = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const manifest = rbacService.getPermissionsManifest();
    res.json({ success: true, data: manifest });
  } catch (err) {
    next(err);
  }
};
