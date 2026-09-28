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

/** Role values recognised by the platform. */
export type UserRole = 'user' | 'artisan' | 'admin' | 'super_admin';

/**
 * Shape of the decoded JWT access-token payload.
 * `userId` is the canonical field; `id` / `_id` are accepted as
 * legacy / alternative encodings so that all route handlers compile
 * without type errors regardless of which key a specific token issuer
 * chose to embed.
 */
export interface JwtAccessPayload {
  /** Canonical user identifier – always present. */
  userId: string;
  /** Alias used by some older token issuers (optional). */
  id?: string;
  /** Mongoose _id alias occasionally embedded in tokens (optional). */
  _id?: string;
  email: string;
  role: UserRole | string; // string fallback for custom DB-defined roles
  /**
   * Resolved permissions from the Role document – embedded at sign-in time.
   * The requirePermission middleware reads this without a DB round-trip.
   */
  permissions: string[];
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
