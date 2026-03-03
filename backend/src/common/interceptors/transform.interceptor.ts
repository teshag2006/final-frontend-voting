import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Wraps all responses in a standard envelope:
 * { statusCode, data, timestamp }
 *
 * If the controller already returns an object with `statusCode`,
 * it passes through unchanged to avoid double-wrapping.
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Controller already returned the standard envelope — pass through
        if (data && typeof data === 'object' && 'statusCode' in data) {
          return data;
        }

        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode ?? 200;

        return {
          statusCode,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
