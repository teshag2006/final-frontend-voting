import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/entities/user.entity';
import { SystemService } from './system.service';
import {
  AnalyticsFullResponseDto,
  AnalyticsViewResponseDto,
  AnalyticsViewsResponseDto,
} from './dto/analytics-response.dto';

/**
 * System Controller
 * Handles system monitoring and settings
 */
@ApiTags('System')
@ApiBearerAuth()
@Controller('admin/system')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  /**
   * Get system overview
   * GET /api/v1/admin/system/overview
   * Access: Admin
   */
  @Get('overview')
  async getSystemOverview() {
    const overview = await this.systemService.getSystemOverview();
    return {
      statusCode: 200,
      message: 'System overview retrieved',
      data: overview,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get system health
   * GET /api/v1/admin/system/health
   * Access: Admin
   */
  @Get('health')
  async getSystemHealth() {
    const health = await this.systemService.getSystemHealth();
    return {
      statusCode: 200,
      message: 'System health retrieved',
      data: health,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get system logs
   * GET /api/v1/admin/system/logs
   * Access: Admin
   */
  @Get('logs')
  async getSystemLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('level') level?: string,
  ) {
    const result = await this.systemService.getSystemLogs(page, limit, level);
    return {
      statusCode: 200,
      message: 'System logs retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get API monitor data
   * GET /api/v1/admin/system/api-monitor
   * Access: Admin
   */
  @Get('api-monitor')
  async getApiMonitor(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    const result = await this.systemService.getApiUsage(page, limit);
    return {
      statusCode: 200,
      message: 'API usage data retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get webhook monitor data
   * GET /api/v1/admin/system/webhooks
   * Access: Admin
   */
  @Get('webhooks')
  async getWebhookMonitor(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    const result = await this.systemService.getWebhookData(page, limit);
    return {
      statusCode: 200,
      message: 'Webhook data retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get app settings
   * GET /api/v1/admin/system/settings
   * Access: Admin
   */
  @Get('settings')
  async getSettings() {
    const settings = await this.systemService.getSettings();
    return {
      statusCode: 200,
      message: 'Settings retrieved',
      data: settings,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Update app settings
   * PATCH /api/v1/admin/system/settings
   * Access: Admin
   */
  @Patch('settings')
  async updateSettings(
    @Body() settings: Record<string, any>,
    @Request() req: any,
  ) {
    const updated = await this.systemService.updateSettings(settings, req.user.id);
    return {
      statusCode: 200,
      message: 'Settings updated',
      data: updated,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get feature flags
   * GET /api/v1/admin/system/feature-flags
   * Access: Admin
   */
  @Get('feature-flags')
  async getFeatureFlags() {
    const flags = await this.systemService.getFeatureFlags();
    return {
      statusCode: 200,
      message: 'Feature flags retrieved',
      data: flags,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Toggle feature flag
   * PATCH /api/v1/admin/system/feature-flags/:key
   * Access: Admin
   */
  @Patch('feature-flags/:key')
  async toggleFeatureFlag(
    @Param('key') key: string,
    @Body() body: { enabled: boolean },
  ) {
    const flag = await this.systemService.toggleFeatureFlag(key, body.enabled);
    return {
      statusCode: 200,
      message: 'Feature flag updated',
      data: flag,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get job queue status
   * GET /api/v1/admin/system/queue
   * Access: Admin
   */
  @Get('queue')
  async getQueueStatus() {
    return {
      statusCode: 200,
      message: 'Queue status retrieved',
      data: {
        status: 'idle',
        pendingJobs: 0,
        processingJobs: 0,
        failedJobs: 0,
        completedJobs: 0,
        note: 'Bull/BullMQ integration pending',
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get cache status
   * GET /api/v1/admin/system/cache
   * Access: Admin
   */
  @Get('cache')
  async getCacheStatus() {
    return {
      statusCode: 200,
      message: 'Cache status retrieved',
      data: {
        type: 'in-memory',
        status: 'active',
        note: 'Redis not yet configured — leaderboard uses in-memory Map cache (5-min TTL)',
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get security tokens monitor data
   * GET /api/v1/admin/system/security-tokens
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get security tokens monitor data' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'userId', required: false, example: 1 })
  @ApiQuery({ name: 'type', required: false, example: 'refresh' })
  @ApiQuery({ name: 'activeOnly', required: false, example: true })
  @ApiResponse({ status: 200, description: 'Security token data retrieved successfully' })
  @Get('security-tokens')
  async getSecurityTokens(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('userId') userId?: number,
    @Query('type') type?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const result = await this.systemService.getSecurityTokens(page, limit, {
      userId: userId ? Number(userId) : undefined,
      type: type?.trim() || undefined,
      activeOnly: String(activeOnly).toLowerCase() === 'true',
    });
    return {
      statusCode: 200,
      message: 'Security token data retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get OTP verification logs
   * GET /api/v1/admin/system/otp-verifications
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get OTP verification logs' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'userId', required: false, example: 1 })
  @ApiQuery({ name: 'used', required: false, example: true })
  @ApiQuery({ name: 'otpType', required: false, example: 'email' })
  @ApiResponse({ status: 200, description: 'OTP verification logs retrieved successfully' })
  @Get('otp-verifications')
  async getOtpVerifications(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('userId') userId?: number,
    @Query('used') used?: string,
    @Query('otpType') otpType?: string,
  ) {
    const normalizedUsed =
      typeof used === 'string' ? (used.toLowerCase() === 'true' ? true : used.toLowerCase() === 'false' ? false : undefined) : undefined;
    const result = await this.systemService.getOtpVerificationLogs(page, limit, {
      userId: userId ? Number(userId) : undefined,
      used: normalizedUsed,
      otpType: otpType?.trim() || undefined,
    });
    return {
      statusCode: 200,
      message: 'OTP verification logs retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get webhook security logs
   * GET /api/v1/admin/system/webhook-security
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get webhook signature/security logs' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'provider', required: false, example: 'stripe' })
  @ApiResponse({ status: 200, description: 'Webhook security logs retrieved successfully' })
  @Get('webhook-security')
  async getWebhookSecurity(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('provider') provider?: string,
  ) {
    const result = await this.systemService.getWebhookSecurityData(
      page,
      limit,
      provider?.trim() || undefined,
    );
    return {
      statusCode: 200,
      message: 'Webhook security data retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get webhook audit trail
   * GET /api/v1/admin/system/webhook-audit
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get webhook audit trail records' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'provider', required: false, example: 'stripe' })
  @ApiQuery({ name: 'status', required: false, example: 'success' })
  @ApiResponse({ status: 200, description: 'Webhook audit trail retrieved successfully' })
  @Get('webhook-audit')
  async getWebhookAudit(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('provider') provider?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.systemService.getWebhookAuditData(
      page,
      limit,
      provider?.trim() || undefined,
      status?.trim() || undefined,
    );
    return {
      statusCode: 200,
      message: 'Webhook audit trail retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get webhook rate-limit monitor
   * GET /api/v1/admin/system/webhook-rate-limit
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get webhook rate-limit monitor data' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'provider', required: false, example: 'stripe' })
  @ApiResponse({ status: 200, description: 'Webhook rate-limit data retrieved successfully' })
  @Get('webhook-rate-limit')
  async getWebhookRateLimit(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('provider') provider?: string,
  ) {
    const result = await this.systemService.getWebhookRateLimitData(
      page,
      limit,
      provider?.trim() || undefined,
    );
    return {
      statusCode: 200,
      message: 'Webhook rate-limit data retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get payment vote reconciliation logs
   * GET /api/v1/admin/system/payment-reconciliation
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get payment-vote reconciliation records' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'reconciled', required: false, example: true })
  @ApiResponse({ status: 200, description: 'Payment-vote reconciliation data retrieved successfully' })
  @Get('payment-reconciliation')
  async getPaymentReconciliation(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('reconciled') reconciled?: string,
  ) {
    const normalizedReconciled =
      typeof reconciled === 'string'
        ? reconciled.toLowerCase() === 'true'
          ? true
          : reconciled.toLowerCase() === 'false'
            ? false
            : undefined
        : undefined;

    const result = await this.systemService.getPaymentVoteReconciliation(
      page,
      limit,
      normalizedReconciled,
    );
    return {
      statusCode: 200,
      message: 'Payment-vote reconciliation data retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get RSA key versions inventory
   * GET /api/v1/admin/system/rsa-keys
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get RSA key versions inventory (public key metadata only)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'activeOnly', required: false, example: true })
  @ApiResponse({ status: 200, description: 'RSA key inventory retrieved successfully' })
  @Get('rsa-keys')
  async getRsaKeys(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const result = await this.systemService.getRsaKeyVersions(
      page,
      limit,
      String(activeOnly).toLowerCase() === 'true',
    );
    return {
      statusCode: 200,
      message: 'RSA key inventory retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get payment limits config
   * GET /api/v1/admin/system/payment-limits
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get payment limits configuration data' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'eventId', required: false, example: 1 })
  @ApiQuery({ name: 'categoryId', required: false, example: 2 })
  @ApiResponse({ status: 200, description: 'Payment limits data retrieved successfully' })
  @Get('payment-limits')
  async getPaymentLimits(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('eventId') eventId?: number,
    @Query('categoryId') categoryId?: number,
  ) {
    const result = await this.systemService.getPaymentLimits(
      page,
      limit,
      eventId ? Number(eventId) : undefined,
      categoryId ? Number(categoryId) : undefined,
    );
    return {
      statusCode: 200,
      message: 'Payment limits data retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get canonical system settings table data
   * GET /api/v1/admin/system/system-settings
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get canonical system settings data' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'includeSensitive', required: false, example: false })
  @ApiResponse({ status: 200, description: 'System settings data retrieved successfully' })
  @Get('system-settings')
  async getCanonicalSystemSettings(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('includeSensitive') includeSensitive?: string,
  ) {
    const result = await this.systemService.getCanonicalSystemSettings(
      page,
      limit,
      String(includeSensitive).toLowerCase() === 'true',
    );
    return {
      statusCode: 200,
      message: 'System settings data retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get system events stream
   * GET /api/v1/admin/system/system-events
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get system events stream' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'severity', required: false, example: 'warning' })
  @ApiQuery({ name: 'source', required: false, example: 'payments' })
  @ApiResponse({ status: 200, description: 'System events data retrieved successfully' })
  @Get('system-events')
  async getSystemEvents(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('severity') severity?: string,
    @Query('source') source?: string,
  ) {
    const result = await this.systemService.getSystemEventsData(
      page,
      limit,
      severity?.trim() || undefined,
      source?.trim() || undefined,
    );
    return {
      statusCode: 200,
      message: 'System events data retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get monitoring metrics stream
   * GET /api/v1/admin/system/monitoring-metrics
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get monitoring metrics stream' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'metricName', required: false, example: 'db_latency_ms' })
  @ApiQuery({ name: 'source', required: false, example: 'database' })
  @ApiResponse({ status: 200, description: 'Monitoring metrics data retrieved successfully' })
  @Get('monitoring-metrics')
  async getMonitoringMetrics(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('metricName') metricName?: string,
    @Query('source') source?: string,
  ) {
    const result = await this.systemService.getMonitoringMetricsData(
      page,
      limit,
      metricName?.trim() || undefined,
      source?.trim() || undefined,
    );
    return {
      statusCode: 200,
      message: 'Monitoring metrics data retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get performance metrics stream
   * GET /api/v1/admin/system/performance-metrics
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get performance metrics stream' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'metricName', required: false, example: 'cpu_usage' })
  @ApiQuery({ name: 'processName', required: false, example: 'payments-worker' })
  @ApiResponse({ status: 200, description: 'Performance metrics data retrieved successfully' })
  @Get('performance-metrics')
  async getPerformanceMetrics(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('metricName') metricName?: string,
    @Query('processName') processName?: string,
  ) {
    const result = await this.systemService.getPerformanceMetricsData(
      page,
      limit,
      metricName?.trim() || undefined,
      processName?.trim() || undefined,
    );
    return {
      statusCode: 200,
      message: 'Performance metrics data retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get rate-limit logs
   * GET /api/v1/admin/system/rate-limit-logs
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get rate-limit logs' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'endpoint', required: false, example: '/api/v1/votes' })
  @ApiQuery({ name: 'userId', required: false, example: 12 })
  @ApiResponse({ status: 200, description: 'Rate-limit logs retrieved successfully' })
  @Get('rate-limit-logs')
  async getRateLimitLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('endpoint') endpoint?: string,
    @Query('userId') userId?: number,
  ) {
    const result = await this.systemService.getRateLimitLogsData(
      page,
      limit,
      endpoint?.trim() || undefined,
      userId ? Number(userId) : undefined,
    );
    return {
      statusCode: 200,
      message: 'Rate-limit logs retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Record DB health check sample
   * POST /api/v1/admin/system/db-health-checks
   * Access: Admin
   */
  @ApiOperation({ summary: 'Record database health check sample' })
  @ApiResponse({ status: 201, description: 'Database health check recorded successfully' })
  @Post('db-health-checks')
  async recordDbHealthCheck(
    @Body()
    body: {
      checkType: string;
      status: 'healthy' | 'warning' | 'critical';
      responseTime?: number;
      errorMessage?: string | null;
    },
  ) {
    const result = await this.systemService.recordDbHealthCheck({
      checkType: body.checkType,
      status: body.status,
      responseTime: body.responseTime,
      errorMessage: body.errorMessage ?? null,
    });
    return {
      statusCode: 201,
      message: result.inserted
        ? 'Database health check recorded'
        : 'db_health_checks table is not available in this environment',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get geo analysis cache data
   * GET /api/v1/admin/system/geo-analysis-cache
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get geo analysis cache data' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'eventId', required: false, example: 1 })
  @ApiQuery({ name: 'country', required: false, example: 'Ethiopia' })
  @ApiResponse({ status: 200, description: 'Geo analysis cache data retrieved successfully' })
  @Get('geo-analysis-cache')
  async getGeoAnalysisCache(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('eventId') eventId?: number,
    @Query('country') country?: string,
  ) {
    const result = await this.systemService.getGeoAnalysisCacheData(
      page,
      limit,
      eventId ? Number(eventId) : undefined,
      country?.trim() || undefined,
    );
    return {
      statusCode: 200,
      message: 'Geo analysis cache data retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get geo risk profiles
   * GET /api/v1/admin/system/geo-risk-profiles
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get geo risk profiles' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'countryCode', required: false, example: 'ET' })
  @ApiResponse({ status: 200, description: 'Geo risk profiles retrieved successfully' })
  @Get('geo-risk-profiles')
  async getGeoRiskProfiles(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('countryCode') countryCode?: string,
  ) {
    const result = await this.systemService.getGeoRiskProfilesData(
      page,
      limit,
      countryCode?.trim() || undefined,
    );
    return {
      statusCode: 200,
      message: 'Geo risk profiles retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get verified votes cache
   * GET /api/v1/admin/system/verified-votes-cache
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get verified votes cache rows' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'eventId', required: false, example: 1 })
  @ApiQuery({ name: 'categoryId', required: false, example: 2 })
  @ApiQuery({ name: 'cacheValid', required: false, example: true })
  @ApiResponse({ status: 200, description: 'Verified votes cache data retrieved successfully' })
  @Get('verified-votes-cache')
  async getVerifiedVotesCache(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('eventId') eventId?: number,
    @Query('categoryId') categoryId?: number,
    @Query('cacheValid') cacheValid?: string,
  ) {
    const normalizedCacheValid =
      typeof cacheValid === 'string'
        ? cacheValid.toLowerCase() === 'true'
          ? true
          : cacheValid.toLowerCase() === 'false'
            ? false
            : undefined
        : undefined;

    const result = await this.systemService.getVerifiedVotesCacheData(
      page,
      limit,
      eventId ? Number(eventId) : undefined,
      categoryId ? Number(categoryId) : undefined,
      normalizedCacheValid,
    );
    return {
      statusCode: 200,
      message: 'Verified votes cache data retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get vote behavior profiles
   * GET /api/v1/admin/system/vote-behavior-profiles
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get vote behavior profiles' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'deviceId', required: false, example: 15 })
  @ApiQuery({ name: 'minRiskScore', required: false, example: 70 })
  @ApiResponse({ status: 200, description: 'Vote behavior profiles retrieved successfully' })
  @Get('vote-behavior-profiles')
  async getVoteBehaviorProfiles(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('deviceId') deviceId?: number,
    @Query('minRiskScore') minRiskScore?: number,
  ) {
    const normalizedMinRiskScore =
      minRiskScore !== undefined && !Number.isNaN(Number(minRiskScore))
        ? Number(minRiskScore)
        : undefined;

    const result = await this.systemService.getVoteBehaviorProfilesData(
      page,
      limit,
      deviceId ? Number(deviceId) : undefined,
      normalizedMinRiskScore,
    );
    return {
      statusCode: 200,
      message: 'Vote behavior profiles retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get vote snapshots
   * GET /api/v1/admin/system/vote-snapshots
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get vote snapshots' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'eventId', required: false, example: 1 })
  @ApiQuery({ name: 'categoryId', required: false, example: 2 })
  @ApiQuery({ name: 'anchored', required: false, example: true })
  @ApiResponse({ status: 200, description: 'Vote snapshots retrieved successfully' })
  @Get('vote-snapshots')
  async getVoteSnapshots(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('eventId') eventId?: number,
    @Query('categoryId') categoryId?: number,
    @Query('anchored') anchored?: string,
  ) {
    const normalizedAnchored =
      typeof anchored === 'string'
        ? anchored.toLowerCase() === 'true'
          ? true
          : anchored.toLowerCase() === 'false'
            ? false
            : undefined
        : undefined;

    const result = await this.systemService.getVoteSnapshotsData(
      page,
      limit,
      eventId ? Number(eventId) : undefined,
      categoryId ? Number(categoryId) : undefined,
      normalizedAnchored,
    );
    return {
      statusCode: 200,
      message: 'Vote snapshots retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get vote merkle hashes
   * GET /api/v1/admin/system/vote-merkle-hashes
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get vote merkle hashes' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'batchId', required: false, example: 10 })
  @ApiQuery({ name: 'voteId', required: false, example: 1001 })
  @ApiResponse({ status: 200, description: 'Vote merkle hashes retrieved successfully' })
  @Get('vote-merkle-hashes')
  async getVoteMerkleHashes(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('batchId') batchId?: number,
    @Query('voteId') voteId?: number,
  ) {
    const result = await this.systemService.getVoteMerkleHashesData(
      page,
      limit,
      batchId ? Number(batchId) : undefined,
      voteId ? Number(voteId) : undefined,
    );
    return {
      statusCode: 200,
      message: 'Vote merkle hashes retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get geographic velocity logs
   * GET /api/v1/admin/system/geographic-velocity-logs
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get geographic velocity logs' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'deviceId', required: false, example: 15 })
  @ApiQuery({ name: 'impossibleOnly', required: false, example: true })
  @ApiQuery({ name: 'minSpeedKmh', required: false, example: 700 })
  @ApiResponse({ status: 200, description: 'Geographic velocity logs retrieved successfully' })
  @Get('geographic-velocity-logs')
  async getGeographicVelocityLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('deviceId') deviceId?: number,
    @Query('impossibleOnly') impossibleOnly?: string,
    @Query('minSpeedKmh') minSpeedKmh?: number,
  ) {
    const normalizedImpossibleOnly =
      typeof impossibleOnly === 'string'
        ? impossibleOnly.toLowerCase() === 'true'
          ? true
          : impossibleOnly.toLowerCase() === 'false'
            ? false
            : undefined
        : undefined;
    const normalizedMinSpeedKmh =
      minSpeedKmh !== undefined && !Number.isNaN(Number(minSpeedKmh))
        ? Number(minSpeedKmh)
        : undefined;

    const result = await this.systemService.getGeographicVelocityLogsData(
      page,
      limit,
      deviceId ? Number(deviceId) : undefined,
      normalizedImpossibleOnly,
      normalizedMinSpeedKmh,
    );
    return {
      statusCode: 200,
      message: 'Geographic velocity logs retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get timezone anomalies
   * GET /api/v1/admin/system/timezone-anomalies
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get timezone anomalies' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'deviceId', required: false, example: 15 })
  @ApiQuery({ name: 'flaggedOnly', required: false, example: true })
  @ApiQuery({ name: 'minAnomalyScore', required: false, example: 70 })
  @ApiResponse({ status: 200, description: 'Timezone anomalies retrieved successfully' })
  @Get('timezone-anomalies')
  async getTimezoneAnomalies(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('deviceId') deviceId?: number,
    @Query('flaggedOnly') flaggedOnly?: string,
    @Query('minAnomalyScore') minAnomalyScore?: number,
  ) {
    const normalizedFlaggedOnly =
      typeof flaggedOnly === 'string'
        ? flaggedOnly.toLowerCase() === 'true'
          ? true
          : flaggedOnly.toLowerCase() === 'false'
            ? false
            : undefined
        : undefined;
    const normalizedMinAnomalyScore =
      minAnomalyScore !== undefined && !Number.isNaN(Number(minAnomalyScore))
        ? Number(minAnomalyScore)
        : undefined;

    const result = await this.systemService.getTimezoneAnomaliesData(
      page,
      limit,
      deviceId ? Number(deviceId) : undefined,
      normalizedFlaggedOnly,
      normalizedMinAnomalyScore,
    );
    return {
      statusCode: 200,
      message: 'Timezone anomalies retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get trust score history
   * GET /api/v1/admin/system/trust-score-history
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get trust score history' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'deviceId', required: false, example: 15 })
  @ApiQuery({ name: 'reason', required: false, example: 'velocity spike' })
  @ApiResponse({ status: 200, description: 'Trust score history retrieved successfully' })
  @Get('trust-score-history')
  async getTrustScoreHistory(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('deviceId') deviceId?: number,
    @Query('reason') reason?: string,
  ) {
    const result = await this.systemService.getTrustScoreHistoryData(
      page,
      limit,
      deviceId ? Number(deviceId) : undefined,
      reason?.trim() || undefined,
    );
    return {
      statusCode: 200,
      message: 'Trust score history retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get fraud detection cycles
   * GET /api/v1/admin/system/fraud-detection-cycles
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get fraud detection cycles' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'eventId', required: false, example: 1 })
  @ApiQuery({ name: 'cycleStatus', required: false, example: 'completed' })
  @ApiResponse({ status: 200, description: 'Fraud detection cycles retrieved successfully' })
  @Get('fraud-detection-cycles')
  async getFraudDetectionCycles(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('eventId') eventId?: number,
    @Query('cycleStatus') cycleStatus?: string,
  ) {
    const result = await this.systemService.getFraudDetectionCyclesData(
      page,
      limit,
      eventId ? Number(eventId) : undefined,
      cycleStatus?.trim() || undefined,
    );
    return {
      statusCode: 200,
      message: 'Fraud detection cycles retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get fraud alerts
   * GET /api/v1/admin/system/fraud-alerts
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get fraud alerts' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'acknowledged', required: false, example: false })
  @ApiQuery({ name: 'alertLevel', required: false, example: 'warning' })
  @ApiResponse({ status: 200, description: 'Fraud alerts retrieved successfully' })
  @Get('fraud-alerts')
  async getFraudAlerts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('acknowledged') acknowledged?: string,
    @Query('alertLevel') alertLevel?: string,
  ) {
    const normalizedAcknowledged =
      typeof acknowledged === 'string'
        ? acknowledged.toLowerCase() === 'true'
          ? true
          : acknowledged.toLowerCase() === 'false'
            ? false
            : undefined
        : undefined;

    const result = await this.systemService.getFraudAlertsData(
      page,
      limit,
      normalizedAcknowledged,
      alertLevel?.trim() || undefined,
    );
    return {
      statusCode: 200,
      message: 'Fraud alerts retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get vote locations
   * GET /api/v1/admin/system/vote-locations
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get vote locations' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'countryCode', required: false, example: 'ET' })
  @ApiQuery({ name: 'isVpn', required: false, example: false })
  @ApiQuery({ name: 'isProxy', required: false, example: false })
  @ApiQuery({ name: 'isTor', required: false, example: false })
  @ApiResponse({ status: 200, description: 'Vote locations retrieved successfully' })
  @Get('vote-locations')
  async getVoteLocations(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('countryCode') countryCode?: string,
    @Query('isVpn') isVpn?: string,
    @Query('isProxy') isProxy?: string,
    @Query('isTor') isTor?: string,
  ) {
    const normalizedIsVpn =
      typeof isVpn === 'string'
        ? isVpn.toLowerCase() === 'true'
          ? true
          : isVpn.toLowerCase() === 'false'
            ? false
            : undefined
        : undefined;
    const normalizedIsProxy =
      typeof isProxy === 'string'
        ? isProxy.toLowerCase() === 'true'
          ? true
          : isProxy.toLowerCase() === 'false'
            ? false
            : undefined
        : undefined;
    const normalizedIsTor =
      typeof isTor === 'string'
        ? isTor.toLowerCase() === 'true'
          ? true
          : isTor.toLowerCase() === 'false'
            ? false
            : undefined
        : undefined;

    const result = await this.systemService.getVoteLocationsData(
      page,
      limit,
      countryCode?.trim() || undefined,
      normalizedIsVpn,
      normalizedIsProxy,
      normalizedIsTor,
    );
    return {
      statusCode: 200,
      message: 'Vote locations retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get leaderboard cache control rows
   * GET /api/v1/admin/system/leaderboard-cache-control
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get leaderboard cache control rows' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'eventId', required: false, example: 1 })
  @ApiQuery({ name: 'categoryId', required: false, example: 2 })
  @ApiQuery({ name: 'syncStatus', required: false, example: 'synced' })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard cache control rows retrieved successfully',
  })
  @Get('leaderboard-cache-control')
  async getLeaderboardCacheControl(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('eventId') eventId?: number,
    @Query('categoryId') categoryId?: number,
    @Query('syncStatus') syncStatus?: string,
  ) {
    const result = await this.systemService.getLeaderboardCacheControlData(
      page,
      limit,
      eventId ? Number(eventId) : undefined,
      categoryId ? Number(categoryId) : undefined,
      syncStatus?.trim() || undefined,
    );
    return {
      statusCode: 200,
      message: 'Leaderboard cache control rows retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get account audit logs
   * GET /api/v1/admin/system/account-audit-logs
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get account audit logs' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'userId', required: false, example: 10 })
  @ApiQuery({ name: 'action', required: false, example: 'password_reset' })
  @ApiResponse({ status: 200, description: 'Account audit logs retrieved successfully' })
  @Get('account-audit-logs')
  async getAccountAuditLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('userId') userId?: number,
    @Query('action') action?: string,
  ) {
    const result = await this.systemService.getAccountAuditLogsData(
      page,
      limit,
      userId ? Number(userId) : undefined,
      action?.trim() || undefined,
    );
    return {
      statusCode: 200,
      message: 'Account audit logs retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get admin actions
   * GET /api/v1/admin/system/admin-actions
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get admin actions' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'adminId', required: false, example: 1 })
  @ApiQuery({ name: 'actionType', required: false, example: 'user_suspend' })
  @ApiQuery({ name: 'targetType', required: false, example: 'user' })
  @ApiResponse({ status: 200, description: 'Admin actions retrieved successfully' })
  @Get('admin-actions')
  async getAdminActions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('adminId') adminId?: number,
    @Query('actionType') actionType?: string,
    @Query('targetType') targetType?: string,
  ) {
    const result = await this.systemService.getAdminActionsData(
      page,
      limit,
      adminId ? Number(adminId) : undefined,
      actionType?.trim() || undefined,
      targetType?.trim() || undefined,
    );
    return {
      statusCode: 200,
      message: 'Admin actions retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get admin audit log
   * GET /api/v1/admin/system/admin-audit-log
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get admin audit log' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'adminId', required: false, example: 1 })
  @ApiQuery({ name: 'action', required: false, example: 'update' })
  @ApiQuery({ name: 'entityType', required: false, example: 'event' })
  @ApiResponse({ status: 200, description: 'Admin audit log retrieved successfully' })
  @Get('admin-audit-log')
  async getAdminAuditLog(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('adminId') adminId?: number,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
  ) {
    const result = await this.systemService.getAdminAuditLogData(
      page,
      limit,
      adminId ? Number(adminId) : undefined,
      action?.trim() || undefined,
      entityType?.trim() || undefined,
    );
    return {
      statusCode: 200,
      message: 'Admin audit log retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get alert rules
   * GET /api/v1/admin/system/alert-rules
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get alert rules' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'severity', required: false, example: 'high' })
  @ApiQuery({ name: 'enabled', required: false, example: true })
  @ApiResponse({ status: 200, description: 'Alert rules retrieved successfully' })
  @Get('alert-rules')
  async getAlertRules(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('severity') severity?: string,
    @Query('enabled') enabled?: string,
  ) {
    const normalizedEnabled =
      typeof enabled === 'string'
        ? enabled.toLowerCase() === 'true'
          ? true
          : enabled.toLowerCase() === 'false'
            ? false
            : undefined
        : undefined;
    const result = await this.systemService.getAlertRulesData(
      page,
      limit,
      severity?.trim() || undefined,
      normalizedEnabled,
    );
    return {
      statusCode: 200,
      message: 'Alert rules retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get triggered alerts
   * GET /api/v1/admin/system/alerts-triggered
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get triggered alerts' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'alertRuleId', required: false, example: 1 })
  @ApiQuery({ name: 'acknowledged', required: false, example: false })
  @ApiResponse({ status: 200, description: 'Triggered alerts retrieved successfully' })
  @Get('alerts-triggered')
  async getAlertsTriggered(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('alertRuleId') alertRuleId?: number,
    @Query('acknowledged') acknowledged?: string,
  ) {
    const normalizedAcknowledged =
      typeof acknowledged === 'string'
        ? acknowledged.toLowerCase() === 'true'
          ? true
          : acknowledged.toLowerCase() === 'false'
            ? false
            : undefined
        : undefined;
    const result = await this.systemService.getAlertsTriggeredData(
      page,
      limit,
      alertRuleId ? Number(alertRuleId) : undefined,
      normalizedAcknowledged,
    );
    return {
      statusCode: 200,
      message: 'Triggered alerts retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get blockchain audit log
   * GET /api/v1/admin/system/blockchain-audit-log
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get blockchain audit log' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'batchId', required: false, example: 1 })
  @ApiQuery({ name: 'status', required: false, example: 'confirmed' })
  @ApiResponse({ status: 200, description: 'Blockchain audit log retrieved successfully' })
  @Get('blockchain-audit-log')
  async getBlockchainAuditLog(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('batchId') batchId?: number,
    @Query('status') status?: string,
  ) {
    const result = await this.systemService.getBlockchainAuditLogData(
      page,
      limit,
      batchId ? Number(batchId) : undefined,
      status?.trim() || undefined,
    );
    return {
      statusCode: 200,
      message: 'Blockchain audit log retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get blockchain job queue
   * GET /api/v1/admin/system/blockchain-job-queue
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get blockchain job queue' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'jobType', required: false, example: 'anchor_batch' })
  @ApiQuery({ name: 'status', required: false, example: 'pending' })
  @ApiResponse({ status: 200, description: 'Blockchain job queue retrieved successfully' })
  @Get('blockchain-job-queue')
  async getBlockchainJobQueue(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('jobType') jobType?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.systemService.getBlockchainJobQueueData(
      page,
      limit,
      jobType?.trim() || undefined,
      status?.trim() || undefined,
    );
    return {
      statusCode: 200,
      message: 'Blockchain job queue retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get blockchain stats
   * GET /api/v1/admin/system/blockchain-stats
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get blockchain stats' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'eventId', required: false, example: 1 })
  @ApiQuery({ name: 'blockchainNetwork', required: false, example: 'ethereum' })
  @ApiResponse({ status: 200, description: 'Blockchain stats retrieved successfully' })
  @Get('blockchain-stats')
  async getBlockchainStats(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('eventId') eventId?: number,
    @Query('blockchainNetwork') blockchainNetwork?: string,
  ) {
    const result = await this.systemService.getBlockchainStatsData(
      page,
      limit,
      eventId ? Number(eventId) : undefined,
      blockchainNetwork?.trim() || undefined,
    );
    return {
      statusCode: 200,
      message: 'Blockchain stats retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get incident reports
   * GET /api/v1/admin/system/incident-reports
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get incident reports' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'eventId', required: false, example: 1 })
  @ApiQuery({ name: 'severity', required: false, example: 'critical' })
  @ApiQuery({ name: 'status', required: false, example: 'open' })
  @ApiResponse({ status: 200, description: 'Incident reports retrieved successfully' })
  @Get('incident-reports')
  async getIncidentReports(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('eventId') eventId?: number,
    @Query('severity') severity?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.systemService.getIncidentReportsData(
      page,
      limit,
      eventId ? Number(eventId) : undefined,
      severity?.trim() || undefined,
      status?.trim() || undefined,
    );
    return {
      statusCode: 200,
      message: 'Incident reports retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get shard registry
   * GET /api/v1/admin/system/shard-registry
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get shard registry' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'isActive', required: false, example: true })
  @ApiResponse({ status: 200, description: 'Shard registry retrieved successfully' })
  @Get('shard-registry')
  async getShardRegistry(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('isActive') isActive?: string,
  ) {
    const normalizedIsActive =
      typeof isActive === 'string'
        ? isActive.toLowerCase() === 'true'
          ? true
          : isActive.toLowerCase() === 'false'
            ? false
            : undefined
        : undefined;
    const result = await this.systemService.getShardRegistryData(
      page,
      limit,
      normalizedIsActive,
    );
    return {
      statusCode: 200,
      message: 'Shard registry retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get sponsor partners
   * GET /api/v1/admin/system/sponsor-partners
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get sponsor partners' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'tier', required: false, example: 'gold' })
  @ApiQuery({ name: 'isActive', required: false, example: true })
  @ApiResponse({ status: 200, description: 'Sponsor partners retrieved successfully' })
  @Get('sponsor-partners')
  async getSponsorPartners(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('tier') tier?: string,
    @Query('isActive') isActive?: string,
  ) {
    const normalizedIsActive =
      typeof isActive === 'string'
        ? isActive.toLowerCase() === 'true'
          ? true
          : isActive.toLowerCase() === 'false'
            ? false
            : undefined
        : undefined;
    const result = await this.systemService.getSponsorPartnersData(
      page,
      limit,
      tier?.trim() || undefined,
      normalizedIsActive,
    );
    return {
      statusCode: 200,
      message: 'Sponsor partners retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get fraud logs
   * GET /api/v1/admin/system/fraud-logs
   * Access: Admin
   */
  @ApiOperation({ summary: 'Get fraud logs' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'eventId', required: false, example: 1 })
  @ApiQuery({ name: 'categoryId', required: false, example: 2 })
  @ApiQuery({ name: 'severity', required: false, example: 'high' })
  @ApiQuery({ name: 'isResolved', required: false, example: false })
  @ApiResponse({ status: 200, description: 'Fraud logs retrieved successfully' })
  @Get('fraud-logs')
  async getFraudLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('eventId') eventId?: number,
    @Query('categoryId') categoryId?: number,
    @Query('severity') severity?: string,
    @Query('isResolved') isResolved?: string,
  ) {
    const normalizedIsResolved =
      typeof isResolved === 'string'
        ? isResolved.toLowerCase() === 'true'
          ? true
          : isResolved.toLowerCase() === 'false'
            ? false
            : undefined
        : undefined;
    const result = await this.systemService.getFraudLogsData(
      page,
      limit,
      eventId ? Number(eventId) : undefined,
      categoryId ? Number(categoryId) : undefined,
      severity?.trim() || undefined,
      normalizedIsResolved,
    );
    return {
      statusCode: 200,
      message: 'Fraud logs retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * List available analytics views
   * GET /api/v1/admin/system/analytics/views
   * Access: Admin
   */
  @ApiOperation({ summary: 'List supported analytics SQL views (allowlisted)' })
  @ApiResponse({
    status: 200,
    description: 'Analytics views retrieved successfully',
    type: AnalyticsViewsResponseDto,
  })
  @Get('analytics/views')
  async listAnalyticsViews() {
    return {
      statusCode: 200,
      message: 'Analytics views retrieved',
      data: this.systemService.getAnalyticsViews(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get analytics data for one view
   * GET /api/v1/admin/system/analytics/view/:viewName
   * Access: Admin
   */
  @ApiOperation({ summary: 'Fetch analytics rows from one allowlisted SQL view' })
  @ApiParam({
    name: 'viewName',
    required: true,
    description: 'SQL view name from /analytics/views',
    example: 'payment_status_overview',
  })
  @ApiQuery({ name: 'limit', required: false, example: 100, description: 'Max rows (1-500)' })
  @ApiQuery({ name: 'eventId', required: false, example: 1, description: 'Optional event filter for supported views' })
  @ApiQuery({ name: 'days', required: false, example: 30, description: 'Optional date window for supported views' })
  @ApiResponse({
    status: 200,
    description: 'Analytics view data retrieved successfully',
    type: AnalyticsViewResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Unsupported analytics view name' })
  @Get('analytics/view/:viewName')
  async getAnalyticsView(
    @Param('viewName') viewName: string,
    @Query('limit') limit: number = 100,
    @Query('eventId') eventId?: number,
    @Query('days') days?: number,
  ) {
    const data = await this.systemService.getAnalyticsViewData(viewName, {
      limit: Number(limit),
      eventId: eventId ? Number(eventId) : undefined,
      days: days ? Number(days) : undefined,
    });

    return {
      statusCode: 200,
      message: 'Analytics view data retrieved',
      data,
      meta: { view: viewName, limit: Number(limit), eventId, days },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get all analytics view datasets in one response
   * GET /api/v1/admin/system/analytics/full
   * Access: Admin
   */
  @ApiOperation({ summary: 'Fetch full analytics snapshot across all allowlisted SQL views' })
  @ApiQuery({ name: 'limit', required: false, example: 100, description: 'Per-view max rows (1-500)' })
  @ApiQuery({ name: 'eventId', required: false, example: 1, description: 'Optional event filter where supported' })
  @ApiQuery({ name: 'days', required: false, example: 30, description: 'Optional date window where supported' })
  @ApiResponse({
    status: 200,
    description: 'Full analytics snapshot retrieved successfully',
    type: AnalyticsFullResponseDto,
  })
  @Get('analytics/full')
  async getFullAnalytics(
    @Query('limit') limit: number = 100,
    @Query('eventId') eventId?: number,
    @Query('days') days?: number,
  ) {
    const data = await this.systemService.getFullAnalyticsSnapshot({
      limit: Number(limit),
      eventId: eventId ? Number(eventId) : undefined,
      days: days ? Number(days) : undefined,
    });

    return {
      statusCode: 200,
      message: 'Full analytics snapshot retrieved',
      data,
      meta: { limit: Number(limit), eventId, days },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create alert
   * POST /api/v1/admin/system/alerts
   * Access: Admin
   */
  @Post('alerts')
  async createAlert(
    @Body() alert: { title: string; message: string; severity: string },
    @Request() req: any,
  ) {
    const created = await this.systemService.createAlert(alert, req.user.id);
    return {
      statusCode: 201,
      message: 'Alert created',
      data: created,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get alerts
   * GET /api/v1/admin/system/alerts
   * Access: Admin
   */
  @Get('alerts')
  async getAlerts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('severity') severity?: string,
  ) {
    const result = await this.systemService.getAlerts(page, limit, severity);
    return {
      statusCode: 200,
      message: 'Alerts retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }
}
