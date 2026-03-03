import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { FraudLogEntity } from '@/entities/fraud-log.entity';
import { DeviceEntity } from '@/entities/device.entity';
import { DeviceFingerprintEntity } from '@/entities/device-fingerprint.entity';
import { DeviceReputationEntity } from '@/entities/device-reputation.entity';
import { DeviceAnomalyEntity } from '@/entities/device-anomaly.entity';
import { VelocityViolationEntity } from '@/entities/velocity-violation.entity';
import { SuspiciousIPReputationEntity } from '@/entities/suspicious-ip-reputation.entity';
import { VpnDetectionEntity } from '@/entities/vpn-detection.entity';
import { VoteEntity } from '@/entities/vote.entity';
import { FraudDetectionService } from './services/fraud-detection.service';
import { VPNDetectionService } from './services/vpn-detection.service';
import { DeviceFingerprintService } from './services/device-fingerprint.service';
import { DeviceReputationService } from './services/device-reputation.service';
import { AnomalyDetectionService } from './services/anomaly-detection.service';
import { VelocityCheckService } from './services/velocity-check.service';
import { AlertWebhookService } from './services/alert-webhook.service';
import { FraudService } from './fraud.service';
import { FraudController } from './fraud.controller';
import { FraudPublicController } from './fraud-public.controller';
import { FraudMediaController } from './fraud-media.controller';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      FraudLogEntity,
      DeviceEntity,
      DeviceFingerprintEntity,
      DeviceReputationEntity,
      DeviceAnomalyEntity,
      VelocityViolationEntity,
      SuspiciousIPReputationEntity,
      VpnDetectionEntity,
      VoteEntity,
    ]),
  ],
  controllers: [FraudController, FraudPublicController, FraudMediaController],
  providers: [
    FraudService,
    FraudDetectionService,
    VPNDetectionService,
    DeviceFingerprintService,
    DeviceReputationService,
    AnomalyDetectionService,
    VelocityCheckService,
    AlertWebhookService,
  ],
  exports: [
    FraudService,
    FraudDetectionService,
    VPNDetectionService,
    DeviceFingerprintService,
    DeviceReputationService,
    AnomalyDetectionService,
    VelocityCheckService,
    AlertWebhookService,
  ],
})
export class FraudModule {}
