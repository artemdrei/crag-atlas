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
