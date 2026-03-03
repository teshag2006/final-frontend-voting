import { ForbiddenException, BadRequestException } from '@nestjs/common';

/**
 * Extract tenant_id from an authenticated JWT user payload.
 * Returns undefined for anonymous users or users without a tenant.
 */
export function extractAuthenticatedTenantId(req: any): number | undefined {
  const candidate = req?.user?.tenant_id ?? req?.user?.tenantId;
  if (typeof candidate !== 'number' || !Number.isFinite(candidate) || candidate <= 0) {
    return undefined;
  }
  return Math.trunc(candidate);
}

/**
 * Parse an optional tenantId query parameter string into a positive integer.
 * Returns undefined when absent/empty, throws BadRequestException if malformed.
 */
export function parseOptionalTenantId(value?: string): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestException('tenantId must be a positive integer');
  }
  return parsed;
}

/**
 * Resolve the effective tenant scope from both JWT and query parameter.
 * If both provide a tenantId, they must match — otherwise throws ForbiddenException.
 */
export function resolveTenantScope(req: any, tenantIdQuery?: string): number | undefined {
  const parsedQueryTenantId = parseOptionalTenantId(tenantIdQuery);
  const authTenantId = extractAuthenticatedTenantId(req);

  if (
    authTenantId !== undefined &&
    parsedQueryTenantId !== undefined &&
    authTenantId !== parsedQueryTenantId
  ) {
    throw new ForbiddenException('Authenticated tenant scope does not match tenantId query parameter');
  }

  return authTenantId ?? parsedQueryTenantId;
}
