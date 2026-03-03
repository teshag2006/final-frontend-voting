import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '@/entities/user.entity';
import { AuthOtpRequestEntity } from '@/entities/auth-otp-request.entity';
import { CategoryEntity } from '@/entities/category.entity';
import { ContestantEntity } from '@/entities/contestant.entity';
import { EventEntity } from '@/entities/event.entity';
import { MediaFileEntity } from '@/entities/media-file.entity';
import { NotificationEntity } from '@/entities/notification.entity';
import { PaymentEntity } from '@/entities/payment.entity';
import { VoteEntity } from '@/entities/vote.entity';
import { VoteWalletEntity } from '@/entities/vote-wallet.entity';
import { TenantEntity } from '@/entities/tenant.entity';
import { AuditLogEntity } from '@/entities/audit-log.entity';
import { BlockchainAnchorEntity } from '@/entities/blockchain-anchor.entity';
import { DeviceEntity } from '@/entities/device.entity';
import { DeviceAnomalyEntity } from '@/entities/device-anomaly.entity';
import { DeviceFingerprintEntity } from '@/entities/device-fingerprint.entity';
import { DeviceReputationEntity } from '@/entities/device-reputation.entity';
import { EventSponsorEntity } from '@/entities/event-sponsor.entity';
import { ExportEntity } from '@/entities/export.entity';
import { FeatureFlagEntity } from '@/entities/feature-flag.entity';
import { FraudLogEntity } from '@/entities/fraud-log.entity';
import { CampaignEntity } from '@/entities/campaign.entity';
import { CampaignReportEntity } from '@/entities/campaign-report.entity';
import { CampaignSnapshotEntity } from '@/entities/campaign-snapshot.entity';
import { ContestantIntegrityEntity } from '@/entities/contestant-integrity.entity';
import { ContestantTierEntity } from '@/entities/contestant-tier.entity';
import { EnforcementLogEntity } from '@/entities/enforcement-log.entity';
import { MerkleProofEntity } from '@/entities/merkle-proof.entity';
import { ObserverEntity } from '@/entities/observer.entity';
import { PaymentProviderEntity } from '@/entities/payment-provider.entity';
import { PaymentWebhookEntity } from '@/entities/payment-webhook.entity';
import { RefundRequestEntity } from '@/entities/refund-request.entity';
import { RiskLogEntity } from '@/entities/risk-log.entity';
import { SponsorEntity } from '@/entities/sponsor.entity';
import { SponsorImpressionEntity } from '@/entities/sponsor-impression.entity';
import { SponsorClickEntity } from '@/entities/sponsor-click.entity';
import { SponsorDocumentEntity } from '@/entities/sponsor-document.entity';
import { SponsorTrustProfileEntity } from '@/entities/sponsor-trust-profile.entity';
import { SuspiciousIPReputationEntity } from '@/entities/suspicious-ip-reputation.entity';
import { SystemLogEntity } from '@/entities/system-log.entity';
import { UserRolePermissionEntity } from '@/entities/user-role-permission.entity';
import { UserSessionEntity } from '@/entities/user-session.entity';
import { VelocityViolationEntity } from '@/entities/velocity-violation.entity';
import { VoteBatchEntity } from '@/entities/vote-batch.entity';
import { VoteReceiptEntity } from '@/entities/vote-receipt.entity';
import { VoteTransactionEntity } from '@/entities/vote-transaction.entity';
import { VpnDetectionEntity } from '@/entities/vpn-detection.entity';
import { WalletVoteCreditEntity } from '@/entities/wallet-vote-credit.entity';
import { WebhookAttemptEntity } from '@/entities/webhook-attempt.entity';
import { WebhookEventEntity } from '@/entities/webhook-event.entity';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  return {
    type: 'postgres',
    host: configService.get('DATABASE_HOST'),
    port: configService.get('DATABASE_PORT'),
    username: configService.get('DATABASE_USER'),
    password: configService.get('DATABASE_PASSWORD'),
    database: configService.get('DATABASE_NAME'),
    // Explicitly list all entities to avoid TypeORM metadata resolution issues
    entities: [
      UserEntity,
      AuthOtpRequestEntity,
      CategoryEntity,
      ContestantEntity,
      EventEntity,
      MediaFileEntity,
      NotificationEntity,
      PaymentEntity,
      VoteEntity,
      VoteWalletEntity,
      TenantEntity,
      AuditLogEntity,
      BlockchainAnchorEntity,
      DeviceEntity,
      DeviceAnomalyEntity,
      DeviceFingerprintEntity,
      DeviceReputationEntity,
      CampaignEntity,
      CampaignReportEntity,
      CampaignSnapshotEntity,
      ContestantIntegrityEntity,
      ContestantTierEntity,
      EnforcementLogEntity,
      EventSponsorEntity,
      ExportEntity,
      FeatureFlagEntity,
      FraudLogEntity,
      MerkleProofEntity,
      ObserverEntity,
      PaymentProviderEntity,
      PaymentWebhookEntity,
      RefundRequestEntity,
      RiskLogEntity,
      SponsorEntity,
      SponsorImpressionEntity,
      SponsorClickEntity,
      SponsorDocumentEntity,
      SponsorTrustProfileEntity,
      SuspiciousIPReputationEntity,
      SystemLogEntity,
      UserRolePermissionEntity,
      UserSessionEntity,
      VelocityViolationEntity,
      VoteBatchEntity,
      VoteReceiptEntity,
      VoteTransactionEntity,
      VpnDetectionEntity,
      WalletVoteCreditEntity,
      WebhookAttemptEntity,
      WebhookEventEntity,
    ],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    migrationsRun: true,
    synchronize: !isProduction && configService.get('DATABASE_SYNCHRONIZE') === 'true',
    logging: configService.get('DATABASE_LOGGING') === 'true',
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    extra: {
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
  };
};
