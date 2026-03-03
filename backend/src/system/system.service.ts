import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemLogEntity } from '@/entities/system-log.entity';
import { AppSettingEntity } from '@/entities/app-setting.entity';
import { FeatureFlagEntity } from '@/entities/feature-flag.entity';
import { PaymentWebhookEntity } from '@/entities/payment-webhook.entity';
import { NotificationEntity, NotificationType } from '@/entities/notification.entity';

@Injectable()
export class SystemService {
  private readonly analyticsViews: Record<
    string,
    {
      defaultOrderBy?: string;
      supportsEventFilter?: boolean;
      supportsDaysFilter?: boolean;
    }
  > = {
    blockchain_anchor_status: { defaultOrderBy: 'event_id', supportsEventFilter: true },
    crypto_health_check: { defaultOrderBy: 'component' },
    device_reputation_summary: { defaultOrderBy: 'fraud_reports DESC' },
    fraud_detection_summary: { defaultOrderBy: 'total_fraud_reports DESC', supportsEventFilter: true },
    geographic_vote_distribution: { defaultOrderBy: 'vote_count DESC', supportsEventFilter: true },
    merkle_batch_status: { defaultOrderBy: 'created_at DESC', supportsEventFilter: true },
    payment_status_overview: { defaultOrderBy: 'total_payments DESC', supportsEventFilter: true },
    real_time_leaderboard: { defaultOrderBy: 'event_id, category_id, rank', supportsEventFilter: true },
    receipt_verification_summary: { defaultOrderBy: 'verification_date DESC', supportsDaysFilter: true },
    system_health_overview: {},
    user_activity_summary: { defaultOrderBy: 'votes_cast DESC' },
    v_suspicious_ips_24h: { defaultOrderBy: 'reputation_score DESC' },
    v_user_trusted_devices: { defaultOrderBy: 'trusted_count DESC' },
    velocity_violation_trends: { defaultOrderBy: 'violation_date DESC', supportsEventFilter: true, supportsDaysFilter: true },
    vote_counts_by_contestant: { defaultOrderBy: 'total_votes DESC', supportsEventFilter: true },
  };

  constructor(
    @InjectRepository(SystemLogEntity)
    private logRepository: Repository<SystemLogEntity>,
    @InjectRepository(AppSettingEntity)
    private settingsRepository: Repository<AppSettingEntity>,
    @InjectRepository(FeatureFlagEntity)
    private featureFlagRepository: Repository<FeatureFlagEntity>,
    @InjectRepository(PaymentWebhookEntity)
    private webhookRepository: Repository<PaymentWebhookEntity>,
    @InjectRepository(NotificationEntity)
    private notificationRepository: Repository<NotificationEntity>,
  ) {}

  /**
   * Get system overview
   */
  async getSystemOverview(): Promise<any> {
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get system health
   */
  async getSystemHealth(): Promise<any> {
    let dbStatus = 'disconnected';
    let healthOverview: Record<string, any> | null = null;

    try {
      await this.logRepository.query('SELECT 1');
      dbStatus = 'connected';

      const hasHealthOverviewView = await this.relationExists('system_health_overview');
      if (hasHealthOverviewView) {
        const rows = await this.logRepository.query(
          `SELECT * FROM system_health_overview LIMIT 1`,
        );
        healthOverview = rows[0] || null;
      } else if (await this.relationExists('db_health_checks')) {
        const rows = await this.logRepository.query(
          `
          SELECT
            COUNT(CASE WHEN status = 'healthy' THEN 1 END)::BIGINT AS healthy_checks,
            COUNT(CASE WHEN status = 'warning' THEN 1 END)::BIGINT AS warning_checks,
            COUNT(CASE WHEN status = 'critical' THEN 1 END)::BIGINT AS critical_checks,
            MAX(checked_at) AS last_health_check
          FROM db_health_checks
          `,
        );
        healthOverview = rows[0] || null;
      }
    } catch {
      dbStatus = 'error';
    }

    return {
      status: dbStatus === 'connected' ? 'healthy' : 'degraded',
      database: dbStatus,
      healthOverview,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Read-only metadata for allowed analytics views.
   */
  getAnalyticsViews(): string[] {
    return Object.keys(this.analyticsViews);
  }

  /**
   * Retrieve analytics rows from a specific allowlisted SQL view.
   */
  async getAnalyticsViewData(
    viewName: string,
    options: { limit?: number; eventId?: number; days?: number } = {},
  ): Promise<any[]> {
    const config = this.analyticsViews[viewName];
    if (!config) {
      throw new BadRequestException(`Unsupported analytics view: ${viewName}`);
    }

    const limit = this.clamp(options.limit ?? 100, 1, 500);
    const params: Array<number> = [];
    const where: string[] = [];

    if (options.eventId && config.supportsEventFilter) {
      params.push(options.eventId);
      where.push(`event_id = $${params.length}`);
    }

    if (options.days && config.supportsDaysFilter) {
      const days = this.clamp(options.days, 1, 365);
      params.push(days);
      if (viewName === 'receipt_verification_summary') {
        where.push(`verification_date >= CURRENT_DATE - ($${params.length} * INTERVAL '1 day')`);
      } else if (viewName === 'velocity_violation_trends') {
        where.push(`violation_date >= CURRENT_DATE - ($${params.length} * INTERVAL '1 day')`);
      }
    }

    const whereClause = where.length > 0 ? ` WHERE ${where.join(' AND ')}` : '';
    const orderByClause = config.defaultOrderBy ? ` ORDER BY ${config.defaultOrderBy}` : '';
    params.push(limit);

    const sql = `SELECT * FROM ${viewName}${whereClause}${orderByClause} LIMIT $${params.length}`;

    try {
      return await this.logRepository.query(sql, params);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Failed to read analytics view "${viewName}". ${message}`,
      );
    }
  }

  /**
   * Retrieve all analytics views in one call (each capped by limit).
   */
  async getFullAnalyticsSnapshot(
    options: { limit?: number; eventId?: number; days?: number } = {},
  ): Promise<Record<string, any[]>> {
    const result: Record<string, any[]> = {};
    for (const viewName of this.getAnalyticsViews()) {
      result[viewName] = await this.getAnalyticsViewData(viewName, options);
    }
    return result;
  }

  /**
   * Get system logs
   */
  async getSystemLogs(
    page: number = 1,
    limit: number = 50,
    level?: string,
  ): Promise<{ data: SystemLogEntity[]; pagination: any }> {
    const queryBuilder = this.logRepository.createQueryBuilder('log');
    
    if (level) {
      queryBuilder.andWhere('log.level = :level', { level });
    }
    
    const total = await queryBuilder.getCount();
    const pages = Math.ceil(total / limit);
    
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('log.created_at', 'DESC')
      .getMany();
    
    return {
      data,
      pagination: { page, limit, total, pages },
    };
  }

  /**
   * Get API usage data
   */
  async getApiUsage(
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('api_usage'))) {
      return {
        data: [],
        pagination: { page, limit, total: 0, pages: 0 },
      };
    }

    const offset = (page - 1) * limit;
    const countRows = await this.logRepository.query(
      'SELECT COUNT(*)::BIGINT AS total FROM api_usage',
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const data = await this.logRepository.query(
      `
      SELECT
        id,
        endpoint,
        method,
        status_code,
        response_time,
        request_size,
        response_size,
        user_id,
        timestamp
      FROM api_usage
      ORDER BY timestamp DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset],
    );

    return {
      data,
      pagination: { page, limit, total, pages },
    };
  }

  /**
   * Get webhook data
   */
  async getWebhookData(
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    // Primary path: existing entity-backed table used by current codebase.
    if (await this.relationExists('payment_webhooks')) {
      const queryBuilder = this.webhookRepository.createQueryBuilder('webhook');
      const total = await queryBuilder.getCount();
      const pages = Math.ceil(total / limit);

      const data = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('webhook.created_at', 'DESC')
        .getMany();

      return {
        data,
        pagination: { page, limit, total, pages },
      };
    }

    // Fallback path: canonical SQL webhook tables.
    if (!(await this.relationExists('webhook_events'))) {
      return {
        data: [],
        pagination: { page, limit, total: 0, pages: 0 },
      };
    }

    const offset = (page - 1) * limit;
    const countRows = await this.logRepository.query(
      'SELECT COUNT(*)::BIGINT AS total FROM webhook_events',
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const data = await this.logRepository.query(
      `
      SELECT
        we.id,
        we.provider,
        we.event_type,
        we.external_event_id,
        we.status,
        we.retry_count,
        we.error_message,
        we.created_at,
        COALESCE(wa.attempt_count, 0)::BIGINT AS attempt_count,
        COALESCE(wf.failure_count, 0)::BIGINT AS failure_count
      FROM webhook_events we
      LEFT JOIN (
        SELECT webhook_event_id, COUNT(*)::BIGINT AS attempt_count
        FROM webhook_attempts
        GROUP BY webhook_event_id
      ) wa ON wa.webhook_event_id = we.id
      LEFT JOIN (
        SELECT webhook_event_id, COUNT(*)::BIGINT AS failure_count
        FROM webhook_failures
        GROUP BY webhook_event_id
      ) wf ON wf.webhook_event_id = we.id
      ORDER BY we.created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset],
    );

    return {
      data,
      pagination: { page, limit, total, pages },
    };
  }

  /**
   * Get settings
   */
  async getSettings(): Promise<AppSettingEntity[]> {
    return this.settingsRepository.find();
  }

  /**
   * Update settings
   */
  async updateSettings(
    settings: Record<string, any>,
    _adminId: number,
  ): Promise<AppSettingEntity[]> {
    for (const [key, value] of Object.entries(settings)) {
      const existing = await this.settingsRepository.findOne({ where: { setting_key: key } });
      if (existing) {
        existing.setting_value = JSON.stringify(value);
        existing.updated_at = new Date();
        await this.settingsRepository.save(existing);
      } else {
        await this.settingsRepository.save({
          setting_key: key,
          setting_value: JSON.stringify(value),
          updated_at: new Date(),
        });
      }
    }
    return this.getSettings();
  }

  /**
   * Get feature flags
   */
  async getFeatureFlags(): Promise<FeatureFlagEntity[]> {
    return this.featureFlagRepository.find();
  }

  /**
   * Toggle feature flag
   */
  async toggleFeatureFlag(featureName: string, enabled: boolean): Promise<FeatureFlagEntity> {
    const flag = await this.featureFlagRepository.findOne({ where: { feature_name: featureName } });
    if (flag) {
      flag.is_enabled = enabled;
      return this.featureFlagRepository.save(flag);
    }
    return this.featureFlagRepository.save({ feature_name: featureName, is_enabled: enabled });
  }

  /**
   * Create alert
   */
  async createAlert(
    alert: { title: string; message: string; severity: string },
    _adminId: number,
  ): Promise<any> {
    return {
      id: Date.now(),
      ...alert,
      created_by: _adminId,
      created_at: new Date(),
    };
  }

  /**
   * Get alerts
   */
  async getAlerts(
    page: number = 1,
    limit: number = 50,
    severity?: string,
  ): Promise<{ data: NotificationEntity[]; pagination: any }> {
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification');

    // Filter for system and fraud alerts only
    queryBuilder.where(
      'notification.type IN (:...types)',
      { types: [NotificationType.SYSTEM_ALERT, NotificationType.FRAUD_ALERT] },
    );

    const total = await queryBuilder.getCount();
    const pages = Math.ceil(total / limit);

    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('notification.created_at', 'DESC')
      .getMany();

    return {
      data,
      pagination: { page, limit, total, pages },
    };
  }

  /**
   * Get security tokens with optional filters.
   */
  async getSecurityTokens(
    page: number = 1,
    limit: number = 50,
    options: { userId?: number; type?: string; activeOnly?: boolean } = {},
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('security_tokens'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (options.userId) {
      params.push(options.userId);
      where.push(`st.user_id = $${params.length}`);
    }
    if (options.type) {
      params.push(options.type);
      where.push(`st.type = $${params.length}`);
    }
    if (options.activeOnly) {
      where.push(`st.revoked_at IS NULL`);
      where.push(`st.used_at IS NULL`);
      where.push(`st.expires_at > NOW()`);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*)::BIGINT AS total
      FROM security_tokens st
      ${whereClause}
    `;
    const countRows = await this.logRepository.query(countSql, params);
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        st.id,
        st.user_id,
        st.type,
        st.expires_at,
        st.used_at,
        st.revoked_at,
        st.created_at
      FROM security_tokens st
      ${whereClause}
      ORDER BY st.created_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);

    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get OTP verification records with optional filters.
   */
  async getOtpVerificationLogs(
    page: number = 1,
    limit: number = 50,
    options: { userId?: number; used?: boolean; otpType?: string } = {},
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('otp_verifications'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (options.userId) {
      params.push(options.userId);
      where.push(`ov.user_id = $${params.length}`);
    }
    if (typeof options.used === 'boolean') {
      params.push(options.used);
      where.push(`ov.is_used = $${params.length}`);
    }
    if (options.otpType) {
      params.push(options.otpType);
      where.push(`ov.type = $${params.length}`);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*)::BIGINT AS total
      FROM otp_verifications ov
      ${whereClause}
    `;
    const countRows = await this.logRepository.query(countSql, params);
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        ov.id,
        ov.user_id,
        ov.type,
        ov.is_used,
        ov.attempts,
        ov.expires_at,
        ov.created_at
      FROM otp_verifications ov
      ${whereClause}
      ORDER BY ov.created_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);

    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get webhook security data (secrets + signature validations).
   */
  async getWebhookSecurityData(
    page: number = 1,
    limit: number = 50,
    provider?: string,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('webhook_signature_logs'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const hasWebhookEvents = await this.relationExists('webhook_events');
    const hasWebhookSecrets = await this.relationExists('webhook_secrets');

    const params: any[] = [];
    const where: string[] = [];
    if (provider && hasWebhookEvents) {
      params.push(provider.toLowerCase());
      where.push(`LOWER(we.provider::text) = $${params.length}`);
    } else if (provider && hasWebhookSecrets) {
      params.push(provider.toLowerCase());
      where.push(`LOWER(ws.provider::text) = $${params.length}`);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*)::BIGINT AS total
      FROM webhook_signature_logs wsl
      ${hasWebhookEvents ? 'LEFT JOIN webhook_events we ON we.id = wsl.webhook_event_id' : ''}
      ${hasWebhookSecrets && hasWebhookEvents ? 'LEFT JOIN webhook_secrets ws ON ws.provider = we.provider' : ''}
      ${whereClause}
    `;
    const countRows = await this.logRepository.query(countSql, params);
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        wsl.id,
        wsl.webhook_event_id,
        ${hasWebhookEvents ? 'we.provider,' : 'NULL::text AS provider,'}
        wsl.signature_algorithm,
        wsl.signature_valid,
        wsl.validation_method,
        ${hasWebhookSecrets ? 'COALESCE(ws.version, 0)::INTEGER AS secret_version,' : '0::INTEGER AS secret_version,'}
        ${hasWebhookSecrets ? 'COALESCE(ws.is_active, false) AS secret_active,' : 'false AS secret_active,'}
        wsl.created_at
      FROM webhook_signature_logs wsl
      ${hasWebhookEvents ? 'LEFT JOIN webhook_events we ON we.id = wsl.webhook_event_id' : ''}
      ${hasWebhookSecrets && hasWebhookEvents ? 'LEFT JOIN webhook_secrets ws ON ws.provider = we.provider AND ws.is_active = TRUE' : ''}
      ${whereClause}
      ORDER BY wsl.created_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);

    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get payment-vote reconciliation records with optional status filter.
   */
  async getPaymentVoteReconciliation(
    page: number = 1,
    limit: number = 50,
    reconciled?: boolean,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('payment_vote_reconciliation'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (typeof reconciled === 'boolean') {
      params.push(reconciled);
      where.push(`pvr.reconciled = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const hasMismatches = await this.relationExists('payment_vote_mismatches');
    const mismatchJoin = hasMismatches
      ? `
      LEFT JOIN (
        SELECT
          payment_id,
          COUNT(*)::BIGINT AS mismatch_count
        FROM payment_vote_mismatches
        GROUP BY payment_id
      ) pvm ON pvm.payment_id = pvr.payment_id
      `
      : '';

    const countSql = `
      SELECT COUNT(*)::BIGINT AS total
      FROM payment_vote_reconciliation pvr
      ${whereClause}
    `;
    const countRows = await this.logRepository.query(countSql, params);
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        pvr.id,
        pvr.payment_id,
        pvr.vote_id,
        pvr.reconciled,
        pvr.amount_paid,
        pvr.amount_received,
        pvr.discrepancy,
        pvr.reconciled_at,
        pvr.reconciled_by,
        pvr.created_at,
        ${hasMismatches ? 'COALESCE(pvm.mismatch_count, 0)::BIGINT' : '0::BIGINT'} AS mismatch_count
      FROM payment_vote_reconciliation pvr
      ${mismatchJoin}
      ${whereClause}
      ORDER BY pvr.created_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);

    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get webhook audit records.
   */
  async getWebhookAuditData(
    page: number = 1,
    limit: number = 50,
    provider?: string,
    status?: string,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('webhook_audit'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (provider) {
      params.push(provider.toLowerCase());
      where.push(`LOWER(wa.provider::text) = $${params.length}`);
    }
    if (status) {
      params.push(status.toLowerCase());
      where.push(`LOWER(wa.status::text) = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*)::BIGINT AS total
      FROM webhook_audit wa
      ${whereClause}
    `;
    const countRows = await this.logRepository.query(countSql, params);
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        wa.id,
        wa.provider,
        wa.transaction_id,
        wa.audit_type,
        wa.status,
        wa.details,
        wa.created_at
      FROM webhook_audit wa
      ${whereClause}
      ORDER BY wa.created_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);

    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get webhook rate-limit snapshots.
   */
  async getWebhookRateLimitData(
    page: number = 1,
    limit: number = 50,
    provider?: string,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('webhook_rate_limit'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (provider) {
      params.push(provider.toLowerCase());
      where.push(`LOWER(wrl.provider::text) = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*)::BIGINT AS total
      FROM webhook_rate_limit wrl
      ${whereClause}
    `;
    const countRows = await this.logRepository.query(countSql, params);
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        wrl.id,
        wrl.provider,
        wrl.processed_count,
        wrl.period_start,
        wrl.period_end,
        wrl.created_at
      FROM webhook_rate_limit wrl
      ${whereClause}
      ORDER BY COALESCE(wrl.period_end, wrl.created_at) DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);

    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get RSA key version inventory (private keys never returned).
   */
  async getRsaKeyVersions(
    page: number = 1,
    limit: number = 50,
    activeOnly?: boolean,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('rsa_key_versions'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (activeOnly) {
      where.push('rkv.is_active = TRUE');
      where.push('rkv.revoked_at IS NULL');
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*)::BIGINT AS total
      FROM rsa_key_versions rkv
      ${whereClause}
    `;
    const countRows = await this.logRepository.query(countSql, params);
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        rkv.id,
        rkv.version,
        rkv.public_key,
        rkv.key_algorithm,
        rkv.created_at,
        rkv.revoked_at,
        rkv.is_active
      FROM rsa_key_versions rkv
      ${whereClause}
      ORDER BY rkv.created_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);

    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get payment limits configuration rows.
   */
  async getPaymentLimits(
    page: number = 1,
    limit: number = 50,
    eventId?: number,
    categoryId?: number,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('payment_limits'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (eventId) {
      params.push(eventId);
      where.push(`pl.event_id = $${params.length}`);
    }
    if (typeof categoryId === 'number') {
      params.push(categoryId);
      where.push(`pl.category_id = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*)::BIGINT AS total FROM payment_limits pl ${whereClause}`;
    const countRows = await this.logRepository.query(countSql, params);
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        pl.id,
        pl.event_id,
        pl.category_id,
        pl.max_votes_per_user_per_day,
        pl.max_votes_per_user_total,
        pl.max_votes_per_device_per_day,
        pl.max_votes_per_ip_per_hour,
        pl.created_at,
        pl.updated_at
      FROM payment_limits pl
      ${whereClause}
      ORDER BY pl.updated_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get canonical system settings rows.
   */
  async getCanonicalSystemSettings(
    page: number = 1,
    limit: number = 50,
    includeSensitive: boolean = false,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('system_settings'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const whereClause = includeSensitive ? '' : 'WHERE ss.is_sensitive = FALSE';
    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM system_settings ss ${whereClause}`,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const data = await this.logRepository.query(
      `
      SELECT
        ss.id,
        ss.config_key,
        CASE
          WHEN ss.is_sensitive = TRUE AND $3 = FALSE THEN '[REDACTED]'
          ELSE ss.config_value
        END AS config_value,
        ss.description,
        ss.is_sensitive,
        ss.updated_by,
        ss.created_at,
        ss.updated_at
      FROM system_settings ss
      ${whereClause}
      ORDER BY ss.updated_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset, includeSensitive],
    );

    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get system event stream rows.
   */
  async getSystemEventsData(
    page: number = 1,
    limit: number = 50,
    severity?: string,
    source?: string,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('system_events'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (severity) {
      params.push(severity.toLowerCase());
      where.push(`LOWER(se.severity::text) = $${params.length}`);
    }
    if (source) {
      params.push(source.toLowerCase());
      where.push(`LOWER(COALESCE(se.source, '')) = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM system_events se ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        se.id,
        se.event_type,
        se.severity,
        se.source,
        se.details,
        se.recorded_at
      FROM system_events se
      ${whereClause}
      ORDER BY se.recorded_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get monitoring metrics rows.
   */
  async getMonitoringMetricsData(
    page: number = 1,
    limit: number = 50,
    metricName?: string,
    source?: string,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('monitoring_metrics'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (metricName) {
      params.push(`%${metricName.toLowerCase()}%`);
      where.push(`LOWER(mm.metric_name) LIKE $${params.length}`);
    }
    if (source) {
      params.push(source.toLowerCase());
      where.push(`LOWER(COALESCE(mm.source, '')) = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM monitoring_metrics mm ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        mm.id,
        mm.metric_name,
        mm.metric_value,
        mm.source,
        mm.recorded_at
      FROM monitoring_metrics mm
      ${whereClause}
      ORDER BY mm.recorded_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get performance metrics rows.
   */
  async getPerformanceMetricsData(
    page: number = 1,
    limit: number = 50,
    metricName?: string,
    processName?: string,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('performance_metrics'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (metricName) {
      params.push(`%${metricName.toLowerCase()}%`);
      where.push(`LOWER(COALESCE(pm.metric_name, '')) LIKE $${params.length}`);
    }
    if (processName) {
      params.push(processName.toLowerCase());
      where.push(`LOWER(COALESCE(pm.process_name, '')) = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM performance_metrics pm ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        pm.id,
        pm.metric_name,
        pm.value,
        pm.timestamp,
        pm.device_id,
        pm.process_name
      FROM performance_metrics pm
      ${whereClause}
      ORDER BY pm.timestamp DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get rate-limit violation logs.
   */
  async getRateLimitLogsData(
    page: number = 1,
    limit: number = 50,
    endpoint?: string,
    userId?: number,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('rate_limit_logs'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (endpoint) {
      params.push(`%${endpoint.toLowerCase()}%`);
      where.push(`LOWER(COALESCE(rll.endpoint, '')) LIKE $${params.length}`);
    }
    if (typeof userId === 'number') {
      params.push(userId);
      where.push(`rll.user_id = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM rate_limit_logs rll ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        rll.id,
        rll.user_id,
        rll.ip_address,
        rll.endpoint,
        rll.request_count,
        rll.limit_exceeded_at,
        rll.action_taken
      FROM rate_limit_logs rll
      ${whereClause}
      ORDER BY rll.limit_exceeded_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Record a DB health check sample into db_health_checks table.
   */
  async recordDbHealthCheck(input: {
    checkType: string;
    status: 'healthy' | 'warning' | 'critical';
    responseTime?: number;
    errorMessage?: string | null;
  }): Promise<{ inserted: boolean; row?: any }> {
    if (!(await this.relationExists('db_health_checks'))) {
      return { inserted: false };
    }

    const checkType = (input.checkType || 'manual').slice(0, 100);
    const status = ['healthy', 'warning', 'critical'].includes(input.status)
      ? input.status
      : 'warning';
    const responseTime =
      typeof input.responseTime === 'number' && Number.isFinite(input.responseTime)
        ? Math.max(0, Math.trunc(input.responseTime))
        : null;
    const errorMessage = input.errorMessage ? String(input.errorMessage).slice(0, 2000) : null;

    const rows = await this.logRepository.query(
      `
      INSERT INTO db_health_checks (check_type, status, response_time, error_message)
      VALUES ($1, $2, $3, $4)
      RETURNING id, check_type, status, response_time, error_message, checked_at
      `,
      [checkType, status, responseTime, errorMessage],
    );

    return { inserted: true, row: rows?.[0] || null };
  }

  /**
   * Get geo analysis cache rows.
   */
  async getGeoAnalysisCacheData(
    page: number = 1,
    limit: number = 50,
    eventId?: number,
    country?: string,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('geo_analysis_cache'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (typeof eventId === 'number') {
      params.push(eventId);
      where.push(`gac.event_id = $${params.length}`);
    }
    if (country) {
      params.push(country.toLowerCase());
      where.push(`LOWER(COALESCE(gac.country, '')) = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM geo_analysis_cache gac ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        gac.id,
        gac.event_id,
        gac.geo_hash,
        gac.country,
        gac.city,
        gac.total_votes,
        gac.cache_data,
        gac.last_updated
      FROM geo_analysis_cache gac
      ${whereClause}
      ORDER BY gac.last_updated DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get geo risk profile rows.
   */
  async getGeoRiskProfilesData(
    page: number = 1,
    limit: number = 50,
    countryCode?: string,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('geo_risk_profiles'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (countryCode) {
      params.push(countryCode.toUpperCase());
      where.push(`grp.country_code = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM geo_risk_profiles grp ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        grp.id,
        grp.country_code,
        grp.risk_score,
        grp.max_votes_per_hour,
        grp.max_devices_per_ip,
        grp.created_at,
        grp.updated_at
      FROM geo_risk_profiles grp
      ${whereClause}
      ORDER BY grp.risk_score DESC, grp.updated_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get verified votes cache rows.
   */
  async getVerifiedVotesCacheData(
    page: number = 1,
    limit: number = 50,
    eventId?: number,
    categoryId?: number,
    cacheValid?: boolean,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('verified_votes_cache'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (typeof eventId === 'number') {
      params.push(eventId);
      where.push(`vvc.event_id = $${params.length}`);
    }
    if (typeof categoryId === 'number') {
      params.push(categoryId);
      where.push(`vvc.category_id = $${params.length}`);
    }
    if (typeof cacheValid === 'boolean') {
      params.push(cacheValid);
      where.push(`vvc.cache_valid = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM verified_votes_cache vvc ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        vvc.id,
        vvc.event_id,
        vvc.category_id,
        vvc.contestant_id,
        vvc.verified_vote_count,
        vvc.last_sync,
        vvc.cache_valid
      FROM verified_votes_cache vvc
      ${whereClause}
      ORDER BY vvc.last_sync DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get vote behavior profile rows.
   */
  async getVoteBehaviorProfilesData(
    page: number = 1,
    limit: number = 50,
    deviceId?: number,
    minRiskScore?: number,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('vote_behavior_profiles'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (typeof deviceId === 'number') {
      params.push(deviceId);
      where.push(`vbp.device_id = $${params.length}`);
    }
    if (typeof minRiskScore === 'number' && Number.isFinite(minRiskScore)) {
      params.push(minRiskScore);
      where.push(`vbp.risk_score >= $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM vote_behavior_profiles vbp ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        vbp.id,
        vbp.device_id,
        vbp.average_vote_interval_seconds,
        vbp.night_vote_ratio,
        vbp.country_switch_count,
        vbp.risk_score,
        vbp.created_at,
        vbp.updated_at
      FROM vote_behavior_profiles vbp
      ${whereClause}
      ORDER BY vbp.risk_score DESC, vbp.updated_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get vote snapshot rows.
   */
  async getVoteSnapshotsData(
    page: number = 1,
    limit: number = 50,
    eventId?: number,
    categoryId?: number,
    anchored?: boolean,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('vote_snapshots'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (typeof eventId === 'number') {
      params.push(eventId);
      where.push(`vs.event_id = $${params.length}`);
    }
    if (typeof categoryId === 'number') {
      params.push(categoryId);
      where.push(`vs.category_id = $${params.length}`);
    }
    if (typeof anchored === 'boolean') {
      params.push(anchored);
      where.push(`vs.anchored = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM vote_snapshots vs ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        vs.id,
        vs.event_id,
        vs.category_id,
        vs.contestant_id,
        vs.free_votes,
        vs.paid_votes,
        vs.total_votes,
        vs.snapshot_hash,
        vs.anchored,
        vs.anchored_at,
        vs.blockchain_tx_hash,
        vs.merkle_root,
        vs.total_amount,
        vs.fraud_votes,
        vs.snapshot_timestamp,
        vs.created_at
      FROM vote_snapshots vs
      ${whereClause}
      ORDER BY vs.snapshot_timestamp DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get vote merkle hash rows.
   */
  async getVoteMerkleHashesData(
    page: number = 1,
    limit: number = 50,
    batchId?: number,
    voteId?: number,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('vote_merkle_hashes'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (typeof batchId === 'number') {
      params.push(batchId);
      where.push(`vmh.batch_id = $${params.length}`);
    }
    if (typeof voteId === 'number') {
      params.push(voteId);
      where.push(`vmh.vote_id = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM vote_merkle_hashes vmh ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        vmh.id,
        vmh.batch_id,
        vmh.vote_id,
        vmh.vote_hash,
        vmh.position,
        vmh.created_at
      FROM vote_merkle_hashes vmh
      ${whereClause}
      ORDER BY vmh.created_at DESC, vmh.position ASC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get geographic velocity log rows.
   */
  async getGeographicVelocityLogsData(
    page: number = 1,
    limit: number = 50,
    deviceId?: number,
    impossibleOnly?: boolean,
    minSpeedKmh?: number,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('geographic_velocity_logs'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (typeof deviceId === 'number') {
      params.push(deviceId);
      where.push(`gvl.device_id = $${params.length}`);
    }
    if (typeof impossibleOnly === 'boolean') {
      params.push(impossibleOnly);
      where.push(`gvl.is_impossible = $${params.length}`);
    }
    if (typeof minSpeedKmh === 'number' && Number.isFinite(minSpeedKmh)) {
      params.push(minSpeedKmh);
      where.push(`gvl.speed_kmh >= $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM geographic_velocity_logs gvl ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        gvl.id,
        gvl.vote_id,
        gvl.device_id,
        gvl.previous_location_country,
        gvl.previous_location_city,
        gvl.previous_timestamp,
        gvl.current_location_country,
        gvl.current_location_city,
        gvl."current_timestamp",
        gvl.distance_km,
        gvl.time_difference_seconds,
        gvl.speed_kmh,
        gvl.is_impossible,
        gvl.detected_at
      FROM geographic_velocity_logs gvl
      ${whereClause}
      ORDER BY gvl.detected_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get timezone anomaly rows.
   */
  async getTimezoneAnomaliesData(
    page: number = 1,
    limit: number = 50,
    deviceId?: number,
    flaggedOnly?: boolean,
    minAnomalyScore?: number,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('timezone_anomalies'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (typeof deviceId === 'number') {
      params.push(deviceId);
      where.push(`ta.device_id = $${params.length}`);
    }
    if (typeof flaggedOnly === 'boolean') {
      params.push(flaggedOnly);
      where.push(`ta.is_flagged = $${params.length}`);
    }
    if (typeof minAnomalyScore === 'number' && Number.isFinite(minAnomalyScore)) {
      params.push(minAnomalyScore);
      where.push(`ta.anomaly_score >= $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM timezone_anomalies ta ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        ta.id,
        ta.vote_id,
        ta.device_id,
        ta.reported_timezone,
        ta.actual_timezone,
        ta.offset_hours,
        ta.anomaly_score,
        ta.is_flagged,
        ta.detected_at
      FROM timezone_anomalies ta
      ${whereClause}
      ORDER BY ta.detected_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get trust score history rows.
   */
  async getTrustScoreHistoryData(
    page: number = 1,
    limit: number = 50,
    deviceId?: number,
    reason?: string,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('trust_score_history'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (typeof deviceId === 'number') {
      params.push(deviceId);
      where.push(`tsh.device_id = $${params.length}`);
    }
    if (reason) {
      params.push(`%${reason.toLowerCase()}%`);
      where.push(`LOWER(COALESCE(tsh.reason, '')) LIKE $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM trust_score_history tsh ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        tsh.id,
        tsh.device_id,
        tsh.previous_score,
        tsh.new_score,
        tsh.reason,
        tsh.recorded_at
      FROM trust_score_history tsh
      ${whereClause}
      ORDER BY tsh.recorded_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get fraud detection cycle rows.
   */
  async getFraudDetectionCyclesData(
    page: number = 1,
    limit: number = 50,
    eventId?: number,
    cycleStatus?: string,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('fraud_detection_cycles'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (typeof eventId === 'number') {
      params.push(eventId);
      where.push(`fdc.event_id = $${params.length}`);
    }
    if (cycleStatus) {
      params.push(cycleStatus.toLowerCase());
      where.push(`LOWER(CAST(fdc.cycle_status AS TEXT)) = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM fraud_detection_cycles fdc ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        fdc.id,
        fdc.event_id,
        fdc.cycle_number,
        fdc.start_time,
        fdc.end_time,
        fdc.total_votes_checked,
        fdc.fraudulent_votes_found,
        fdc.fraud_percentage,
        fdc.cycle_status,
        fdc.created_at
      FROM fraud_detection_cycles fdc
      ${whereClause}
      ORDER BY fdc.created_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get fraud alert rows.
   */
  async getFraudAlertsData(
    page: number = 1,
    limit: number = 50,
    acknowledged?: boolean,
    alertLevel?: string,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('fraud_alerts'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (typeof acknowledged === 'boolean') {
      params.push(acknowledged);
      where.push(`fa.is_acknowledged = $${params.length}`);
    }
    if (alertLevel) {
      params.push(alertLevel.toLowerCase());
      where.push(`LOWER(CAST(fa.alert_level AS TEXT)) = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM fraud_alerts fa ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        fa.id,
        fa.fraud_log_id,
        fa.alert_type,
        fa.alert_message,
        fa.alert_level,
        fa.is_acknowledged,
        fa.acknowledged_by,
        fa.acknowledged_at,
        fa.action_required,
        fa.created_at
      FROM fraud_alerts fa
      ${whereClause}
      ORDER BY fa.created_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get vote location rows.
   */
  async getVoteLocationsData(
    page: number = 1,
    limit: number = 50,
    countryCode?: string,
    isVpn?: boolean,
    isProxy?: boolean,
    isTor?: boolean,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('vote_locations'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (countryCode) {
      params.push(countryCode.toUpperCase());
      where.push(`vl.country_code = $${params.length}`);
    }
    if (typeof isVpn === 'boolean') {
      params.push(isVpn);
      where.push(`vl.is_vpn = $${params.length}`);
    }
    if (typeof isProxy === 'boolean') {
      params.push(isProxy);
      where.push(`vl.is_proxy = $${params.length}`);
    }
    if (typeof isTor === 'boolean') {
      params.push(isTor);
      where.push(`vl.is_tor = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM vote_locations vl ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        vl.id,
        vl.vote_id,
        vl.latitude,
        vl.longitude,
        vl.country,
        vl.country_code,
        vl.state_province,
        vl.city,
        vl.zip_code,
        vl.accuracy_radius,
        vl.is_vpn,
        vl.is_proxy,
        vl.is_tor,
        vl.location_source,
        vl.recorded_at
      FROM vote_locations vl
      ${whereClause}
      ORDER BY vl.recorded_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get leaderboard cache control rows.
   */
  async getLeaderboardCacheControlData(
    page: number = 1,
    limit: number = 50,
    eventId?: number,
    categoryId?: number,
    syncStatus?: string,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);

    if (!(await this.relationExists('leaderboard_cache_control'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (typeof eventId === 'number') {
      params.push(eventId);
      where.push(`lcc.event_id = $${params.length}`);
    }
    if (typeof categoryId === 'number') {
      params.push(categoryId);
      where.push(`lcc.category_id = $${params.length}`);
    }
    if (syncStatus) {
      params.push(syncStatus.toLowerCase());
      where.push(`LOWER(CAST(lcc.sync_status AS TEXT)) = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM leaderboard_cache_control lcc ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        lcc.id,
        lcc.event_id,
        lcc.category_id,
        lcc.last_synced_at,
        lcc.sync_status,
        lcc.created_at,
        lcc.updated_at
      FROM leaderboard_cache_control lcc
      ${whereClause}
      ORDER BY lcc.updated_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;
    const data = await this.logRepository.query(dataSql, dataParams);
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get account audit logs.
   */
  async getAccountAuditLogsData(
    page: number = 1,
    limit: number = 50,
    userId?: number,
    action?: string,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);
    if (!(await this.relationExists('account_audit_logs'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }
    const params: any[] = [];
    const where: string[] = [];
    if (typeof userId === 'number') {
      params.push(userId);
      where.push(`aal.user_id = $${params.length}`);
    }
    if (action) {
      params.push(action.toLowerCase());
      where.push(`LOWER(aal.action) = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM account_audit_logs aal ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const data = await this.logRepository.query(
      `
      SELECT aal.id, aal.user_id, aal.action, aal.description, aal.ip_address, aal.user_agent, aal.created_at
      FROM account_audit_logs aal
      ${whereClause}
      ORDER BY aal.created_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
      `,
      dataParams,
    );
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get admin actions.
   */
  async getAdminActionsData(
    page: number = 1,
    limit: number = 50,
    adminId?: number,
    actionType?: string,
    targetType?: string,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);
    if (!(await this.relationExists('admin_actions'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }
    const params: any[] = [];
    const where: string[] = [];
    if (typeof adminId === 'number') {
      params.push(adminId);
      where.push(`aa.admin_id = $${params.length}`);
    }
    if (actionType) {
      params.push(actionType.toLowerCase());
      where.push(`LOWER(aa.action_type) = $${params.length}`);
    }
    if (targetType) {
      params.push(targetType.toLowerCase());
      where.push(`LOWER(aa.target_type) = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM admin_actions aa ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const data = await this.logRepository.query(
      `
      SELECT aa.id, aa.admin_id, aa.action_type, aa.target_type, aa.target_id, aa.details, aa.ip_address, aa.user_agent, aa.created_at
      FROM admin_actions aa
      ${whereClause}
      ORDER BY aa.created_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
      `,
      dataParams,
    );
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get admin audit log.
   */
  async getAdminAuditLogData(
    page: number = 1,
    limit: number = 50,
    adminId?: number,
    action?: string,
    entityType?: string,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);
    if (!(await this.relationExists('admin_audit_log'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }
    const params: any[] = [];
    const where: string[] = [];
    if (typeof adminId === 'number') {
      params.push(adminId);
      where.push(`aal.admin_id = $${params.length}`);
    }
    if (action) {
      params.push(action.toLowerCase());
      where.push(`LOWER(aal.action) = $${params.length}`);
    }
    if (entityType) {
      params.push(entityType.toLowerCase());
      where.push(`LOWER(COALESCE(aal.entity_type, '')) = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM admin_audit_log aal ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const data = await this.logRepository.query(
      `
      SELECT aal.id, aal.admin_id, aal.action, aal.entity_type, aal.entity_id, aal.changes, aal.reason, aal.ip_address, aal.timestamp
      FROM admin_audit_log aal
      ${whereClause}
      ORDER BY aal.timestamp DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
      `,
      dataParams,
    );
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get alert rules.
   */
  async getAlertRulesData(
    page: number = 1,
    limit: number = 50,
    severity?: string,
    enabled?: boolean,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);
    if (!(await this.relationExists('alert_rules'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }
    const params: any[] = [];
    const where: string[] = [];
    if (severity) {
      params.push(severity.toLowerCase());
      where.push(`LOWER(CAST(ar.severity AS TEXT)) = $${params.length}`);
    }
    if (typeof enabled === 'boolean') {
      params.push(enabled);
      where.push(`ar.enabled = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM alert_rules ar ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const data = await this.logRepository.query(
      `
      SELECT ar.id, ar.rule_name, ar.condition, ar.threshold, ar.severity, ar.enabled, ar.created_by, ar.created_at
      FROM alert_rules ar
      ${whereClause}
      ORDER BY ar.created_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
      `,
      dataParams,
    );
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get triggered alerts.
   */
  async getAlertsTriggeredData(
    page: number = 1,
    limit: number = 50,
    alertRuleId?: number,
    acknowledged?: boolean,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);
    if (!(await this.relationExists('alerts_triggered'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }
    const params: any[] = [];
    const where: string[] = [];
    if (typeof alertRuleId === 'number') {
      params.push(alertRuleId);
      where.push(`at.alert_rule_id = $${params.length}`);
    }
    if (typeof acknowledged === 'boolean') {
      params.push(acknowledged);
      where.push(`at.is_acknowledged = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM alerts_triggered at ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const data = await this.logRepository.query(
      `
      SELECT at.id, at.alert_rule_id, at.trigger_value, at.triggered_at, at.is_acknowledged, at.acknowledged_by, at.acknowledged_at
      FROM alerts_triggered at
      ${whereClause}
      ORDER BY at.triggered_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
      `,
      dataParams,
    );
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get blockchain audit log.
   */
  async getBlockchainAuditLogData(
    page: number = 1,
    limit: number = 50,
    batchId?: number,
    status?: string,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);
    if (!(await this.relationExists('blockchain_audit_log'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }
    const params: any[] = [];
    const where: string[] = [];
    if (typeof batchId === 'number') {
      params.push(batchId);
      where.push(`bal.batch_id = $${params.length}`);
    }
    if (status) {
      params.push(status.toLowerCase());
      where.push(`LOWER(CAST(bal.status AS TEXT)) = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM blockchain_audit_log bal ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const data = await this.logRepository.query(
      `
      SELECT bal.id, bal.batch_id, bal.action, bal.details, bal.status, bal.error_message, bal.created_at
      FROM blockchain_audit_log bal
      ${whereClause}
      ORDER BY bal.created_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
      `,
      dataParams,
    );
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get blockchain job queue.
   */
  async getBlockchainJobQueueData(
    page: number = 1,
    limit: number = 50,
    jobType?: string,
    status?: string,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);
    if (!(await this.relationExists('blockchain_job_queue'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }
    const params: any[] = [];
    const where: string[] = [];
    if (jobType) {
      params.push(jobType.toLowerCase());
      where.push(`LOWER(COALESCE(bjq.job_type, '')) = $${params.length}`);
    }
    if (status) {
      params.push(status.toLowerCase());
      where.push(`LOWER(CAST(bjq.status AS TEXT)) = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM blockchain_job_queue bjq ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const data = await this.logRepository.query(
      `
      SELECT bjq.id, bjq.job_type, bjq.job_data, bjq.status, bjq.priority, bjq.retry_count, bjq.max_retries, bjq.error_message, bjq.created_at, bjq.started_at, bjq.completed_at
      FROM blockchain_job_queue bjq
      ${whereClause}
      ORDER BY bjq.created_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
      `,
      dataParams,
    );
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get blockchain stats.
   */
  async getBlockchainStatsData(
    page: number = 1,
    limit: number = 50,
    eventId?: number,
    blockchainNetwork?: string,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);
    if (!(await this.relationExists('blockchain_stats'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }
    const params: any[] = [];
    const where: string[] = [];
    if (typeof eventId === 'number') {
      params.push(eventId);
      where.push(`bs.event_id = $${params.length}`);
    }
    if (blockchainNetwork) {
      params.push(blockchainNetwork.toLowerCase());
      where.push(`LOWER(COALESCE(bs.blockchain_network, '')) = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM blockchain_stats bs ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const data = await this.logRepository.query(
      `
      SELECT bs.id, bs.event_id, bs.total_batches, bs.anchored_batches, bs.verified_batches, bs.total_votes_on_chain, bs.blockchain_network, bs.average_anchor_time_seconds, bs.last_update
      FROM blockchain_stats bs
      ${whereClause}
      ORDER BY bs.last_update DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
      `,
      dataParams,
    );
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get incident reports.
   */
  async getIncidentReportsData(
    page: number = 1,
    limit: number = 50,
    eventId?: number,
    severity?: string,
    status?: string,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);
    if (!(await this.relationExists('incident_reports'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }
    const params: any[] = [];
    const where: string[] = [];
    if (typeof eventId === 'number') {
      params.push(eventId);
      where.push(`ir.event_id = $${params.length}`);
    }
    if (severity) {
      params.push(severity.toLowerCase());
      where.push(`LOWER(CAST(ir.severity AS TEXT)) = $${params.length}`);
    }
    if (status) {
      params.push(status.toLowerCase());
      where.push(`LOWER(CAST(ir.status AS TEXT)) = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM incident_reports ir ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const data = await this.logRepository.query(
      `
      SELECT ir.id, ir.event_id, ir.severity, ir.title, ir.description, ir.detected_by, ir.status, ir.resolved_by, ir.resolved_at, ir.created_at, ir.updated_at
      FROM incident_reports ir
      ${whereClause}
      ORDER BY ir.updated_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
      `,
      dataParams,
    );
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get shard registry rows.
   */
  async getShardRegistryData(
    page: number = 1,
    limit: number = 50,
    isActive?: boolean,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);
    if (!(await this.relationExists('shard_registry'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }
    const params: any[] = [];
    const where: string[] = [];
    if (typeof isActive === 'boolean') {
      params.push(isActive);
      where.push(`sr.is_active = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM shard_registry sr ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const data = await this.logRepository.query(
      `
      SELECT sr.id, sr.shard_name, sr.database_host, sr.is_active, sr.created_at
      FROM shard_registry sr
      ${whereClause}
      ORDER BY sr.created_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
      `,
      dataParams,
    );
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get sponsor partner rows.
   */
  async getSponsorPartnersData(
    page: number = 1,
    limit: number = 50,
    tier?: string,
    isActive?: boolean,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);
    if (!(await this.relationExists('sponsor_partners'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }
    const params: any[] = [];
    const where: string[] = [];
    if (tier) {
      params.push(tier.toLowerCase());
      where.push(`LOWER(CAST(sp.tier AS TEXT)) = $${params.length}`);
    }
    if (typeof isActive === 'boolean') {
      params.push(isActive);
      where.push(`sp.is_active = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM sponsor_partners sp ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const data = await this.logRepository.query(
      `
      SELECT sp.id, sp.name, sp.logo_url, sp.website_url, sp.tier, sp.is_active, sp.created_at, sp.updated_at
      FROM sponsor_partners sp
      ${whereClause}
      ORDER BY sp.updated_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
      `,
      dataParams,
    );
    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get fraud logs.
   */
  async getFraudLogsData(
    page: number = 1,
    limit: number = 50,
    eventId?: number,
    categoryId?: number,
    severity?: string,
    isResolved?: boolean,
  ): Promise<{ data: any[]; pagination: any }> {
    page = this.clamp(Number(page) || 1, 1, 1000000);
    limit = this.clamp(Number(limit) || 50, 1, 500);
    if (!(await this.relationExists('fraud_logs'))) {
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    const params: any[] = [];
    const where: string[] = [];
    if (typeof eventId === 'number') {
      params.push(eventId);
      where.push(`fl.event_id = $${params.length}`);
    }
    if (typeof categoryId === 'number') {
      params.push(categoryId);
      where.push(`fl.category_id = $${params.length}`);
    }
    if (severity) {
      params.push(severity.toLowerCase());
      where.push(`LOWER(CAST(fl.severity AS TEXT)) = $${params.length}`);
    }
    if (typeof isResolved === 'boolean') {
      params.push(isResolved);
      where.push(`fl.is_resolved = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const countRows = await this.logRepository.query(
      `SELECT COUNT(*)::BIGINT AS total FROM fraud_logs fl ${whereClause}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const data = await this.logRepository.query(
      `
      SELECT
        fl.id,
        fl.event_id,
        fl.category_id,
        fl.vote_id,
        fl.device_id,
        fl.user_id,
        fl.fraud_type,
        fl.severity,
        fl.description,
        fl.evidence,
        fl.action_taken,
        fl.action_timestamp,
        fl.is_resolved,
        fl.resolved_by,
        fl.created_at
      FROM fraud_logs fl
      ${whereClause}
      ORDER BY fl.created_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
      `,
      dataParams,
    );
    return { data, pagination: { page, limit, total, pages } };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private async relationExists(name: string): Promise<boolean> {
    const rows = await this.logRepository.query(
      `SELECT to_regclass($1) AS rel`,
      [`public.${name}`],
    );
    return Boolean(rows?.[0]?.rel);
  }
}
