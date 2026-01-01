/**
 * Base application error with HTTP status support.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly details?: string;

  /**
   * @param message Human-readable error message.
   * @param statusCode HTTP status code.
   * @param details Additional details for logging.
   */
  constructor(message: string, statusCode: number, details?: string) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Error thrown for invalid user input.
 */
export class ValidationError extends AppError {
  /**
   * @param message Validation error message.
   * @param details Optional details for logging.
   */
  constructor(message: string, details?: string) {
    super(message, 400, details);
  }
}

/**
 * Error thrown when a resource already exists.
 */
export class ConflictError extends AppError {
  /**
   * @param message Conflict error message.
   * @param details Optional details.
   */
  constructor(message: string, details?: string) {
    super(message, 409, details);
  }
}

/**
 * Error thrown when an unexpected failure happens.
 */
export class InternalError extends AppError {
  /**
   * @param message Error message.
   * @param details Optional details.
   */
  constructor(message: string, details?: string) {
    super(message, 500, details);
  }
}
