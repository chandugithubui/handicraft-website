/**
 * server/src/modules/auth/dto/google-auth.dto.ts
 *
 * Data Transfer Objects (DTOs) and validation schemas for Google OAuth endpoints.
 */

export interface GoogleAuthQueryDto {
  returnTo?: string;
}

export interface GoogleCallbackQueryDto {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

export interface RefreshTokenDto {
  refreshToken?: string;
}

export const validateCallbackQuery = (query: Record<string, unknown>): GoogleCallbackQueryDto => {
  const code = typeof query.code === 'string' ? query.code.trim() : undefined;
  const state = typeof query.state === 'string' ? query.state.trim() : undefined;
  const error = typeof query.error === 'string' ? query.error.trim() : undefined;
  const error_description =
    typeof query.error_description === 'string' ? query.error_description.trim() : undefined;

  return { code, state, error, error_description };
};

export const validateReturnTo = (returnTo?: unknown): string | undefined => {
  if (typeof returnTo === 'string' && returnTo.trim().length > 0) {
    return returnTo.trim();
  }
  return undefined;
};
