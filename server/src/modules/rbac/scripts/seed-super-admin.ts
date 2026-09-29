/**
 * server/src/modules/rbac/scripts/seed-super-admin.ts
 *
 * One-time script to create the first Super Admin user.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register src/modules/rbac/scripts/seed-super-admin.ts
 *
 * Or via the npm script (add to server/package.json):
 *   "seed:admin": "ts-node src/modules/rbac/scripts/seed-super-admin.ts"
 *
 * Credentials come from environment variables so they are NEVER hard-coded:
 *   SUPER_ADMIN_EMAIL    — required
 *   SUPER_ADMIN_PASSWORD — required (min 8 chars)
 *   SUPER_ADMIN_NAME     — optional, defaults to "Super Admin"
 *
 * Idempotent: safe to run multiple times. If the email already exists the
 * script updates the role to super_admin without changing the password.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../../.env') });

import UserModel from '../../../models/user.model';
import RoleModel from '../../../models/role.model';
import { seedSystemRoles } from './seed-roles';

async function main() {
  // ── Validate env ──────────────────────────────────────────────────────────

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌  MONGODB_URI is not set in .env');
    process.exit(1);
  }

  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';

  if (!email || !password) {
    console.error('❌  SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env');
    console.error('    Add these lines to your server/.env file:');
    console.error('      SUPER_ADMIN_EMAIL=admin@yourstore.com');
    console.error('      SUPER_ADMIN_PASSWORD=YourSecurePassword123!');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌  SUPER_ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  // ── Connect ───────────────────────────────────────────────────────────────

  await mongoose.connect(mongoUri);
  console.log('✅  Connected to MongoDB');

  // ── Ensure system roles exist ─────────────────────────────────────────────

  console.log('\n📋  Ensuring system roles are seeded...');
  await seedSystemRoles();

  // Verify super_admin role exists
  const superAdminRole = await RoleModel.findOne({ name: 'super_admin' });
  if (!superAdminRole) {
    console.error('❌  super_admin role not found after seeding. Aborting.');
    process.exit(1);
  }

  // ── Create or update super admin user ────────────────────────────────────

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await UserModel.findOne({ email: normalizedEmail });

  if (existingUser) {
    if (existingUser.role === 'super_admin') {
      console.log(`\n⚠️   User "${normalizedEmail}" already has super_admin role. No changes made.`);
    } else {
      existingUser.role = 'super_admin';
      await existingUser.save();
      console.log(`\n🔄  Updated existing user "${normalizedEmail}" → role: super_admin`);
    }
  } else {
    const hashedPassword = await bcrypt.hash(password, 12);

    const superAdminData: Record<string, unknown> = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'super_admin',
      authProviders: ['local'],
      customPermissions: [],
      refreshTokens: [],
      // Deliberately omit googleId so the sparse unique index is not triggered
    };
    await UserModel.create(superAdminData);

    console.log('\n✅  Super Admin user created successfully!');
    console.log('─'.repeat(50));
    console.log(`   Name    : ${name}`);
    console.log(`   Email   : ${normalizedEmail}`);
    console.log(`   Role    : super_admin`);
    console.log(`   Password: ${password}`);
    console.log('─'.repeat(50));
    console.log('\n⚠️   Store these credentials somewhere safe.');
    console.log('    Remove SUPER_ADMIN_PASSWORD from .env after first login.\n');
  }

  await mongoose.disconnect();
  console.log('✅  Done.\n');
}

main().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
