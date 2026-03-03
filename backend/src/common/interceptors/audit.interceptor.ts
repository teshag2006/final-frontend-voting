import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '@/audit/audit.service';
import { AuditAction } from '@/entities/audit-log.entity';

/**
 * Automatically logs admin mutation requests (POST, PATCH, PUT, DELETE)
 * to the audit_logs table. Runs AFTER the request succeeds.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method: string = request.method?.toUpperCase();

    // Only audit mutations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    // Only audit admin routes
    const url: string = request.url || '';
    if (!url.includes('/admin')) {
      return next.handle();
    }

    const userId = request.user?.id;
    const ipAddress = request.ip || request.headers?.['x-forwarded-for'];
    const userAgent = request.headers?.['user-agent'];
    const action = this.methodToAction(method);
    const { resourceType, resourceId } = this.extractResource(url);

    return next.handle().pipe(
      tap(() => {
        // Fire-and-forget: don't await so it never slows down the response
        this.auditService.log({
          userId,
          action,
          resourceType,
          resourceId,
          changes: method !== 'DELETE' ? this.sanitizeBody(request.body) : undefined,
          description: `${method} ${url}`,
          ipAddress,
          userAgent,
        });
      }),
    );
  }

  private methodToAction(method: string): AuditAction {
    switch (method) {
      case 'POST':
        return AuditAction.CREATE;
      case 'PUT':
      case 'PATCH':
        return AuditAction.UPDATE;
      case 'DELETE':
        return AuditAction.DELETE;
      default:
        return AuditAction.UPDATE;
    }
  }

  private extractResource(url: string): { resourceType?: string; resourceId?: number } {
    // Parse patterns like /admin/users/42, /admin/fraud/cases/7/resolve
    const segments = url.split('/').filter(Boolean);
    const adminIdx = segments.indexOf('admin');
    if (adminIdx === -1 || adminIdx + 1 >= segments.length) {
      return {};
    }
    const resourceType = segments[adminIdx + 1]; // e.g. "users", "fraud", "system"
    // Find first numeric segment after resourceType
    for (let i = adminIdx + 2; i < segments.length; i++) {
      const parsed = parseInt(segments[i], 10);
      if (!isNaN(parsed) && parsed > 0) {
        return { resourceType, resourceId: parsed };
      }
    }
    return { resourceType };
  }

  private sanitizeBody(body: any): Record<string, any> | undefined {
    if (!body || typeof body !== 'object') return undefined;
    const sanitized = { ...body };
    // Never log passwords or tokens
    const sensitiveKeys = ['password', 'password_hash', 'token', 'refresh_token', 'secret', 'currentPassword', 'newPassword'];
    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    }
    return sanitized;
  }
}
