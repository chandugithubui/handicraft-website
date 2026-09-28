/**
 * server/src/config/cors.config.ts
 *
 * Reusable CORS configuration for Express middleware and preflight handlers.
 */

import { CorsOptions } from 'cors';
import env from './env';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    if (env.ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error(`CORS error: Origin '${origin}' is not authorized.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours preflight cache
};

export default corsOptions;
