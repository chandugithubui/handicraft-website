/**
 * server/src/errors/app.errors.ts
 *
 * General-purpose, strongly-typed application error hierarchy.
 * Extends the operational error pattern established in auth.errors.ts.
 */

export abstract class AppError extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly errorCode: string;
  public readonly isOperational = true;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  public readonly statusCode = 404;
  public readonly errorCode = 'NOT_FOUND';

  constructor(message = 'The requested resource was not found.') {
    super(message);
  }
}

export class ValidationError extends AppError {
  public readonly statusCode = 400;
  public readonly errorCode = 'VALIDATION_ERROR';

  constructor(message = 'Invalid request data.') {
    super(message);
  }
}

export class ConflictError extends AppError {
  public readonly statusCode = 409;
  public readonly errorCode = 'CONFLICT';

  constructor(message = 'A resource with the same identifier already exists.') {
    super(message);
  }
}

export class ForbiddenOperationError extends AppError {
  public readonly statusCode = 403;
  public readonly errorCode = 'FORBIDDEN_OPERATION';

  constructor(message = 'This operation is not permitted.') {
    super(message);
  }
}

export class InternalError extends AppError {
  public readonly statusCode = 500;
  public readonly errorCode = 'INTERNAL_ERROR';

  constructor(message = 'An unexpected internal error occurred.') {
    super(message);
  }
}
