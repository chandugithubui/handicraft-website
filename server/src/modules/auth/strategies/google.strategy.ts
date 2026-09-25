/**
 * server/src/modules/auth/strategies/google.strategy.ts
 *
 * Encapsulates Google OAuth 2.0 communication using google-auth-library.
 * Handles authorization URL generation, code token exchange, and ID token verification.
 */

import { OAuth2Client } from 'google-auth-library';
import { googleOAuthConfig } from '../../../config/google-oauth.config';
import { GoogleUserPayload } from '../types/auth.types';
import {
  InvalidIdTokenError,
  TokenExchangeError,
} from '../../../errors/auth.errors';

export class GoogleOAuthStrategy {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(
      googleOAuthConfig.clientId,
      googleOAuthConfig.clientSecret,
      googleOAuthConfig.callbackUrl
    );
  }

  /**
   * Generates the Google OAuth consent URL containing state and nonce parameters.
   */
  public generateAuthUrl(state: string, nonce: string): string {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: googleOAuthConfig.scopes,
      state,
      include_granted_scopes: true,
      // Pass nonce in authorization query so Google embeds it into the returned ID token
      nonce,
    });
  }

  /**
   * Exchanges the authorization code returned by Google for OAuth tokens.
   */
  public async exchangeCodeForTokens(code: string): Promise<{
    access_token?: string | null;
    id_token?: string | null;
    refresh_token?: string | null;
  }> {
    try {
      const response = await this.client.getToken(code);
      return response.tokens;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown token exchange error';
      console.error('[GoogleStrategy] Code exchange failed:', message);
      throw new TokenExchangeError(`Failed to exchange authorization code: ${message}`);
    }
  }

  /**
   * Verifies the cryptographic signature and claims of the Google ID token server-side.
   * Validates audience, issuer, expiration, email verification, and nonce.
   */
  public async verifyIdToken(
    idToken: string,
    expectedNonce?: string
  ): Promise<GoogleUserPayload> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: googleOAuthConfig.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.sub || !payload.email) {
        throw new InvalidIdTokenError('Missing required user claims in Google ID token.');
      }

      if (!payload.email_verified) {
        throw new InvalidIdTokenError('Google email account is not verified.');
      }

      // If a nonce was provided during authorization, verify it matches the token claim
      if (expectedNonce && payload.nonce && payload.nonce !== expectedNonce) {
        throw new InvalidIdTokenError('Nonce mismatch in ID token. Possible replay attack.');
      }

      return {
        sub: payload.sub,
        email: payload.email.toLowerCase().trim(),
        email_verified: payload.email_verified,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
        locale: payload.locale,
        nonce: payload.nonce,
      };
    } catch (err: unknown) {
      if (err instanceof InvalidIdTokenError) throw err;
      const message = err instanceof Error ? err.message : 'Invalid ID token';
      console.error('[GoogleStrategy] ID Token verification failed:', message);
      throw new InvalidIdTokenError(`Google ID token verification failed: ${message}`);
    }
  }
}

export const googleStrategy = new GoogleOAuthStrategy();
