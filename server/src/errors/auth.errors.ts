/**
 * server/src/errors/auth.errors.ts
 *
 * Centralized, strongly-typed error hierarchy for authentication operations.
 * Operational errors carry HTTP status codes and machine-readable error codes.
 */

export abstract class AuthError extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly errorCode: string;
  public readonly isOperational = true;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidStateError extends AuthError {
  public readonly statusCode = 400;
  public readonly errorCode = 'INVALID_OAUTH_STATE';

  constructor(message = 'Invalid or expired OAuth state parameter. Possible CSRF attack detected.') {
    super(message);
  }
}

export class TokenExchangeError extends AuthError {
  public readonly statusCode = 502;
  public readonly errorCode = 'TOKEN_EXCHANGE_FAILED';

  constructor(message = 'Failed to exchange authorization code for Google tokens.') {
    super(message);
  }
}

export class InvalidIdTokenError extends AuthError {
  public readonly statusCode = 401;
  public readonly errorCode = 'INVALID_ID_TOKEN';

  constructor(message = 'Google ID token signature or claims could not be verified.') {
    super(message);
  }
}

export class UserConflictError extends AuthError {
  public readonly statusCode = 409;
  public readonly errorCode = 'USER_CONFLICT';

  constructor(message = 'User account conflict encountered during Google authentication.') {
    super(message);
  }
}

export class UnauthorizedError extends AuthError {
  public readonly statusCode = 401;
  public readonly errorCode = 'UNAUTHORIZED';

  constructor(message = 'Authentication required. Missing, invalid, or expired access token.') {
    super(message);
  }
}

export class ForbiddenError extends AuthError {
  public readonly statusCode = 403;
  public readonly errorCode = 'FORBIDDEN';

  constructor(message = 'Access denied. You do not have permission to access this resource.') {
    super(message);
  }
}

export class InvalidRefreshTokenError extends AuthError {
  public readonly statusCode = 401;
  public readonly errorCode = 'INVALID_REFRESH_TOKEN';

  constructor(message = 'Refresh token is invalid, expired, or revoked.') {
    super(message);
  }
}

export class TokenReuseDetectedError extends AuthError {
  public readonly statusCode = 401;
  public readonly errorCode = 'TOKEN_REUSE_DETECTED';

  constructor(message = 'Refresh token reuse detected. All sessions in this token family have been invalidated.') {
    super(message);
  }
}

export class RedirectUriNotAllowedError extends AuthError {
  public readonly statusCode = 400;
  public readonly errorCode = 'REDIRECT_URI_NOT_ALLOWED';

  constructor(message = 'The specified post-login redirect URI is not in the configured allowlist.') {
    super(message);
  }
}
