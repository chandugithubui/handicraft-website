/**
 * server/src/app.ts
 *
 * Express application factory.
 * Configures security, parsers, static file serving, and API route mounts.
 * Clean, decoupled from HTTP server startup and database connection logic.
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';

import corsOptions from './config/cors.config';
import apiRoutes from './routes';

export const createApp = (): Application => {
  const app: Application = express();

  // Trust first proxy (Render, Vercel, Nginx)
  app.set('trust proxy', 1);

  // Security Headers
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    })
  );

  // NoSQL injection sanitization
  app.use(mongoSanitize());

  // Cookie parser
  app.use(cookieParser());

  // CORS middleware & preflight handling
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  // JSON Body Parser
  app.use(express.json());

  // Static files with Cross-Origin Resource Policy
  const uploadsPath = path.join(__dirname, '../../uploads');
  app.use(
    '/uploads',
    (_req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      next();
    },
    express.static(uploadsPath)
  );

  // API Routes Mount
  app.use('/api', apiRoutes);

  // Health / Root Test Route
  app.get('/', (_req: Request, res: Response) => {
    res.send('Welcome to Handicraft Hub API!');
  });

  // Global 404 Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Resource not found' });
  });

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';
    if (status >= 500) {
      console.error('[App Error]', err);
    }
    res.status(status).json({ success: false, message });
  });

  return app;
};

export const app = createApp();
export default app;
