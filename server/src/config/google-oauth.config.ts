/**
 * server/src/config/google-oauth.config.ts
 *
 * Validated configuration for Google OAuth 2.0 and JWT token lifecycle.
 * All sensitive values are loaded strictly from environment variables.
 */

import dotenv from 'dotenv';
import path from 'path';

// Ensure environment variables are loaded
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface IGoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  scopes: string[];
  allowedRedirectUris: string[];
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
    accessExpiresInSeconds: number;
    refreshExpiresInMs: number;
  };
  cookies: {
    accessTokenName: string;
    refreshTokenName: string;
    oauthStateName: string;
    oauthNonceName: string;
    oauthRedirectName: string;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    domain?: string;
  };
  validateRedirectUri: (uri?: string | null) => boolean;
  getSafeRedirectUri: (uri?: string | null) => string;
}

const parseAllowedRedirectUris = (): string[] => {
  const defaults = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL || '',
    process.env.ALLOWED_ORIGIN || '',
    'https://handicraft-website.vercel.app',
  ].filter(Boolean);

  const raw = process.env.ALLOWED_REDIRECT_URIS;
  if (!raw) return Array.from(new Set(defaults));

  const list = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return Array.from(new Set([...defaults, ...list]));
};

const allowedRedirects = parseAllowedRedirectUris();

const isProduction = process.env.NODE_ENV === 'production';

// Validate Google OAuth secrets only if OAuth is configured
const hasGoogleClientId = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.trim() !== '';
const hasGoogleClientSecret = process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_SECRET.trim() !== '';

if (hasGoogleClientId || hasGoogleClientSecret) {
  // If any Google OAuth credential is set, client ID, client secret, and at least one JWT secret are required
  const googleSecrets = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
  const missingGoogleSecrets = googleSecrets.filter(key => !process.env[key] || process.env[key]!.trim() === '');
  
  if (missingGoogleSecrets.length > 0) {
    throw new Error(
      `[Config] Missing required Google OAuth secrets: ${missingGoogleSecrets.join(', ')}. ` +
      `Either provide all Google OAuth credentials or remove them to disable Google OAuth.`
    );
  }

  if (!process.env.JWT_ACCESS_SECRET && !process.env.JWT_SECRET) {
    throw new Error(
      `[Config] Missing JWT secret for Google OAuth. Please set JWT_ACCESS_SECRET or JWT_SECRET.`
    );
  }
}

export const googleOAuthConfig: IGoogleOAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackUrl:
    process.env.GOOGLE_CALLBACK_URL ||
    'http://localhost:5000/api/auth/google/callback',

  scopes: [
    'openid',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ],

  allowedRedirectUris: allowedRedirects,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || '',
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    accessExpiresInSeconds: 15 * 60, // 15 minutes in seconds
    refreshExpiresInMs: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  },

  cookies: {
    accessTokenName: 'access_token',
    refreshTokenName: 'refresh_token',
    oauthStateName: 'oauth_state',
    oauthNonceName: 'oauth_nonce',
    oauthRedirectName: 'oauth_redirect_uri',
    secure: isProduction,
    // Cross-site cookie support between Vercel frontend and Render backend
    sameSite: (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || (isProduction ? 'none' : 'lax'),
    domain: process.env.COOKIE_DOMAIN || undefined,
  },

  /**
   * Validate a requested redirect URI strictly against the allowlist.
   */
  validateRedirectUri: (uri?: string | null): boolean => {
    if (!uri) return false;
    try {
      const parsed = new URL(uri);
      const origin = parsed.origin;

      const matchesAllowed = allowedRedirects.some((allowed) => {
        try {
          return origin === new URL(allowed).origin;
        } catch {
          return false;
        }
      });

      if (matchesAllowed) return true;

      // Allow Vercel preview or production deployments for this project
      if (/^https:\/\/handicraft-website.*\.vercel\.app$/.test(origin)) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  },

  /**
   * Returns an allowlisted redirect URI or falls back to the primary frontend URL.
   */
  getSafeRedirectUri: (uri?: string | null): string => {
    const fallback =
      process.env.FRONTEND_URL ||
      (isProduction ? 'https://handicraft-website.vercel.app' : 'http://localhost:3000');
    if (!uri) return fallback;
    if (googleOAuthConfig.validateRedirectUri(uri)) {
      return uri;
    }
    return fallback;
  },
};
