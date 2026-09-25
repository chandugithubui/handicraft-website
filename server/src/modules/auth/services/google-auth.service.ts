/**
 * server/src/modules/auth/services/google-auth.service.ts
 *
 * Production-grade Google OAuth 2.0 and JWT session service.
 * Handles state verification, account creation/linking, token issuance,
 * refresh token rotation with reuse detection, and session revocation.
 */

import { googleOAuthConfig } from '../../../config/google-oauth.config';
import {
  InvalidIdTokenError,
  InvalidRefreshTokenError,
  InvalidStateError,
  TokenReuseDetectedError,
  UnauthorizedError,
} from '../../../errors/auth.errors';
import UserModel, { IRefreshToken, IUserDocument } from '../../../models/user.model';
import { GoogleOAuthStrategy, googleStrategy } from '../strategies/google.strategy';
import {
  AuthSuccessResult,
  JwtAccessPayload,
  JwtRefreshPayload,
  PublicUser,
  TokenPair,
} from '../types/auth.types';
import {
  createTokenPair,
  generateRandomToken,
  hashToken,
  toPublicUser,
  verifyRefreshToken,
} from '../utils/token.util';

export class GoogleAuthService {
  constructor(private strategy: GoogleOAuthStrategy = googleStrategy) {}

  /**
   * Initializes the OAuth 2.0 authorization code flow.
   * Generates cryptographically secure state and nonce parameters.
   */
  public getAuthorizationUrl(returnTo?: string): {
    url: string;
    state: string;
    nonce: string;
    safeReturnTo: string;
  } {
    const state = generateRandomToken(32);
    const nonce = generateRandomToken(16);
    const safeReturnTo = googleOAuthConfig.getSafeRedirectUri(returnTo);
    const url = this.strategy.generateAuthUrl(state, nonce);

    return { url, state, nonce, safeReturnTo };
  }

  /**
   * Handles Google callback: validates state, exchanges authorization code,
   * verifies ID token server-side, provisions/links user account, and creates tokens.
   */
  public async handleGoogleCallback(params: {
    code: string;
    state: string;
    savedState: string;
    savedNonce: string;
  }): Promise<AuthSuccessResult> {
    const { code, state, savedState, savedNonce } = params;

    // 1. Strict CSRF State parameter validation
    if (!state || !savedState || state !== savedState) {
      console.warn('[GoogleAuthService] CSRF state parameter validation failed.');
      throw new InvalidStateError();
    }

    // 2. Exchange authorization code for tokens
    const googleTokens = await this.strategy.exchangeCodeForTokens(code);
    if (!googleTokens.id_token) {
      throw new InvalidIdTokenError('No ID token returned by Google authorization server.');
    }

    // 3. Server-side validation of ID token signature, audience, and nonce
    const googleProfile = await this.strategy.verifyIdToken(
      googleTokens.id_token,
      savedNonce
    );

    // 4. Find or provision user account
    let user: IUserDocument | null = await UserModel.findOne({
      googleId: googleProfile.sub,
    });

    if (user) {
      // Existing Google-linked user
      console.log(`[GoogleAuthService] User authenticated via Google ID: ${user._id}`);
      if (!user.avatar && googleProfile.picture) {
        user.avatar = googleProfile.picture;
      }
      if (!user.authProviders.includes('google')) {
        user.authProviders.push('google');
      }
    } else {
      // Check if user already exists with the same verified email
      const existingByEmail = await UserModel.findOne({
        email: googleProfile.email,
      });

      if (existingByEmail) {
        // Link existing local account with Google ID
        console.log(
          `[GoogleAuthService] Linking Google account to existing user by email: ${existingByEmail._id}`
        );
        existingByEmail.googleId = googleProfile.sub;
        if (!existingByEmail.authProviders.includes('google')) {
          existingByEmail.authProviders.push('google');
        }
        if (!existingByEmail.avatar && googleProfile.picture) {
          existingByEmail.avatar = googleProfile.picture;
        }
        user = existingByEmail;
      } else {
        // Provision brand new user account
        console.log(
          `[GoogleAuthService] Provisioning new user for Google email: ${googleProfile.email}`
        );
        user = new UserModel({
          name: googleProfile.name,
          email: googleProfile.email,
          googleId: googleProfile.sub,
          avatar: googleProfile.picture ?? null,
          role: 'user',
          authProviders: ['google'],
          password: null, // OAuth account without local password
          refreshTokens: [],
        });
      }
    }

    // 5. Issue short-lived access token + long-lived refresh token
    const tokenPair = await this.issueTokensForUser(user);

    return {
      user: toPublicUser(user),
      tokens: tokenPair,
    };
  }

  /**
   * Refreshes access token with Refresh Token Rotation (RTR) and Token Family Reuse Detection.
   */
  public async rotateRefreshToken(rawRefreshToken: string): Promise<AuthSuccessResult> {
    if (!rawRefreshToken) {
      throw new InvalidRefreshTokenError('Refresh token was not provided.');
    }

    // 1. Verify cryptographic JWT signature
    const payload = verifyRefreshToken(rawRefreshToken);
    if (!payload.userId || !payload.family) {
      throw new InvalidRefreshTokenError('Malformed refresh token payload.');
    }

    // 2. Fetch user from database
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError('User associated with refresh token no longer exists.');
    }

    // 3. Hash raw token and look up in user's refresh token array
    const hashedIncoming = hashToken(rawRefreshToken);
    const existingTokenIndex = user.refreshTokens.findIndex(
      (t) => t.tokenHash === hashedIncoming
    );

    if (existingTokenIndex === -1) {
      // Token not found in database — might be a reused old token or tampered token
      // Check if family has any tokens; if so, trigger reuse detection on the whole family
      const matchingFamilyTokens = user.refreshTokens.filter(
        (t) => t.family === payload.family
      );
      if (matchingFamilyTokens.length > 0) {
        console.warn(
          `[GoogleAuthService] REUSE DETECTED: Unknown token with active family ${payload.family}. Invalidating family.`
        );
        matchingFamilyTokens.forEach((t) => (t.isRevoked = true));
        await user.save();
        throw new TokenReuseDetectedError();
      }
      throw new InvalidRefreshTokenError();
    }

    const currentToken = user.refreshTokens[existingTokenIndex];

    // 4. Token Reuse Detection: If token is already revoked, an attacker or replay used an old token
    if (currentToken.isRevoked) {
      console.warn(
        `[GoogleAuthService] REUSE DETECTED: Already revoked token re-submitted for family ${payload.family}. Invalidating entire family.`
      );
      user.refreshTokens.forEach((t) => {
        if (t.family === payload.family) {
          t.isRevoked = true;
        }
      });
      await user.save();
      throw new TokenReuseDetectedError();
    }

    // 5. Expiration check
    if (new Date() > new Date(currentToken.expiresAt)) {
      currentToken.isRevoked = true;
      await user.save();
      throw new InvalidRefreshTokenError('Refresh token has expired.');
    }

    // 6. Rotate: Invalidate current token and link to successor
    currentToken.isRevoked = true;

    // 7. Issue new token pair preserving the same token family
    const newFamily = currentToken.family;
    const newRefreshTokenId = generateRandomToken(16);

    const accessPayload: JwtAccessPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const refreshPayload: JwtRefreshPayload = {
      userId: user._id.toString(),
      tokenId: newRefreshTokenId,
      family: newFamily,
    };

    const tokens = createTokenPair(accessPayload, refreshPayload);
    const newHashedToken = hashToken(tokens.refreshToken);

    currentToken.replacedByTokenHash = newHashedToken;

    // Add new rotated token to record
    const newTokenRecord: IRefreshToken = {
      tokenHash: newHashedToken,
      family: newFamily,
      expiresAt: new Date(Date.now() + googleOAuthConfig.jwt.refreshExpiresInMs),
      createdAt: new Date(),
      isRevoked: false,
    };

    user.refreshTokens.push(newTokenRecord);

    // Prune stale tokens: keep at most 20 tokens to avoid document bloating
    if (user.refreshTokens.length > 20) {
      user.refreshTokens = user.refreshTokens
        .filter((t) => !t.isRevoked || new Date(t.expiresAt) > new Date())
        .slice(-15);
    }

    await user.save();

    console.log(
      `[GoogleAuthService] Rotated refresh token for user ${user._id} in family ${newFamily}`
    );

    return {
      user: toPublicUser(user),
      tokens,
    };
  }

  /**
   * Revokes the user's active session or refresh token on logout.
   */
  public async revokeSession(
    userId: string,
    rawRefreshToken?: string
  ): Promise<void> {
    const user = await UserModel.findById(userId);
    if (!user) return;

    if (rawRefreshToken) {
      const hashed = hashToken(rawRefreshToken);
      const token = user.refreshTokens.find((t) => t.tokenHash === hashed);
      if (token) {
        token.isRevoked = true;
        // Invalidate all tokens in that family
        user.refreshTokens.forEach((t) => {
          if (t.family === token.family) {
            t.isRevoked = true;
          }
        });
      }
    } else {
      // Invalidate all active tokens for the user
      user.refreshTokens.forEach((t) => (t.isRevoked = true));
    }

    await user.save();
    console.log(`[GoogleAuthService] Session revoked for user: ${userId}`);
  }

  /**
   * Fetches public profile for authenticated user ID.
   */
  public async getUserProfile(userId: string): Promise<PublicUser> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User account not found.');
    }
    return toPublicUser(user);
  }

  /**
   * Private helper to issue access and refresh tokens and save hashed token to DB.
   */
  private async issueTokensForUser(user: IUserDocument): Promise<TokenPair> {
    const family = generateRandomToken(16);
    const tokenId = generateRandomToken(16);

    const accessPayload: JwtAccessPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const refreshPayload: JwtRefreshPayload = {
      userId: user._id.toString(),
      tokenId,
      family,
    };

    const tokens = createTokenPair(accessPayload, refreshPayload);
    const tokenHash = hashToken(tokens.refreshToken);

    const refreshTokenRecord: IRefreshToken = {
      tokenHash,
      family,
      expiresAt: new Date(Date.now() + googleOAuthConfig.jwt.refreshExpiresInMs),
      createdAt: new Date(),
      isRevoked: false,
    };

    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }

    user.refreshTokens.push(refreshTokenRecord);

    // Keep active records limited
    if (user.refreshTokens.length > 20) {
      user.refreshTokens = user.refreshTokens.slice(-15);
    }

    await user.save();

    return tokens;
  }
}

export const googleAuthService = new GoogleAuthService();
