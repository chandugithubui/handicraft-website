/**
 * server/src/modules/auth/controllers/google-auth.controller.ts
 *
 * HTTP controller layer for Google OAuth 2.0 endpoints.
 * Handles state cookies, query parameter validation, token cookie writing,
 * and redirect responses.
 */

import { CookieOptions, NextFunction, Request, Response } from 'express';
import { googleOAuthConfig } from '../../../config/google-oauth.config';
import {
  InvalidStateError,
  RedirectUriNotAllowedError,
  UnauthorizedError,
} from '../../../errors/auth.errors';
import { validateCallbackQuery } from '../dto/google-auth.dto';
import { googleAuthService } from '../services/google-auth.service';
import { TokenPair } from '../types/auth.types';
import { verifyRefreshToken } from '../utils/token.util';


// ── Cookie Option Builders ───────────────────────────────────────────────────

const getBaseCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: googleOAuthConfig.cookies.secure,
  sameSite: googleOAuthConfig.cookies.sameSite,
  domain: googleOAuthConfig.cookies.domain,
  path: '/',
});

const setAuthCookies = (res: Response, tokens: TokenPair): void => {
  const base = getBaseCookieOptions();

  // 1. Short-lived Access Token cookie
  res.cookie(googleOAuthConfig.cookies.accessTokenName, tokens.accessToken, {
    ...base,
    maxAge: googleOAuthConfig.jwt.accessExpiresInSeconds * 1000,
  });

  // 2. Long-lived Refresh Token cookie
  res.cookie(googleOAuthConfig.cookies.refreshTokenName, tokens.refreshToken, {
    ...base,
    maxAge: googleOAuthConfig.jwt.refreshExpiresInMs,
  });

  // 3. Dual-mode / backward compatibility cookie for existing code
  res.cookie('hh_token', tokens.accessToken, {
    ...base,
    maxAge: googleOAuthConfig.jwt.refreshExpiresInMs,
  });
};

const clearAuthCookies = (res: Response): void => {
  const base = getBaseCookieOptions();
  res.clearCookie(googleOAuthConfig.cookies.accessTokenName, base);
  res.clearCookie(googleOAuthConfig.cookies.refreshTokenName, base);
  res.clearCookie('hh_token', base);
  res.clearCookie(googleOAuthConfig.cookies.oauthStateName, base);
  res.clearCookie(googleOAuthConfig.cookies.oauthNonceName, base);
  res.clearCookie(googleOAuthConfig.cookies.oauthRedirectName, base);
};

const setStateCookies = (
  res: Response,
  state: string,
  nonce: string,
  returnTo: string
): void => {
  const shortTtlOptions: CookieOptions = {
    ...getBaseCookieOptions(),
    maxAge: 10 * 60 * 1000, // 10 minutes TTL
  };

  res.cookie(googleOAuthConfig.cookies.oauthStateName, state, shortTtlOptions);
  res.cookie(googleOAuthConfig.cookies.oauthNonceName, nonce, shortTtlOptions);
  res.cookie(
    googleOAuthConfig.cookies.oauthRedirectName,
    returnTo,
    shortTtlOptions
  );
};

const clearStateCookies = (res: Response): void => {
  const base = getBaseCookieOptions();
  res.clearCookie(googleOAuthConfig.cookies.oauthStateName, base);
  res.clearCookie(googleOAuthConfig.cookies.oauthNonceName, base);
  res.clearCookie(googleOAuthConfig.cookies.oauthRedirectName, base);
};

// ── Controller Methods ───────────────────────────────────────────────────────

export class GoogleAuthController {
  /**
   * GET /api/auth/google
   * Initiates Google OAuth 2.0 flow: generates state/nonce, sets cookies, and redirects.
   */
  public initiateGoogleAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const returnTo = typeof req.query.returnTo === 'string' ? req.query.returnTo : undefined;

      // Validate or fall back safely to configured frontend URL
      const safeReturnTo = googleOAuthConfig.getSafeRedirectUri(returnTo);

      const { url, state, nonce } =
        googleAuthService.getAuthorizationUrl(safeReturnTo);

      setStateCookies(res, state, nonce, safeReturnTo);

      // Support JSON response if client specifically requested JSON
      if (req.query.format === 'json' || req.headers.accept === 'application/json') {
        res.json({ success: true, authorizationUrl: url });
        return;
      }

      res.redirect(url);
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/auth/google/callback
   * Google redirects back here with authorization code and state.
   */
  public handleGoogleCallback = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { code, state, error, error_description } = validateCallbackQuery(
        req.query as Record<string, unknown>
      );

      const savedState = req.cookies?.[googleOAuthConfig.cookies.oauthStateName];
      const savedNonce = req.cookies?.[googleOAuthConfig.cookies.oauthNonceName];
      const savedReturnTo = req.cookies?.[googleOAuthConfig.cookies.oauthRedirectName];

      const safeReturnTo = googleOAuthConfig.getSafeRedirectUri(savedReturnTo);

      // Always clear state cookies regardless of outcome
      clearStateCookies(res);

      // Handle user cancellation or Google authorization error
      if (error) {
        console.warn(`[GoogleAuthController] Google OAuth error: ${error} - ${error_description}`);
        const redirectWithError = new URL(safeReturnTo);
        redirectWithError.searchParams.set('oauth_error', error);
        res.redirect(redirectWithError.toString());
        return;
      }

      if (!code || !state) {
        throw new InvalidStateError('Missing authorization code or state from Google callback.');
      }

      const result = await googleAuthService.handleGoogleCallback({
        code,
        state,
        savedState: savedState || '',
        savedNonce: savedNonce || '',
      });

      // Write secure httpOnly authentication cookies
      setAuthCookies(res, result.tokens);

      // If called via API client expecting JSON
      const acceptsJson =
        req.headers.accept?.includes('application/json') &&
        !req.headers.accept?.includes('text/html');

      if (acceptsJson) {
        res.json({
          success: true,
          message: 'Google authentication successful.',
          user: result.user,
          tokens: result.tokens,
        });
        return;
      }

      // Browser redirect to frontend with success query param
      const targetUrl = new URL(safeReturnTo);
      targetUrl.searchParams.set('oauth', 'success');
      res.redirect(targetUrl.toString());
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/auth/refresh
   * Exchanges an active refresh token for a newly rotated token pair.
   */
  public refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const rawToken =
        req.cookies?.[googleOAuthConfig.cookies.refreshTokenName] ||
        req.body?.refreshToken;

      if (!rawToken) {
        throw new UnauthorizedError('Refresh token required.');
      }

      const result = await googleAuthService.rotateRefreshToken(rawToken);

      // Write updated rotated cookies
      setAuthCookies(res, result.tokens);

      res.json({
        success: true,
        message: 'Tokens rotated successfully.',
        user: result.user,
        tokens: result.tokens,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/auth/logout
   * Revokes active session tokens and clears httpOnly cookies.
   */
  public logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const rawRefreshToken =
        req.cookies?.[googleOAuthConfig.cookies.refreshTokenName] ||
        req.body?.refreshToken;

      // Prefer userId from authenticated middleware; fall back to decoding the refresh token
      // so logout works even when called without a valid access token (e.g. after it expires)
      let userId = req.user?.userId;

      if (!userId && rawRefreshToken) {
        try {
          const payload = verifyRefreshToken(rawRefreshToken);
          userId = payload.userId;
        } catch {
          // Token may already be invalid — still clear cookies below
        }
      }

      if (userId) {
        await googleAuthService.revokeSession(userId, rawRefreshToken);
        console.log(`[Auth] Logout: session revoked for user ${userId}`);
      }

      // Always clear cookies regardless of whether revocation succeeded
      clearAuthCookies(res);

      res.json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (err) {
      // Even on error, attempt to clear cookies so the client is cleaned up
      clearAuthCookies(res);
      next(err);
    }
  };

  /**
   * GET /api/auth/me
   * Fetches public user profile of currently authenticated user.
   */
  public getCurrentUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError();
      }

      const user = await googleAuthService.getUserProfile(req.user.userId);

      res.json({
        success: true,
        user,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const googleAuthController = new GoogleAuthController();
