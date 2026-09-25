/**
 * server/src/modules/auth/types/auth.types.ts
 *
 * Core type declarations for the OAuth 2.0 authentication module.
 */

export interface GoogleUserPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  nonce?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds
}

export interface JwtAccessPayload {
  userId: string;
  email: string;
  role: string;
  type?: 'access';
}

export interface JwtRefreshPayload {
  userId: string;
  tokenId: string;
  family: string;
  type?: 'refresh';
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  authProviders: string[];
}

export interface OAuthStateData {
  state: string;
  nonce: string;
  returnTo?: string;
  createdAt: number;
}

export interface AuthSuccessResult {
  user: PublicUser;
  tokens: TokenPair;
}
