/**
 * server/src/modules/rbac/routes/rbac.routes.ts
 *
 * Express router for the RBAC management API.
 * All routes require authentication + either 'admin' role or 'super_admin' role.
 * Fine-grained permission checks use requirePermission() middleware.
 *
 * Base path: /api/rbac
 */

import { Router } from 'express';
import * as rbacController from '../controllers/rbac.controller';
import { authenticate, requireAdmin } from '../../auth/middleware/auth.middleware';
import { requirePermission } from '../middleware/require-permission.middleware';
import { rbacErrorHandler } from '../middleware/rbac.error.middleware';

const router = Router();

// All RBAC routes require a valid authenticated session
router.use(authenticate);

// ── Permissions Manifest ──────────────────────────────────────────────────────

/**
 * @route   GET /api/rbac/permissions
 * @desc    Get the full permissions manifest (all available permission keys)
 * @access  Admin
 */
router.get(
  '/permissions',
  requirePermission('roles:read'),
  rbacController.getPermissionsManifest
);

// ── Roles ─────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/rbac/roles
 * @desc    List all roles
 * @access  Admin with roles:read
 */
router.get(
  '/roles',
  requirePermission('roles:read'),
  rbacController.listRoles
);

/**
 * @route   GET /api/rbac/roles/:idOrName
 * @desc    Get a single role by ID or name
 * @access  Admin with roles:read
 */
router.get(
  '/roles/:idOrName',
  requirePermission('roles:read'),
  rbacController.getRole
);

/**
 * @route   POST /api/rbac/roles
 * @desc    Create a new custom role
 * @access  Admin with roles:create
 */
router.post(
  '/roles',
  requirePermission('roles:create'),
  rbacController.createRole
);

/**
 * @route   PATCH /api/rbac/roles/:idOrName
 * @desc    Update role display name, description, or permissions
 * @access  Admin with roles:update
 */
router.patch(
  '/roles/:idOrName',
  requirePermission('roles:update'),
  rbacController.updateRole
);

/**
 * @route   DELETE /api/rbac/roles/:idOrName
 * @desc    Delete a custom role (system roles are protected)
 * @access  Admin with roles:delete
 */
router.delete(
  '/roles/:idOrName',
  requirePermission('roles:delete'),
  rbacController.deleteRole
);

// ── User Role Assignments ─────────────────────────────────────────────────────

/**
 * @route   GET /api/rbac/users
 * @desc    List all users with their current roles
 * @access  Admin with roles:read
 */
router.get(
  '/users',
  requirePermission('roles:read'),
  rbacController.listUsersWithRoles
);

/**
 * @route   PATCH /api/rbac/users/:userId/role
 * @desc    Assign a role to a user
 * @access  Admin with roles:assign
 */
router.patch(
  '/users/:userId/role',
  requirePermission('roles:assign'),
  rbacController.assignUserRole
);

/**
 * @route   GET /api/rbac/users/:userId/permissions
 * @desc    Get effective permissions for a specific user (role + custom overrides)
 * @access  Admin with roles:read
 */
router.get(
  '/users/:userId/permissions',
  requirePermission('roles:read'),
  rbacController.getUserEffectivePermissions
);

// Centralized error handler for all RBAC routes
router.use(rbacErrorHandler);

export default router;
