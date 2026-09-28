/**
 * server/src/config/env.ts
 *
 * Single source of truth for all environment variables with TypeScript safety.
 * Validates required vars at startup so missing config is caught immediately.
 */

import dotenv from 'dotenv';
import path from 'path';

// Ensure .env is loaded
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const REQUIRED = ['MONGODB_URI', 'JWT_SECRET'] as const;

const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `[Config] FATAL — missing required environment variables:\n  ${missing.join('\n  ')}`
  );
  process.exit(1);
}

export interface AppConfig {
  PORT: number;
  NODE_ENV: string;
  isProduction: boolean;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  ALLOWED_ORIGIN: string;
  ALLOWED_ORIGINS: string[];
  FRONTEND_URL: string;
  RESEND_API_KEY?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
}

const parseAllowedOrigins = (): string[] => {
  const customList = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : [];

  const list = [
    process.env.ALLOWED_ORIGIN,
    process.env.FRONTEND_URL,
    ...customList,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter(Boolean) as string[];

  return Array.from(new Set(list));
};

export const env: AppConfig = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  MONGODB_URI: process.env.MONGODB_URI as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
  ALLOWED_ORIGINS: parseAllowedOrigins(),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
};

export default env;
