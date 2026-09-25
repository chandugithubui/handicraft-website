/**
 * server/src/modules/auth/routes/auth.routes.test.ts
 *
 * Integration tests for Google OAuth routes using Supertest.
 * Verifies initiation redirect, state cookies, callback execution,
 * token rotation, session logout, and protected endpoint authorization.
 */

import cookieParser from 'cookie-parser';
import express from 'express';
import request from 'supertest';
import { googleOAuthConfig } from '../../../config/google-oauth.config';
import { googleAuthService } from '../services/google-auth.service';
import authRouter from './auth.routes';
import { signAccessToken } from '../utils/token.util';

// Mock the service layer for route-level integration testing
jest.mock('../services/google-auth.service');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', authRouter);
  return app;
};

describe('Auth Routes Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createTestApp();
  });

  describe('GET /api/auth/google', () => {
    it('should set state and nonce httpOnly cookies and redirect to Google', async () => {
      (googleAuthService.getAuthorizationUrl as jest.Mock).mockReturnValue({
        url: 'https://accounts.google.com/o/oauth2/v2/auth?mock=true',
        state: 'state-1234567890',
        nonce: 'nonce-1234567890',
        safeReturnTo: 'http://localhost:3000',
      });

      const response = await request(app).get('/api/auth/google');

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('https://accounts.google.com');

      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes(googleOAuthConfig.cookies.oauthStateName))).toBe(true);
      expect(cookies.some((c) => c.includes(googleOAuthConfig.cookies.oauthNonceName))).toBe(true);
    });

    it('should reject redirectUri not in allowlist', async () => {
      const response = await request(app)
        .get('/api/auth/google?returnTo=https://malicious-phishing-site.com')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('REDIRECT_URI_NOT_ALLOWED');
    });
  });

  describe('GET /api/auth/google/callback', () => {
    it('should reject request missing state parameter with 400', async () => {
      const response = await request(app)
        .get('/api/auth/google/callback?code=mock-code')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_OAUTH_STATE');
    });

    it('should successfully authenticate, set httpOnly tokens, and redirect on valid callback', async () => {
      const mockResult = {
        user: {
          id: 'user-001',
          name: 'Artisan User',
          email: 'artisan@handicrafthub.com',
          role: 'user',
          avatar: null,
          authProviders: ['google'],
        },
        tokens: {
          accessToken: 'access-jwt-123',
          refreshToken: 'refresh-jwt-456',
          expiresIn: 900,
        },
      };

      (googleAuthService.handleGoogleCallback as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/auth/google/callback?code=valid-code&state=cookie-state')
        .set('Cookie', [
          `${googleOAuthConfig.cookies.oauthStateName}=cookie-state`,
          `${googleOAuthConfig.cookies.oauthNonceName}=cookie-nonce`,
          `${googleOAuthConfig.cookies.oauthRedirectName}=http://localhost:3000`,
        ]);

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('http://localhost:3000');
      expect(response.headers.location).toContain('oauth=success');

      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies.some((c) => c.includes(googleOAuthConfig.cookies.accessTokenName))).toBe(true);
      expect(cookies.some((c) => c.includes(googleOAuthConfig.cookies.refreshTokenName))).toBe(true);
    });

    it('should return JSON response when client header specifies application/json', async () => {
      const mockResult = {
        user: {
          id: 'user-002',
          name: 'Artisan User 2',
          email: 'artisan2@handicrafthub.com',
          role: 'user',
          avatar: null,
          authProviders: ['google'],
        },
        tokens: {
          accessToken: 'access-jwt-999',
          refreshToken: 'refresh-jwt-999',
          expiresIn: 900,
        },
      };

      (googleAuthService.handleGoogleCallback as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/auth/google/callback?code=valid-code&state=cookie-state')
        .set('Accept', 'application/json')
        .set('Cookie', [
          `${googleOAuthConfig.cookies.oauthStateName}=cookie-state`,
          `${googleOAuthConfig.cookies.oauthNonceName}=cookie-nonce`,
        ])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(mockResult.user.email);
      expect(response.body.tokens.accessToken).toBe(mockResult.tokens.accessToken);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should rotate tokens and set new cookies when valid refresh token is passed', async () => {
      const mockRotated = {
        user: {
          id: 'user-001',
          name: 'Artisan',
          email: 'artisan@handicrafthub.com',
          role: 'user',
          avatar: null,
          authProviders: ['google'],
        },
        tokens: {
          accessToken: 'new-access-jwt',
          refreshToken: 'new-refresh-jwt',
          expiresIn: 900,
        },
      };

      (googleAuthService.rotateRefreshToken as jest.Mock).mockResolvedValue(mockRotated);

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`${googleOAuthConfig.cookies.refreshTokenName}=existing-refresh-token`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.tokens.accessToken).toBe('new-access-jwt');

      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies.some((c) => c.includes(googleOAuthConfig.cookies.accessTokenName))).toBe(true);
      expect(cookies.some((c) => c.includes(googleOAuthConfig.cookies.refreshTokenName))).toBe(true);
    });

    it('should return 401 when no refresh token cookie or body is sent', async () => {
      const response = await request(app).post('/api/auth/refresh').expect(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear authentication cookies and return success', async () => {
      (googleAuthService.revokeSession as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 if unauthenticated', async () => {
      const response = await request(app).get('/api/auth/me').expect(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return user profile when valid access token is provided in Bearer header', async () => {
      const token = signAccessToken({
        userId: 'user-auth-01',
        email: 'artisan@handicrafthub.com',
        role: 'user',
      });

      const mockUserProfile = {
        id: 'user-auth-01',
        name: 'Artisan User',
        email: 'artisan@handicrafthub.com',
        role: 'user',
        avatar: null,
        authProviders: ['google'],
      };

      (googleAuthService.getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('artisan@handicrafthub.com');
    });
  });
});
