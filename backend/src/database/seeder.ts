import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { UserEntity, UserRole, UserStatus } from '../entities/user.entity';
import { EventEntity, EventStatus } from '../entities/event.entity';
import { CategoryEntity } from '../entities/category.entity';
import { ContestantEntity, ContestantStatus, VerificationStatus } from '../entities/contestant.entity';
import { VoteEntity, VoteStatus, VoteType, FraudRiskLevel } from '../entities/vote.entity';
import { VoteReceiptEntity } from '../entities/vote-receipt.entity';
import { PaymentEntity, PaymentStatus, PaymentProvider, PaymentVerificationStatus } from '../entities/payment.entity';
import { AppSettingEntity } from '../entities/app-setting.entity';
import { FeatureFlagEntity } from '../entities/feature-flag.entity';
import { NotificationEntity, NotificationType } from '../entities/notification.entity';

/**
 * Voting System Test Data Seeder
 * Populates database with sample data for testing
 */
export class VotingSystemSeeder {
  constructor(private dataSource: DataSource) {}

  async seed(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    try {
      // Clear existing data
      await this.clearData();

      // Seed users
      const users = await this.seedUsers();
      console.log(`✅ Created ${users.length} users`);

      // Seed events
      const events = await this.seedEvents(users);
      console.log(`✅ Created ${events.length} events`);

      // Seed categories
      const categories = await this.seedCategories(events);
      console.log(`✅ Created ${categories.length} categories`);

      // Seed contestants
      const contestants = await this.seedContestants(events, categories, users);
      console.log(`✅ Created ${contestants.length} contestants`);

      // Seed votes
      const votes = await this.seedVotes(events, categories, contestants, users);
      console.log(`✅ Created ${votes.length} votes`);

      // Seed vote receipts
      const receipts = await this.seedVoteReceipts(votes);
      console.log(`✅ Created ${receipts.length} vote receipts`);

      // Seed payments
      const payments = await this.seedPayments(events, categories, contestants, users);
      console.log(`✅ Created ${payments.length} payments`);

      // Seed app settings
      const settings = await this.seedAppSettings();
      console.log(`✅ Created ${settings.length} app settings`);

      // Seed feature flags
      const flags = await this.seedFeatureFlags();
      console.log(`✅ Created ${flags.length} feature flags`);

      // Seed notifications
      const notifications = await this.seedNotifications(users);
      console.log(`✅ Created ${notifications.length} notifications`);

      // Seed system/admin monitoring tables used by QA endpoints
      const monitoringRows = await this.seedSystemMonitoringRows(
        users,
        events,
        categories,
        contestants,
        votes,
        payments,
      );
      console.log(`✅ Seeded ${monitoringRows} system monitoring table rows`);

      console.log('🎉 Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }

  private async clearData(): Promise<void> {
    console.log('🗑️  Clearing existing data...');
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      // Disable foreign key checks temporarily
      await queryRunner.query('SET session_replication_role = replica;');

      // Clear all tables in order
      const extraTables = [
        'alerts_triggered',
        'fraud_alerts',
        'fraud_detection_cycles',
        'timezone_anomalies',
        'geographic_velocity_logs',
        'vote_merkle_hashes',
        'vote_snapshots',
        'vote_behavior_profiles',
        'vote_locations',
        'trust_score_history',
        'payment_vote_reconciliation',
        'payment_vote_mismatches',
        'leaderboard_cache_control',
        'account_audit_logs',
        'admin_actions',
        'admin_audit_log',
        'alert_rules',
        'blockchain_audit_log',
        'blockchain_job_queue',
        'blockchain_stats',
        'incident_reports',
        'shard_registry',
        'sponsor_partners',
        'fraud_logs',
        'vote_batches',
        'webhook_signature_logs',
        'webhook_attempts',
        'webhook_failures',
        'webhook_events',
        'webhook_audit',
        'webhook_rate_limit',
        'webhook_secrets',
        'security_tokens',
        'otp_verifications',
        'rsa_key_versions',
        'payment_limits',
        'system_settings',
        'system_events',
        'monitoring_metrics',
        'performance_metrics',
        'rate_limit_logs',
        'db_health_checks',
        'geo_analysis_cache',
        'geo_risk_profiles',
        'verified_votes_cache',
      ];
      for (const table of extraTables) {
        if (await this.tableExists(queryRunner, table)) {
          await queryRunner.query(`TRUNCATE TABLE ${table} CASCADE;`);
        }
      }

      await queryRunner.query('TRUNCATE TABLE notifications CASCADE;');
      await queryRunner.query('TRUNCATE TABLE vote_receipts CASCADE;');
      await queryRunner.query('TRUNCATE TABLE votes CASCADE;');
      await queryRunner.query('TRUNCATE TABLE payments CASCADE;');
      await queryRunner.query('TRUNCATE TABLE contestants CASCADE;');
      await queryRunner.query('TRUNCATE TABLE categories CASCADE;');
      await queryRunner.query('TRUNCATE TABLE events CASCADE;');
      await queryRunner.query('TRUNCATE TABLE users CASCADE;');
      await queryRunner.query('TRUNCATE TABLE app_settings CASCADE;');
      await queryRunner.query('TRUNCATE TABLE feature_flags CASCADE;');

      // Re-enable foreign key checks
      await queryRunner.query('SET session_replication_role = default;');
    } finally {
      await queryRunner.release();
    }
  }

  private async seedUsers(): Promise<UserEntity[]> {
    const usersRepository = this.dataSource.getRepository(UserEntity);

    const users = [
      {
        email: 'admin@votechain.com',
        password_hash: await this.hashSecret('admin123'),
        first_name: 'Admin',
        last_name: 'User',
        phone: '+1234567890',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        email_verified: true,
        phone_verified: true,
        created_at: new Date('2026-01-01'),
      },
      {
        email: 'contestant1@votechain.com',
        password_hash: await this.hashSecret('contestant123'),
        first_name: 'Jane',
        last_name: 'Contestant',
        phone: '+1234567891',
        role: UserRole.CONTESTANT,
        status: UserStatus.ACTIVE,
        email_verified: true,
        phone_verified: true,
        created_at: new Date('2026-01-05'),
      },
      {
        email: 'voter1@votechain.com',
        password_hash: await this.hashSecret('voter123'),
        first_name: 'Bob',
        last_name: 'Voter',
        phone: '+1234567892',
        role: UserRole.VOTER,
        status: UserStatus.ACTIVE,
        email_verified: true,
        phone_verified: true,
        created_at: new Date('2026-01-10'),
      },
      {
        email: 'media@votechain.com',
        password_hash: await this.hashSecret('media123'),
        first_name: 'Media',
        last_name: 'Manager',
        phone: '+1234567893',
        role: UserRole.MEDIA,
        status: UserStatus.ACTIVE,
        email_verified: true,
        phone_verified: false,
        created_at: new Date('2026-01-15'),
      },
      {
        email: 'observer@votechain.com',
        password_hash: await this.hashSecret('observer123'),
        first_name: 'Observer',
        last_name: 'User',
        phone: '+1234567894',
        role: UserRole.OBSERVER,
        status: UserStatus.ACTIVE,
        email_verified: true,
        phone_verified: false,
        created_at: new Date('2026-01-20'),
      },
    ];

    return usersRepository.save(users);
  }

  private async seedEvents(users: UserEntity[]): Promise<EventEntity[]> {
    const eventsRepository = this.dataSource.getRepository(EventEntity);

    const events = [
      {
        name: 'Q1 2026 Talent Show',
        slug: 'q1-2026-talent-show',
        description: 'First quarter talent competition with live voting',
        status: EventStatus.ACTIVE,
        creator: users[0], // admin
        creator_id: users[0].id,
        start_date: new Date('2026-02-01'),
        end_date: new Date('2026-03-15'),
        voting_start: new Date('2026-02-10'),
        voting_end: new Date('2026-03-10'),
        visibility: 'public',
        allow_write_ins: true,
        created_at: new Date('2026-01-01'),
      },
      {
        name: 'Past Excellence Awards 2025',
        slug: 'past-excellence-awards-2025',
        description: 'Previous year awards with final results',
        status: EventStatus.COMPLETED,
        creator: users[0], // admin
        creator_id: users[0].id,
        start_date: new Date('2025-11-01'),
        end_date: new Date('2025-12-31'),
        voting_start: new Date('2025-11-15'),
        voting_end: new Date('2025-12-20'),
        visibility: 'public',
        allow_write_ins: false,
        created_at: new Date('2025-10-01'),
      },
    ];

    return eventsRepository.save(events);
  }

  private async seedCategories(events: EventEntity[]): Promise<CategoryEntity[]> {
    const categoriesRepository = this.dataSource.getRepository(CategoryEntity);

    const categories: Partial<CategoryEntity>[] = [];

    // 3 categories per event
    events.forEach((event, eventIndex) => {
      const categoryNames = ['Singing', 'Dancing', 'Comedy'];

      categoryNames.forEach((name, categoryIndex) => {
        categories.push({
          event: event,
          event_id: event.id,
          name: `${name} - ${event.name}`,
          description: `Best ${name.toLowerCase()} performance`,
          category_order: categoryIndex + 1,
          voting_enabled: event.status === EventStatus.ACTIVE,
          public_voting: true,
          paid_voting: eventIndex === 0, // Only first event has paid voting
          minimum_vote_amount: eventIndex === 0 ? 1.0 : 0,
          accept_write_ins: true,
          daily_vote_limit: 10,
          max_votes_per_user: 100,
          created_at: new Date('2026-01-15'),
        });
      });
    });

    return categoriesRepository.save(categories);
  }

  private async seedContestants(
    events: EventEntity[],
    categories: CategoryEntity[],
    users: UserEntity[],
  ): Promise<ContestantEntity[]> {
    const contestantsRepository = this.dataSource.getRepository(ContestantEntity);

    const contestants: Partial<ContestantEntity>[] = [];
    const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack'];

    // 10 contestants per category
    categories.forEach((category, categoryIndex) => {
      firstNames.forEach((firstName, index) => {
        contestants.push({
          event: category.event,
          event_id: category.event_id,
          category: category,
          category_id: category.id,
          user: categoryIndex === 0 && index === 0 ? users[1] : undefined, // First contestant is contestant user
          user_id: categoryIndex === 0 && index === 0 ? users[1].id : undefined,
          first_name: firstName,
          last_name: `${category.name.split(' - ')[0] || 'Artist'}${index + 1}`,
          email: `contestant-${categoryIndex}-${index}@votechain.com`,
          phone_number: `+123456789${index}`,
          biography: `Talented performer in ${category.name}`,
          profile_image_url: `https://i.pravatar.cc/150?img=${categoryIndex * 10 + index}`,
          banner_image_url: `https://picsum.photos/600/200?random=${categoryIndex * 10 + index}`,
          status: ContestantStatus.APPROVED,
          verification_status: index % 3 === 0 ? VerificationStatus.VERIFIED : VerificationStatus.UNVERIFIED,
          verified_at: index % 3 === 0 ? new Date() : undefined,
          verified_by: index % 3 === 0 ? users[0] : undefined,
          verified_by_id: index % 3 === 0 ? users[0].id : undefined,
          vote_count: Math.floor(Math.random() * 1000),
          paid_vote_count: Math.floor(Math.random() * 500),
          free_vote_count: Math.floor(Math.random() * 500),
          total_revenue: Math.floor(Math.random() * 5000),
          twitter_handle: `@contestant${categoryIndex}${index}`,
          instagram_handle: `contestant${categoryIndex}${index}`,
          facebook_url: 'https://facebook.com/contestant',
          created_at: new Date('2026-01-20'),
        });
      });
    });

    return contestantsRepository.save(contestants);
  }

  private async seedVotes(
    events: EventEntity[],
    categories: CategoryEntity[],
    contestants: ContestantEntity[],
    users: UserEntity[],
  ): Promise<VoteEntity[]> {
    const votesRepository = this.dataSource.getRepository(VoteEntity);

    const votes: Partial<VoteEntity>[] = [];

    // Create 50+ sample votes
    for (let i = 0; i < 60; i++) {
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      const randomCategory = categories.find((c) => c.event_id === randomEvent.id);
      if (!randomCategory) continue;
      const randomContestant = contestants.find((c) => c.category_id === randomCategory.id);
      if (!randomContestant) continue;
      const randomVoter = users[Math.floor(Math.random() * (users.length - 1)) + 1]; // Skip admin

      const fraudScore = Math.random();
      let fraudRiskLevel = FraudRiskLevel.LOW;
      if (fraudScore > 0.7) fraudRiskLevel = FraudRiskLevel.HIGH;
      else if (fraudScore > 0.4) fraudRiskLevel = FraudRiskLevel.MEDIUM;

      votes.push({
        event: randomEvent,
        event_id: randomEvent.id,
        category: randomCategory,
        category_id: randomCategory.id,
        contestant: randomContestant,
        contestant_id: randomContestant.id,
        voter: randomVoter,
        voter_id: randomVoter.id,
        vote_type: Math.random() > 0.7 ? VoteType.PAID : VoteType.FREE,
        status: fraudRiskLevel === FraudRiskLevel.HIGH ? VoteStatus.FRAUD_SUSPECTED : VoteStatus.VALID,
        fraud_risk_level: fraudRiskLevel,
        fraud_risk_score: fraudScore,
        trust_score: 1 - fraudScore,
        is_anonymous: Math.random() > 0.8,
        ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        user_agent: 'Mozilla/5.0 (Test User Agent)',
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
      });
    }

    return votesRepository.save(votes);
  }

  private async seedVoteReceipts(votes: VoteEntity[]): Promise<VoteReceiptEntity[]> {
    const receiptsRepository = this.dataSource.getRepository(VoteReceiptEntity);

    const receipts = votes.map((vote, index) => ({
      vote: vote,
      vote_id: vote.id,
      receipt_code: `VOTE-${Date.now()}-${index.toString().padStart(6, '0')}`,
      receipt_hash: `hash_${vote.id}_${index}`,
      is_verified: Math.random() > 0.3,
      created_at: vote.created_at,
    }));

    return receiptsRepository.save(receipts);
  }

  private async seedPayments(
    events: EventEntity[],
    categories: CategoryEntity[],
    contestants: ContestantEntity[],
    users: UserEntity[],
  ): Promise<PaymentEntity[]> {
    const paymentsRepository = this.dataSource.getRepository(PaymentEntity);

    const payments: Partial<PaymentEntity>[] = [];
    const providers = [PaymentProvider.STRIPE, PaymentProvider.PAYPAL, PaymentProvider.CHAPA];

    // Create 20 sample payments
    for (let i = 0; i < 20; i++) {
      const randomEvent = events[0]; // Use active event
      const randomCategory = categories.find((c) => c.event_id === randomEvent.id);
      if (!randomCategory) continue;
      const randomContestant = contestants.find((c) => c.category_id === randomCategory.id);
      if (!randomContestant) continue;
      const randomVoter = users[Math.floor(Math.random() * (users.length - 1)) + 1];

      payments.push({
        voter: randomVoter,
        voter_id: randomVoter.id,
        event: randomEvent,
        event_id: randomEvent.id,
        category: randomCategory,
        category_id: randomCategory.id,
        contestant: randomContestant,
        contestant_id: randomContestant.id,
        amount: Math.floor(Math.random() * 100) + 1,
        currency: 'USD',
        provider: providers[Math.floor(Math.random() * providers.length)],
        status: Math.random() > 0.2 ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
        provider_tx_id: `txn_${Math.random().toString(36).substring(7)}`,
        votes_purchased: Math.floor(Math.random() * 50) + 1,
        received_at: new Date(),
        verification_status: PaymentVerificationStatus.PENDING,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }

    return paymentsRepository.save(payments);
  }

  private async seedAppSettings(): Promise<AppSettingEntity[]> {
    const settingsRepository = this.dataSource.getRepository(AppSettingEntity);

    const settings = [
      {
        setting_key: 'platform_name',
        setting_value: 'VoteChain',
        setting_type: 'string',
        is_public: true,
        is_editable: true,
        description: 'Platform name displayed to users',
      },
      {
        setting_key: 'min_vote_amount',
        setting_value: '1.00',
        setting_type: 'number',
        is_public: false,
        is_editable: true,
        description: 'Minimum amount for paid votes',
      },
      {
        setting_key: 'max_fraud_score',
        setting_value: '0.8',
        setting_type: 'number',
        is_public: false,
        is_editable: true,
        description: 'Maximum fraud score threshold',
      },
      {
        setting_key: 'enable_blockchain',
        setting_value: 'false',
        setting_type: 'boolean',
        is_public: false,
        is_editable: true,
        description: 'Enable blockchain integration',
      },
    ];

    return settingsRepository.save(settings);
  }

  private async seedFeatureFlags(): Promise<FeatureFlagEntity[]> {
    const flagsRepository = this.dataSource.getRepository(FeatureFlagEntity);

    const flags: Partial<FeatureFlagEntity>[] = [
      {
        feature_name: 'paid_voting_enabled',
        is_enabled: true,
        rollout_percentage: 100,
        description: 'Enable paid voting functionality',
      },
      {
        feature_name: 'blockchain_verification',
        is_enabled: false,
        rollout_percentage: 0,
        description: 'Enable blockchain vote verification',
      },
      {
        feature_name: 'fraud_detection_enabled',
        is_enabled: true,
        rollout_percentage: 100,
        description: 'Enable fraud detection system',
      },
      {
        feature_name: 'write_ins_allowed',
        is_enabled: true,
        rollout_percentage: 50,
        description: 'Allow write-in candidates',
      },
    ];

    return flagsRepository.save(flags);
  }

  private async seedNotifications(users: UserEntity[]): Promise<NotificationEntity[]> {
    const notificationsRepository = this.dataSource.getRepository(NotificationEntity);

    const notifications: Partial<NotificationEntity>[] = [];

    // Create notifications for each user
    users.forEach((user) => {
      const notificationTypes = [
        { type: NotificationType.VOTE_RECEIVED, title: 'New Vote Received' },
        { type: NotificationType.VOTE_VERIFIED, title: 'Vote Verified' },
        { type: NotificationType.PAYMENT_SUCCESS, title: 'Payment Successful' },
        { type: NotificationType.EVENT_UPDATE, title: 'Event Update' },
      ];

      notificationTypes.forEach((notif) => {
        notifications.push({
          user: user,
          user_id: user.id,
          type: notif.type,
          title: notif.title,
          message: `Sample notification: ${notif.title}`,
          is_read: Math.random() > 0.5,
          related_entity_type: 'event',
          related_entity_id: 1,
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        });
      });
    });

    return notificationsRepository.save(notifications);
  }

  private async tableExists(queryRunner: any, table: string): Promise<boolean> {
    const rows = await queryRunner.query(`SELECT to_regclass($1) AS rel`, [`public.${table}`]);
    return Boolean(rows?.[0]?.rel);
  }

  private async seedSystemMonitoringRows(
    users: UserEntity[],
    events: EventEntity[],
    categories: CategoryEntity[],
    contestants: ContestantEntity[],
    votes: VoteEntity[],
    payments: PaymentEntity[],
  ): Promise<number> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const adminId = users.find((u) => u.role === UserRole.ADMIN)?.id ?? users[0]?.id;
    const userId = users.find((u) => u.role === UserRole.VOTER)?.id ?? users[0]?.id;
    const eventId = events[0]?.id;
    const categoryId = categories[0]?.id;
    const contestantId = contestants[0]?.id;
    const voteId = votes[0]?.id;
    const paymentId = payments[0]?.id;
    const deviceId = 1;

    if (!adminId || !userId || !eventId || !categoryId || !contestantId || !voteId || !paymentId) {
      return 0;
    }

    let seeded = 0;
    try {
      if (await this.tableExists(queryRunner, 'fraud_logs')) {
        await queryRunner.query(
          `
          INSERT INTO fraud_logs
            (event_id, category_id, vote_id, device_id, user_id, fraud_type, description, action_taken, action_timestamp, is_resolved)
          VALUES
            ($1, $2, $3, $4, $5, 'velocity_spike', 'QA fraud log', 'monitor', NOW(), false)
          `,
          [eventId, categoryId, voteId, deviceId, userId],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'security_tokens')) {
        await queryRunner.query(
          `INSERT INTO security_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
          [userId, `qa-token-${Date.now()}`],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'otp_verifications')) {
        await queryRunner.query(
          `INSERT INTO otp_verifications (user_id, otp_code, expires_at, attempts, is_used) VALUES ($1, '123456', NOW() + INTERVAL '10 minutes', 0, false)`,
          [userId],
        );
        seeded++;
      }

      let webhookEventId: number | null = null;
      if (await this.tableExists(queryRunner, 'webhook_events')) {
        const rows = await queryRunner.query(
          `
          INSERT INTO webhook_events (event_type, provider, external_event_id, payload, status)
          VALUES ('payment.completed', 'telebirr', $1, $2::jsonb, 'processed')
          RETURNING id
          `,
          [`evt_${Date.now()}`, JSON.stringify({ source: 'qa-seed' })],
        );
        webhookEventId = rows?.[0]?.id ?? null;
        seeded++;
      }

      if (webhookEventId && (await this.tableExists(queryRunner, 'webhook_signature_logs'))) {
        await queryRunner.query(
          `
          INSERT INTO webhook_signature_logs
            (webhook_event_id, signature_algorithm, signature_value, signature_valid, validation_method)
          VALUES
            ($1, 'HMAC-SHA256', 'qa-signature', true, 'header')
          `,
          [webhookEventId],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'webhook_secrets')) {
        await queryRunner.query(
          `
          INSERT INTO webhook_secrets (provider, secret_key_hash, version, is_active, rotated_at)
          VALUES ('telebirr', $1, 1, true, NOW())
          `,
          [`qa_secret_hash_${Date.now()}`.padEnd(64, '0').slice(0, 64)],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'webhook_audit')) {
        await queryRunner.query(
          `
          INSERT INTO webhook_audit (provider, transaction_id, audit_type, status, details)
          VALUES ('telebirr', $1, 'payment', 'success', $2::jsonb)
          `,
          [`txn_${Date.now()}`, JSON.stringify({ ok: true, source: 'qa-seed' })],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'webhook_rate_limit')) {
        await queryRunner.query(
          `
          INSERT INTO webhook_rate_limit (provider, processed_count, period_start, period_end)
          VALUES ('telebirr', 5, NOW() - INTERVAL '1 hour', NOW())
          `,
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'payment_vote_reconciliation')) {
        await queryRunner.query(
          `
          INSERT INTO payment_vote_reconciliation
            (payment_id, vote_id, reconciled, reconciliation_notes, amount_paid, amount_received, discrepancy, reconciled_at, reconciled_by)
          VALUES
            ($1, $2, true, 'QA reconciliation', 10.00, 10.00, 0.00, NOW(), $3)
          `,
          [paymentId, voteId, adminId],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'payment_vote_mismatches')) {
        await queryRunner.query(
          `
          INSERT INTO payment_vote_mismatches (payment_id, expected_votes, actual_votes, mismatch_reason)
          VALUES ($1, 10, 9, 'QA mismatch sample')
          `,
          [paymentId],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'rsa_key_versions')) {
        await queryRunner.query(
          `
          INSERT INTO rsa_key_versions (version, public_key, private_key, key_algorithm, is_active)
          VALUES (1, $1, NULL, 'RSA-2048', true)
          `,
          ['-----BEGIN PUBLIC KEY-----QA-----END PUBLIC KEY-----'],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'payment_limits')) {
        await queryRunner.query(
          `
          INSERT INTO payment_limits
            (event_id, category_id, max_votes_per_user_per_day, max_votes_per_user_total, max_votes_per_device_per_day, max_votes_per_ip_per_hour)
          VALUES ($1, $2, 100, 1000, 50, 500)
          `,
          [eventId, categoryId],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'system_settings')) {
        await queryRunner.query(
          `
          INSERT INTO system_settings (config_key, config_value, description, is_sensitive, updated_by)
          VALUES ('QA_MONITORING_MODE', 'true', 'QA seeded setting', false, $1)
          `,
          [adminId],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'system_events')) {
        await queryRunner.query(
          `INSERT INTO system_events (event_type, source, details) VALUES ('qa_seed_event', 'seeder', 'Seeded event for QA')`,
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'monitoring_metrics')) {
        await queryRunner.query(
          `INSERT INTO monitoring_metrics (metric_name, metric_value, source) VALUES ('qa.metric.requests', 42.0000, 'seeder')`,
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'performance_metrics')) {
        await queryRunner.query(
          `INSERT INTO performance_metrics (metric_name, value, device_id, process_name) VALUES ('api_latency_ms', 123.45, $1, 'backend')`,
          [deviceId],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'rate_limit_logs')) {
        await queryRunner.query(
          `INSERT INTO rate_limit_logs (user_id, ip_address, endpoint, request_count, action_taken) VALUES ($1, '203.0.113.1', '/api/v1/votes', 150, 'throttled')`,
          [userId],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'db_health_checks')) {
        await queryRunner.query(
          `INSERT INTO db_health_checks (check_type, response_time, error_message) VALUES ('qa', 15, NULL)`,
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'geo_analysis_cache')) {
        await queryRunner.query(
          `
          INSERT INTO geo_analysis_cache (event_id, geo_hash, country, city, total_votes, cache_data)
          VALUES ($1, 'qa-geo-hash', 'Ethiopia', 'Addis Ababa', 120, $2::jsonb)
          `,
          [eventId, JSON.stringify({ clusters: 3, risk: 'low' })],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'geo_risk_profiles')) {
        await queryRunner.query(
          `INSERT INTO geo_risk_profiles (country_code, risk_score, max_votes_per_hour, max_devices_per_ip) VALUES ('ET', 15.5, 10000, 5)`,
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'verified_votes_cache')) {
        await queryRunner.query(
          `INSERT INTO verified_votes_cache (event_id, category_id, contestant_id, verified_vote_count, cache_valid) VALUES ($1, $2, $3, 200, true)`,
          [eventId, categoryId, contestantId],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'vote_behavior_profiles')) {
        await queryRunner.query(
          `INSERT INTO vote_behavior_profiles (device_id, average_vote_interval_seconds, night_vote_ratio, country_switch_count, risk_score) VALUES ($1, 45, 0.20, 1, 22.50)`,
          [deviceId],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'vote_snapshots')) {
        await queryRunner.query(
          `
          INSERT INTO vote_snapshots
            (event_id, category_id, contestant_id, free_votes, paid_votes, total_votes, snapshot_hash, anchored, total_amount, fraud_votes)
          VALUES
            ($1, $2, $3, 100, 50, 150, $4, true, 500.00, 2)
          `,
          [eventId, categoryId, contestantId, `snapshot_${Date.now()}`],
        );
        seeded++;
      }

      let voteBatchId: number | null = null;
      if (await this.tableExists(queryRunner, 'vote_batches')) {
        const rows = await queryRunner.query(
          `INSERT INTO vote_batches (event_id, batch_number, batch_size, total_votes) VALUES ($1, 1, 100, 1) RETURNING id`,
          [eventId],
        );
        voteBatchId = rows?.[0]?.id ?? null;
        seeded++;
      }

      if (voteBatchId && (await this.tableExists(queryRunner, 'vote_merkle_hashes'))) {
        await queryRunner.query(
          `INSERT INTO vote_merkle_hashes (batch_id, vote_id, vote_hash, position) VALUES ($1, $2, $3, 0)`,
          [voteBatchId, voteId, `hash_${voteId}_${Date.now()}`],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'vote_locations')) {
        await queryRunner.query(
          `
          INSERT INTO vote_locations
            (vote_id, latitude, longitude, country, country_code, state_province, city, zip_code, accuracy_radius, is_vpn, is_proxy, is_tor, location_source)
          VALUES
            ($1, 8.9806, 38.7578, 'Ethiopia', 'ET', 'Addis Ababa', 'Addis Ababa', '1000', 25, false, false, false, 'qa_seed')
          `,
          [voteId],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'geographic_velocity_logs')) {
        await queryRunner.query(
          `
          INSERT INTO geographic_velocity_logs
            (vote_id, device_id, previous_location_country, previous_location_city, current_location_country, current_location_city, "current_timestamp", distance_km, time_difference_seconds, speed_kmh, is_impossible)
          VALUES
            ($1, $2, 'Ethiopia', 'Addis Ababa', 'Kenya', 'Nairobi', NOW(), 1160.00, 3600, 1160.00, true)
          `,
          [voteId, deviceId],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'timezone_anomalies')) {
        await queryRunner.query(
          `
          INSERT INTO timezone_anomalies
            (vote_id, device_id, reported_timezone, actual_timezone, offset_hours, anomaly_score, is_flagged)
          VALUES
            ($1, $2, 'UTC+03:00', 'UTC+00:00', 3, 80.00, true)
          `,
          [voteId, deviceId],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'trust_score_history')) {
        await queryRunner.query(
          `INSERT INTO trust_score_history (device_id, previous_score, new_score, reason) VALUES ($1, 0.90, 0.70, 'QA risk adjustment')`,
          [deviceId],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'fraud_detection_cycles')) {
        await queryRunner.query(
          `
          INSERT INTO fraud_detection_cycles
            (event_id, cycle_number, start_time, end_time, total_votes_checked, fraudulent_votes_found, fraud_percentage)
          VALUES
            ($1, 1, NOW() - INTERVAL '10 minutes', NOW(), 100, 3, 3.00)
          `,
          [eventId],
        );
        seeded++;
      }

      const fraudRows = await queryRunner.query(`SELECT id FROM fraud_logs ORDER BY created_at DESC LIMIT 1`);
      const fraudLogId = fraudRows?.[0]?.id ?? null;
      if (fraudLogId && (await this.tableExists(queryRunner, 'fraud_alerts'))) {
        await queryRunner.query(
          `
          INSERT INTO fraud_alerts
            (fraud_log_id, alert_type, alert_message, is_acknowledged, action_required)
          VALUES
            ($1, 'velocity_violation', 'QA fraud alert', false, 'review')
          `,
          [fraudLogId],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'leaderboard_cache_control')) {
        await queryRunner.query(
          `INSERT INTO leaderboard_cache_control (event_id, category_id, last_synced_at) VALUES ($1, $2, NOW())`,
          [eventId, categoryId],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'account_audit_logs')) {
        await queryRunner.query(
          `INSERT INTO account_audit_logs (user_id, action, description, ip_address, user_agent) VALUES ($1, 'login', 'QA account audit row', '203.0.113.2', 'QA-Agent/1.0')`,
          [userId],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'admin_actions')) {
        await queryRunner.query(
          `
          INSERT INTO admin_actions
            (admin_id, action_type, target_type, target_id, details, ip_address, user_agent)
          VALUES
            ($1, 'user_review', 'user', $2, $3::jsonb, '203.0.113.3', 'QA-Agent/1.0')
          `,
          [adminId, userId, JSON.stringify({ reason: 'qa_seed' })],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'admin_audit_log')) {
        await queryRunner.query(
          `
          INSERT INTO admin_audit_log
            (admin_id, action, entity_type, entity_id, changes, reason, ip_address)
          VALUES
            ($1, 'update', 'event', $2, $3::jsonb, 'QA audit seed', '203.0.113.4')
          `,
          [adminId, eventId, JSON.stringify({ before: 'draft', after: 'active' })],
        );
        seeded++;
      }

      let alertRuleId: number | null = null;
      if (await this.tableExists(queryRunner, 'alert_rules')) {
        const rows = await queryRunner.query(
          `
          INSERT INTO alert_rules (rule_name, condition, threshold, enabled, created_by)
          VALUES ('qa_high_risk_rule', 'risk_score > threshold', 70.0, true, $1)
          RETURNING id
          `,
          [adminId],
        );
        alertRuleId = rows?.[0]?.id ?? null;
        seeded++;
      }

      if (alertRuleId && (await this.tableExists(queryRunner, 'alerts_triggered'))) {
        await queryRunner.query(
          `INSERT INTO alerts_triggered (alert_rule_id, trigger_value, is_acknowledged, acknowledged_by, acknowledged_at) VALUES ($1, 88.5, true, $2, NOW())`,
          [alertRuleId, adminId],
        );
        seeded++;
      }

      if (voteBatchId && (await this.tableExists(queryRunner, 'blockchain_audit_log'))) {
        await queryRunner.query(
          `INSERT INTO blockchain_audit_log (batch_id, action, details, error_message) VALUES ($1, 'anchor_attempt', 'QA blockchain audit row', NULL)`,
          [voteBatchId],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'blockchain_job_queue')) {
        await queryRunner.query(
          `INSERT INTO blockchain_job_queue (job_type, job_data, priority, retry_count, max_retries) VALUES ('anchor_batch', $1::jsonb, 1, 0, 3)`,
          [JSON.stringify({ eventId, categoryId })],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'blockchain_stats')) {
        await queryRunner.query(
          `
          INSERT INTO blockchain_stats
            (event_id, total_batches, anchored_batches, verified_batches, total_votes_on_chain, blockchain_network, average_anchor_time_seconds)
          VALUES
            ($1, 1, 1, 1, 150, 'ethereum', 42)
          `,
          [eventId],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'incident_reports')) {
        await queryRunner.query(
          `INSERT INTO incident_reports (event_id, title, description, detected_by) VALUES ($1, 'QA Incident', 'Seeded incident for endpoint verification', $2)`,
          [eventId, adminId],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'shard_registry')) {
        await queryRunner.query(
          `INSERT INTO shard_registry (shard_name, database_host, is_active) VALUES ($1, 'localhost', true)`,
          [`qa-shard-${Date.now()}`],
        );
        seeded++;
      }

      if (await this.tableExists(queryRunner, 'sponsor_partners')) {
        await queryRunner.query(
          `INSERT INTO sponsor_partners (name, logo_url, website_url, is_active) VALUES ('QA Sponsor', 'https://example.com/logo.png', 'https://example.com', true)`,
        );
        seeded++;
      }

      return seeded;
    } finally {
      await queryRunner.release();
    }
  }

  private async hashSecret(secret: string): Promise<string> {
    return argon2.hash(secret, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
  }
}
