export class AppException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: string,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'AppException';
    Object.setPrototypeOf(this, AppException.prototype);
  }
}

export class NotFoundException extends AppException {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, 404, code);
    this.name = 'NotFoundException';
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
}

export class UnauthorizedException extends AppException {
  constructor(message = 'Not authenticated', code = 'UNAUTHORIZED') {
    super(message, 401, code);
    this.name = 'UnauthorizedException';
    Object.setPrototypeOf(this, UnauthorizedException.prototype);
  }
}

export class ValidationException extends AppException {
  constructor(message = 'Invalid request', code = 'VALIDATION_FAILED') {
    super(message, 400, code);
    this.name = 'ValidationException';
    Object.setPrototypeOf(this, ValidationException.prototype);
  }
}
