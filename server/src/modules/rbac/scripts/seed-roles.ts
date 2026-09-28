/**
 * server/src/modules/rbac/scripts/seed-roles.ts
 *
 * Idempotent seeder for system roles in the Handicraft Hub e-commerce platform.
 *
 * SYSTEM ROLES (isSystem: true) — cannot be deleted via API:
 *
 *  1. super_admin   – God-mode: full unrestricted access + RBAC management
 *  2. admin         – Store manager: all ops except role/permission management
 *  3. artisan       – Seller: manage own products, view own orders
 *  4. support       – Customer support: read orders/users/contacts, reply to contacts
 *  5. moderator     – Content moderator: reviews, testimonials, newsletters
 *  6. analyst       – Analytics/reporting read-only
 *  7. user          – Base customer: no admin panel access
 *
 * Called automatically on server startup via initializeRbac().
 * Also runnable standalone: npx ts-node src/modules/rbac/scripts/seed-roles.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import RoleModel from '../../../models/role.model';
import { PERMISSIONS_MANIFEST } from '../permissions.manifest';

dotenv.config({ path: path.join(__dirname, '../../../../.env') });

const ALL_PERMISSIONS = PERMISSIONS_MANIFEST.flatMap((m) =>
  m.permissions.map((p) => p.key)
);

// ── Role Definitions ───────────────────────────────────────────────────────────

interface RoleSeed {
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

export const SYSTEM_ROLE_SEEDS: RoleSeed[] = [
  // ── 1. Super Admin ───────────────────────────────────────────────────────────
  {
    name: 'super_admin',
    displayName: 'Super Admin',
    description:
      'Unrestricted access to all features including RBAC management. ' +
      'Intended for platform owners only.',
    permissions: ALL_PERMISSIONS,
    isSystem: true,
  },

  // ── 2. Admin (Store Manager) ─────────────────────────────────────────────────
  {
    name: 'admin',
    displayName: 'Admin',
    description:
      'Full store management: products, orders, users, coupons, analytics. ' +
      'Cannot manage roles or permissions.',
    permissions: [
      'products:read', 'products:create', 'products:update', 'products:delete',
      'orders:read',   'orders:update',   'orders:delete',
      'users:read',    'users:update',    'users:delete',
      'coupons:read',  'coupons:create',  'coupons:update', 'coupons:delete',
      'newsletters:read', 'newsletters:delete',
      'contacts:read',    'contacts:delete',
      'reviews:read',     'reviews:delete',
      'analytics:read',
      'settings:manage',
    ],
    isSystem: true,
  },

  // ── 3. Artisan (Seller / Vendor) ─────────────────────────────────────────────
  {
    name: 'artisan',
    displayName: 'Artisan',
    description:
      'Handicraft seller / vendor. Can manage their own products and view ' +
      'incoming orders related to their listings. No user management.',
    permissions: [
      'products:read', 'products:create', 'products:update', 'products:delete',
      'orders:read',
    ],
    isSystem: true,
  },

  // ── 4. Support Agent ─────────────────────────────────────────────────────────
  {
    name: 'support',
    displayName: 'Support Agent',
    description:
      'Customer support staff. Can view orders, users, and contacts ' +
      'to assist customers. Read-only on most resources.',
    permissions: [
      'products:read',
      'orders:read',   'orders:update',
      'users:read',
      'contacts:read', 'contacts:delete',
      'reviews:read',
    ],
    isSystem: true,
  },

  // ── 5. Content Moderator ─────────────────────────────────────────────────────
  {
    name: 'moderator',
    displayName: 'Content Moderator',
    description:
      'Handles content quality: can moderate reviews, manage newsletter ' +
      'subscribers, and view product catalog.',
    permissions: [
      'products:read',
      'reviews:read',     'reviews:delete',
      'newsletters:read', 'newsletters:delete',
      'contacts:read',
    ],
    isSystem: true,
  },

  // ── 6. Analyst ───────────────────────────────────────────────────────────────
  {
    name: 'analyst',
    displayName: 'Analyst',
    description:
      'Read-only access to analytics, orders and products for reporting purposes.',
    permissions: [
      'analytics:read',
      'orders:read',
      'products:read',
      'users:read',
    ],
    isSystem: true,
  },

  // ── 7. Customer (default) ─────────────────────────────────────────────────────
  {
    name: 'user',
    displayName: 'Customer',
    description:
      'Default role assigned to every registered customer. ' +
      'No admin panel access — enforced at route level.',
    permissions: [],
    isSystem: true,
  },
];

// ── Seeder Logic ───────────────────────────────────────────────────────────────

/**
 * Idempotent seed: creates missing system roles and updates permissions of
 * existing system roles to match the current manifest.
 *
 * Safe to call on every server startup.
 */
export async function seedSystemRoles(): Promise<void> {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const seed of SYSTEM_ROLE_SEEDS) {
    const existing = await RoleModel.findOne({ name: seed.name });

    if (!existing) {
      await RoleModel.create(seed);
      created++;
      console.log(`  ✅  [RBAC] Created system role: "${seed.name}"`);
    } else {
      // Always keep system role permissions in sync with the code manifest
      const needsUpdate =
        JSON.stringify([...existing.permissions].sort()) !==
        JSON.stringify([...seed.permissions].sort());

      if (needsUpdate) {
        existing.permissions = seed.permissions;
        await existing.save();
        updated++;
        console.log(`  🔄  [RBAC] Updated permissions for system role: "${seed.name}"`);
      } else {
        skipped++;
      }
    }
  }

  if (created > 0 || updated > 0) {
    console.log(
      `  📊  [RBAC] Seed complete — ${created} created, ${updated} updated, ${skipped} unchanged.`
    );
  }
}

// ── Standalone Entrypoint ──────────────────────────────────────────────────────

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌  MONGODB_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('✅  Connected to MongoDB');
  await seedSystemRoles();
  await mongoose.disconnect();
}

// Only run when executed directly (not when imported)
if (require.main === module) {
  main().catch((err) => {
    console.error('❌  Seed failed:', err);
    process.exit(1);
  });
}
