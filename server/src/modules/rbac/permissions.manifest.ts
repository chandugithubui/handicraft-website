/**
 * server/src/modules/rbac/permissions.manifest.ts
 *
 * Single source of truth for all permission keys in the system.
 * Used by the API to advertise available permissions to the frontend,
 * and by the requirePermission middleware for validation.
 */

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

export const PERMISSIONS_MANIFEST: PermissionModule[] = [
  {
    id: 'products',
    name: 'Products',
    description: 'Control product catalog management',
    permissions: [
      { key: 'products:read',   name: 'View Products',   description: 'View all products in the catalog' },
      { key: 'products:create', name: 'Create Products', description: 'Add new products to the catalog' },
      { key: 'products:update', name: 'Update Products', description: 'Edit existing product details' },
      { key: 'products:delete', name: 'Delete Products', description: 'Remove products from the catalog' },
    ],
  },
  {
    id: 'orders',
    name: 'Orders',
    description: 'Control order management and fulfilment',
    permissions: [
      { key: 'orders:read',   name: 'View Orders',   description: 'View all customer orders' },
      { key: 'orders:update', name: 'Update Orders', description: 'Update order status and details' },
      { key: 'orders:delete', name: 'Delete Orders', description: 'Remove orders from the system' },
    ],
  },
  {
    id: 'users',
    name: 'Users',
    description: 'Control user account management',
    permissions: [
      { key: 'users:read',   name: 'View Users',   description: 'View all user accounts' },
      { key: 'users:update', name: 'Update Users', description: 'Edit user account details' },
      { key: 'users:delete', name: 'Delete Users', description: 'Remove user accounts' },
    ],
  },
  {
    id: 'roles',
    name: 'Roles & Permissions',
    description: 'Control RBAC role and permission management',
    permissions: [
      { key: 'roles:read',   name: 'View Roles',    description: 'View all roles and their permissions' },
      { key: 'roles:create', name: 'Create Roles',  description: 'Create new roles' },
      { key: 'roles:update', name: 'Update Roles',  description: 'Edit existing role permissions' },
      { key: 'roles:delete', name: 'Delete Roles',  description: 'Delete non-system roles' },
      { key: 'roles:assign', name: 'Assign Roles',  description: 'Assign roles and permissions to users' },
    ],
  },
  {
    id: 'coupons',
    name: 'Coupons',
    description: 'Control discount coupon management',
    permissions: [
      { key: 'coupons:read',   name: 'View Coupons',   description: 'View all discount coupons' },
      { key: 'coupons:create', name: 'Create Coupons', description: 'Create new discount coupons' },
      { key: 'coupons:update', name: 'Update Coupons', description: 'Edit existing coupons' },
      { key: 'coupons:delete', name: 'Delete Coupons', description: 'Delete discount coupons' },
    ],
  },
  {
    id: 'newsletters',
    name: 'Newsletter',
    description: 'Control newsletter subscriber management',
    permissions: [
      { key: 'newsletters:read',   name: 'View Subscribers', description: 'View newsletter subscribers' },
      { key: 'newsletters:delete', name: 'Remove Subscribers', description: 'Remove newsletter subscribers' },
    ],
  },
  {
    id: 'contacts',
    name: 'Contact Inquiries',
    description: 'Control customer contact inquiry management',
    permissions: [
      { key: 'contacts:read',   name: 'View Contacts',   description: 'View customer contact inquiries' },
      { key: 'contacts:delete', name: 'Delete Contacts', description: 'Delete contact inquiries' },
    ],
  },
  {
    id: 'reviews',
    name: 'Reviews',
    description: 'Control product review moderation',
    permissions: [
      { key: 'reviews:read',   name: 'View Reviews',   description: 'View all product reviews' },
      { key: 'reviews:delete', name: 'Delete Reviews', description: 'Remove inappropriate reviews' },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Control access to analytics and reports',
    permissions: [
      { key: 'analytics:read', name: 'View Analytics', description: 'View sales and site analytics' },
    ],
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Control system configuration settings',
    permissions: [
      { key: 'settings:manage', name: 'Manage Settings', description: 'Modify system-wide configuration' },
    ],
  },
];

/** Flat set of all valid permission keys — used for validation */
export const ALL_PERMISSION_KEYS: Set<string> = new Set(
  PERMISSIONS_MANIFEST.flatMap((m) => m.permissions.map((p) => p.key))
);

/** Check whether a permission key is valid */
export const isValidPermission = (key: string): boolean => ALL_PERMISSION_KEYS.has(key);
