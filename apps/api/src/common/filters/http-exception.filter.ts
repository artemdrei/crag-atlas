import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';

import { AppException } from '../exceptions/app.exception';
import { DatabaseException } from '../exceptions/database.exception';

const ERROR_RESPONSE_MESSAGE_500 = 'Internal server error';

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
      // A 5xx is our fault and its text is written for the log, not for the
      // reader — a message only leaves the server with a status that says the
      // caller can do something about it.
      const isServerFault = exception.statusCode >= 500;

      return {
        statusCode: exception.statusCode,
        body: {
          success: false,
          message: isServerFault
            ? ERROR_RESPONSE_MESSAGE_500
            : exception.message,
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
    // The database's own words never reach the client, so this is the only
    // place they are readable at all.
    const cause =
      exception instanceof DatabaseException && exception.dbError
        ? ` — database: ${JSON.stringify(exception.dbError)}`
        : '';
    const stack = exception instanceof Error ? exception.stack : undefined;
    const line = `${request.method} ${request.url} ${statusCode} — ${detail}${cause}`;

    if (statusCode >= 500) {
      this.logger.error(line, stack);
    } else {
      this.logger.warn(line);
    }
  }
}
