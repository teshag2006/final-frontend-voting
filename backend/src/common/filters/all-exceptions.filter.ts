import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
  HttpException,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: Record<string, unknown> = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();

      if (typeof responseBody === 'string') {
        message = responseBody;
      } else if (typeof responseBody === 'object' && responseBody !== null) {
        const body = responseBody as Record<string, unknown>;
        const responseMessage = body.message;
        if (Array.isArray(responseMessage)) {
          message = responseMessage.join(', ');
        } else if (typeof responseMessage === 'string') {
          message = responseMessage;
        } else {
          message = exception.message;
        }
        error = {
          name: exception.name,
          ...body,
        };
      } else {
        message = exception.message;
      }
    }

    // TypeORM/express exceptions
    if (!(exception instanceof HttpException) && exception instanceof Error) {
      message = exception.message;
      
      // Handle common error types
      const errorMessage = exception.message.toLowerCase();
      
      if (errorMessage.includes('unique constraint') || errorMessage.includes('duplicate')) {
        status = HttpStatus.CONFLICT;
        message = 'Unique constraint failed';
      } else if (errorMessage.includes('not found')) {
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
      } else if (errorMessage.includes('foreign key')) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Foreign key constraint failed';
      } else if (errorMessage.includes('validation')) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Validation error';
      }
      
      error = { name: exception.name };
    }

    const errorResponse = {
      statusCode: status,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    const logMessage = `${request.method} ${request.url} - ${status}: ${message}`;
    if (status >= 500) {
      this.logger.error(
        logMessage,
        exception instanceof Error ? exception.stack : '',
      );
    } else {
      this.logger.warn(logMessage);
    }

    response.status(status).send(errorResponse);
  }
}
