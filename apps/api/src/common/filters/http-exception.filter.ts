import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';

import { AppException } from '../exceptions/app.exception';

export const ERROR_RESPONSE_MESSAGE_500 = 'Internal server error';

export interface ErrorResponseBody {
  success: false;
  message: string;
  code?: string;
  data?: unknown;
}

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const { statusCode, body } = this.normalize(exception);

    this.logError(exception, statusCode, request);

    response.status(statusCode).json(body);
  }

  private normalize(exception: unknown): {
    statusCode: number;
    body: ErrorResponseBody;
  } {
    if (exception instanceof AppException) {
      return {
        statusCode: exception.statusCode,
        body: {
          success: false,
          message: exception.message,
          code: exception.code,
          data: exception.data ?? null
        }
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const raw = exception.getResponse();
      const message =
        typeof raw === 'string'
          ? raw
          : ((raw as { message?: string }).message ?? 'Request failed');

      return {
        statusCode: status,
        body: { success: false, message, data: null }
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      body: { success: false, message: ERROR_RESPONSE_MESSAGE_500, data: null }
    };
  }

  private logError(
    exception: unknown,
    statusCode: number,
    request: { method: string; url: string }
  ) {
    const detail =
      exception instanceof Error ? exception.message : String(exception);
    const stack = exception instanceof Error ? exception.stack : undefined;
    const line = `${request.method} ${request.url} ${statusCode} — ${detail}`;

    if (statusCode >= 500) {
      this.logger.error(line, stack);
    } else {
      this.logger.warn(line);
    }
  }
}
