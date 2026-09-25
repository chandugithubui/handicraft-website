/**
 * server/src/modules/auth/services/google-auth.service.test.ts
 *
 * Unit tests for GoogleAuthService.
 * Validates OAuth state verification, ID token processing, user provisioning/linking,
 * Refresh Token Rotation (RTR), and token family reuse detection with mocked Google APIs.
 */

import {
  InvalidIdTokenError,
  InvalidRefreshTokenError,
  InvalidStateError,
  TokenReuseDetectedError,
} from '../../../errors/auth.errors';
import UserModel, { IUserDocument } from '../../../models/user.model';
import { GoogleOAuthStrategy } from '../strategies/google.strategy';
import { GoogleUserPayload } from '../types/auth.types';
import { hashToken, signRefreshToken } from '../utils/token.util';
import { GoogleAuthService } from './google-auth.service';

// Mock UserModel
jest.mock('../../../models/user.model');

describe('GoogleAuthService', () => {
  let mockStrategy: jest.Mocked<GoogleOAuthStrategy>;
  let service: GoogleAuthService;

  const mockGoogleUser: GoogleUserPayload = {
    sub: 'google-sub-12345',
    email: 'artisan@handicrafthub.com',
    email_verified: true,
    name: 'Artisan User',
    picture: 'https://lh3.googleusercontent.com/avatar.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockStrategy = {
      generateAuthUrl: jest.fn().mockReturnValue('https://accounts.google.com/o/oauth2/v2/auth?client_id=test'),
      exchangeCodeForTokens: jest.fn().mockResolvedValue({
        id_token: 'valid-mock-id-token',
        access_token: 'mock-google-access-token',
      }),
      verifyIdToken: jest.fn().mockResolvedValue(mockGoogleUser),
    } as unknown as jest.Mocked<GoogleOAuthStrategy>;

    service = new GoogleAuthService(mockStrategy);
  });

  describe('getAuthorizationUrl', () => {
    it('should generate secure authorization URL with cryptographic state and nonce', () => {
      const result = service.getAuthorizationUrl('http://localhost:3000/dashboard');

      expect(result.url).toBeDefined();
      expect(result.state).toHaveLength(64); // 32 bytes hex
      expect(result.nonce).toHaveLength(32); // 16 bytes hex
      expect(mockStrategy.generateAuthUrl).toHaveBeenCalledWith(result.state, result.nonce);
    });
  });

  describe('handleGoogleCallback', () => {
    it('should throw InvalidStateError when state does not match saved state (CSRF protection)', async () => {
      await expect(
        service.handleGoogleCallback({
          code: 'valid-auth-code',
          state: 'tampered-state-xyz',
          savedState: 'original-saved-state-abc',
          savedNonce: 'test-nonce',
        })
      ).rejects.toThrow(InvalidStateError);

      expect(mockStrategy.exchangeCodeForTokens).not.toHaveBeenCalled();
    });

    it('should throw InvalidIdTokenError when Google returns no id_token', async () => {
      mockStrategy.exchangeCodeForTokens.mockResolvedValueOnce({
        access_token: 'only-access-token',
        id_token: null,
      });

      await expect(
        service.handleGoogleCallback({
          code: 'valid-auth-code',
          state: 'matched-state',
          savedState: 'matched-state',
          savedNonce: 'test-nonce',
        })
      ).rejects.toThrow(InvalidIdTokenError);
    });

    it('should provision a new user if account does not exist by googleId or email', async () => {
      // No user found by googleId or email
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);

      const mockSavedUser = {
        _id: 'mongo-user-id-001',
        name: mockGoogleUser.name,
        email: mockGoogleUser.email,
        googleId: mockGoogleUser.sub,
        avatar: mockGoogleUser.picture,
        role: 'user',
        authProviders: ['google'],
        refreshTokens: [],
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock constructor
      (UserModel as unknown as jest.Mock).mockImplementation(() => mockSavedUser);

      const result = await service.handleGoogleCallback({
        code: 'auth-code-123',
        state: 'valid-state',
        savedState: 'valid-state',
        savedNonce: 'valid-nonce',
      });

      expect(mockStrategy.exchangeCodeForTokens).toHaveBeenCalledWith('auth-code-123');
      expect(mockStrategy.verifyIdToken).toHaveBeenCalledWith('valid-mock-id-token', 'valid-nonce');
      expect(result.user.email).toBe(mockGoogleUser.email);
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
      expect(mockSavedUser.save).toHaveBeenCalled();
    });

    it('should link Google ID to existing local account if matching email exists', async () => {
      const existingLocalUser = {
        _id: 'local-user-id-002',
        name: 'Existing User',
        email: mockGoogleUser.email,
        googleId: null,
        authProviders: ['local'],
        avatar: null,
        role: 'user',
        refreshTokens: [],
        save: jest.fn().mockResolvedValue(true),
      };

      // First findOne (by googleId) returns null, second findOne (by email) returns local account
      (UserModel.findOne as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingLocalUser);

      const result = await service.handleGoogleCallback({
        code: 'auth-code-link',
        state: 'matching-state',
        savedState: 'matching-state',
        savedNonce: 'matching-nonce',
      });

      expect(existingLocalUser.googleId).toBe(mockGoogleUser.sub);
      expect(existingLocalUser.authProviders).toContain('google');
      expect(existingLocalUser.avatar).toBe(mockGoogleUser.picture);
      expect(existingLocalUser.save).toHaveBeenCalled();
      expect(result.user.email).toBe(mockGoogleUser.email);
    });
  });

  describe('rotateRefreshToken', () => {
    it('should rotate valid refresh token, replace with new token and return new pair', async () => {
      const familyId = 'family-alpha-123';
      const rawToken = signRefreshToken({
        userId: 'user-rot-01',
        tokenId: 'token-rot-01',
        family: familyId,
      });

      const hashedToken = hashToken(rawToken);

      const mockUser = {
        _id: 'user-rot-01',
        email: 'artisan@handicrafthub.com',
        role: 'user',
        name: 'Artisan',
        authProviders: ['google'],
        refreshTokens: [
          {
            tokenHash: hashedToken,
            family: familyId,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            createdAt: new Date(),
            isRevoked: false,
            replacedByTokenHash: null,
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.rotateRefreshToken(rawToken);

      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
      expect(mockUser.refreshTokens[0].isRevoked).toBe(true);
      expect(mockUser.refreshTokens.length).toBe(2); // original revoked + newly rotated token
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should detect token reuse, revoke all tokens in that family, and throw TokenReuseDetectedError', async () => {
      const familyId = 'family-reuse-999';
      const rawReusedToken = signRefreshToken({
        userId: 'user-reuse-01',
        tokenId: 'token-reuse-01',
        family: familyId,
      });

      const hashedReusedToken = hashToken(rawReusedToken);

      const mockUser = {
        _id: 'user-reuse-01',
        email: 'artisan@handicrafthub.com',
        role: 'user',
        name: 'Artisan',
        authProviders: ['google'],
        refreshTokens: [
          {
            tokenHash: hashedReusedToken,
            family: familyId,
            expiresAt: new Date(Date.now() + 10000),
            createdAt: new Date(),
            isRevoked: true, // ALREADY REVOKED (reuse attack!)
          },
          {
            tokenHash: 'successor-token-hash',
            family: familyId,
            expiresAt: new Date(Date.now() + 10000),
            createdAt: new Date(),
            isRevoked: false, // Active successor
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.rotateRefreshToken(rawReusedToken)).rejects.toThrow(
        TokenReuseDetectedError
      );

      // Verify all tokens in the family have been invalidated
      expect(mockUser.refreshTokens.every((t) => t.isRevoked)).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw InvalidRefreshTokenError when token is expired', async () => {
      const familyId = 'family-exp-123';
      const rawToken = signRefreshToken({
        userId: 'user-exp-01',
        tokenId: 'token-exp-01',
        family: familyId,
      });

      const hashedToken = hashToken(rawToken);

      const mockUser = {
        _id: 'user-exp-01',
        email: 'artisan@handicrafthub.com',
        role: 'user',
        name: 'Artisan',
        authProviders: ['google'],
        refreshTokens: [
          {
            tokenHash: hashedToken,
            family: familyId,
            expiresAt: new Date(Date.now() - 1000), // In the past
            createdAt: new Date(),
            isRevoked: false,
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.rotateRefreshToken(rawToken)).rejects.toThrow(
        InvalidRefreshTokenError
      );
    });
  });
});
