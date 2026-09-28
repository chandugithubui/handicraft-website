/**
 * server/src/index.ts
 *
 * Server entry point in pure TypeScript.
 * Connects to MongoDB via the Singleton Database manager, then starts the HTTP server.
 */

import env from './config/env';
import db from './config/database';
import app from './app';
import { seedSystemRoles } from './modules/rbac/scripts/seed-roles';

const startServer = async (): Promise<void> => {
  try {
    // 1. Establish Singleton MongoDB Connection
    console.log('[Server] Connecting to MongoDB...');
    await db.connect(env.MONGODB_URI);

    // 2. Seed RBAC system roles (idempotent — safe on every restart)
    await seedSystemRoles();

    // 3. Start HTTP Listener
    const server = app.listen(env.PORT, () => {
      console.log(`[Server] Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`[Server] Database status: ${db.getStats().state}`);
    });

    // Handle unexpected runtime rejections
    process.on('unhandledRejection', (reason: any) => {
      console.error('[Server] Unhandled Rejection:', reason);
    });

    process.on('uncaughtException', (error: Error) => {
      console.error('[Server] Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('[Server] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
