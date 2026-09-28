import { PermissionModule, IRole } from '../types/rbac.types';

export const PERMISSIONS = {
  // Products
  PRODUCTS_READ:   'products:read',
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_UPDATE: 'products:update',
  PRODUCTS_DELETE: 'products:delete',

  // Orders
  ORDERS_READ:   'orders:read',
  ORDERS_UPDATE: 'orders:update',
  ORDERS_DELETE: 'orders:delete',

  // Users
  USERS_READ:   'users:read',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',

  // Roles & RBAC (SuperAdmin scope)
  ROLES_READ:   'roles:read',
  ROLES_CREATE: 'roles:create',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',
  ROLES_ASSIGN: 'roles:assign',

  // Marketing & Promotions
  COUPONS_READ:   'coupons:read',
  COUPONS_CREATE: 'coupons:create',
  COUPONS_UPDATE: 'coupons:update',
  COUPONS_DELETE: 'coupons:delete',

  // Communications
  NEWSLETTERS_READ:   'newsletters:read',
  NEWSLETTERS_DELETE: 'newsletters:delete',
  CONTACTS_READ:      'contacts:read',
  CONTACTS_DELETE:    'contacts:delete',

  // Reviews
  REVIEWS_READ:   'reviews:read',
  REVIEWS_DELETE: 'reviews:delete',

  // Analytics & Settings
  ANALYTICS_READ:  'analytics:read',
  SETTINGS_MANAGE: 'settings:manage',
} as const;

export const ALL_PERMISSION_KEYS: string[] = Object.values(PERMISSIONS);

export const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: 'products',
    name: 'Products & Inventory',
    description: 'Catalog, pricing, stock levels, and product creation',
    permissions: [
      { key: PERMISSIONS.PRODUCTS_READ,   name: 'View Products',   description: 'View catalog and inventory details' },
      { key: PERMISSIONS.PRODUCTS_CREATE, name: 'Create Product',  description: 'Add new handicrafts and products' },
      { key: PERMISSIONS.PRODUCTS_UPDATE, name: 'Edit Product',    description: 'Update price, descriptions, and stock' },
      { key: PERMISSIONS.PRODUCTS_DELETE, name: 'Delete Product',  description: 'Remove products from the catalog' },
    ],
  },
  {
    id: 'orders',
    name: 'Orders & Fulfillment',
    description: 'Process purchases, customer shipments, and cancellations',
    permissions: [
      { key: PERMISSIONS.ORDERS_READ,   name: 'View Orders',         description: 'Access order history and tracking' },
      { key: PERMISSIONS.ORDERS_UPDATE, name: 'Update Order Status', description: 'Update status (processing, shipped, delivered)' },
      { key: PERMISSIONS.ORDERS_DELETE, name: 'Delete Order',        description: 'Cancel or purge customer orders' },
    ],
  },
  {
    id: 'users',
    name: 'Customer & User Management',
    description: 'View customer accounts and user profiles',
    permissions: [
      { key: PERMISSIONS.USERS_READ,   name: 'View Users',   description: 'Browse registered users and details' },
      { key: PERMISSIONS.USERS_UPDATE, name: 'Edit Users',   description: 'Modify user profiles and states' },
      { key: PERMISSIONS.USERS_DELETE, name: 'Delete Users', description: 'Deactivate or delete user accounts' },
    ],
  },
  {
    id: 'roles',
    name: 'Roles & Access Control (RBAC)',
    description: 'Manage permissions, create custom roles, and assign user access',
    permissions: [
      { key: PERMISSIONS.ROLES_READ,   name: 'View Roles',        description: 'View role hierarchy and permission sets' },
      { key: PERMISSIONS.ROLES_CREATE, name: 'Create Roles',      description: 'Define new custom permission roles' },
      { key: PERMISSIONS.ROLES_UPDATE, name: 'Edit Roles',        description: 'Modify role permissions and settings' },
      { key: PERMISSIONS.ROLES_DELETE, name: 'Delete Roles',      description: 'Remove custom roles' },
      { key: PERMISSIONS.ROLES_ASSIGN, name: 'Assign User Roles', description: 'Promote or demote users to roles' },
    ],
  },
  {
    id: 'marketing',
    name: 'Coupons & Communications',
    description: 'Discounts, newsletter subscribers, and customer messages',
    permissions: [
      { key: PERMISSIONS.COUPONS_READ,       name: 'View Coupons',       description: 'Inspect discount and promo codes' },
      { key: PERMISSIONS.COUPONS_CREATE,     name: 'Create Coupons',     description: 'Create discount codes and limits' },
      { key: PERMISSIONS.COUPONS_UPDATE,     name: 'Edit Coupons',       description: 'Modify discounts and expiry dates' },
      { key: PERMISSIONS.COUPONS_DELETE,     name: 'Delete Coupons',     description: 'Remove coupons' },
      { key: PERMISSIONS.NEWSLETTERS_READ,   name: 'View Subscribers',   description: 'Read newsletter email subscribers' },
      { key: PERMISSIONS.NEWSLETTERS_DELETE, name: 'Manage Subscribers', description: 'Unsubscribe or delete newsletter emails' },
      { key: PERMISSIONS.CONTACTS_READ,      name: 'View Inquiries',     description: 'Read customer support messages' },
      { key: PERMISSIONS.CONTACTS_DELETE,    name: 'Delete Inquiries',   description: 'Delete customer messages' },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics & System',
    description: 'Revenue analytics, store metrics, and global configuration',
    permissions: [
      { key: PERMISSIONS.REVIEWS_READ,    name: 'View Reviews',     description: 'Inspect customer reviews and ratings' },
      { key: PERMISSIONS.REVIEWS_DELETE,  name: 'Delete Reviews',   description: 'Moderate and delete offensive reviews' },
      { key: PERMISSIONS.ANALYTICS_READ,  name: 'View Analytics',   description: 'Inspect sales figures and reports' },
      { key: PERMISSIONS.SETTINGS_MANAGE, name: 'System Settings',  description: 'Manage platform and security settings' },
    ],
  },
];

export const DEFAULT_ROLES: IRole[] = [
  {
    name: 'superadmin',
    displayName: 'Super Administrator',
    description: 'Unrestricted access to all system functions, user management, and security configurations.',
    isSystem: true,
    permissions: ALL_PERMISSION_KEYS,
  },
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full store operations management including products, orders, coupons, users, and reports.',
    isSystem: true,
    permissions: ALL_PERMISSION_KEYS.filter(
      (p) => p !== PERMISSIONS.ROLES_DELETE && p !== PERMISSIONS.ROLES_CREATE
    ),
  },
  {
    name: 'manager',
    displayName: 'Store Manager',
    description: 'Day-to-day operations: manages products, processes orders, and reads analytics.',
    isSystem: true,
    permissions: [
      PERMISSIONS.PRODUCTS_READ,
      PERMISSIONS.PRODUCTS_CREATE,
      PERMISSIONS.PRODUCTS_UPDATE,
      PERMISSIONS.ORDERS_READ,
      PERMISSIONS.ORDERS_UPDATE,
      PERMISSIONS.COUPONS_READ,
      PERMISSIONS.NEWSLETTERS_READ,
      PERMISSIONS.CONTACTS_READ,
      PERMISSIONS.REVIEWS_READ,
      PERMISSIONS.REVIEWS_DELETE,
      PERMISSIONS.ANALYTICS_READ,
    ],
  },
  {
    name: 'user',
    displayName: 'Standard User',
    description: 'Standard customer account with shopping and order history access.',
    isSystem: true,
    permissions: [],
  },
];
