import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { SystemLogEntity } from '@/entities/system-log.entity';
import { AppSettingEntity } from '@/entities/app-setting.entity';
import { FeatureFlagEntity } from '@/entities/feature-flag.entity';
import { PaymentWebhookEntity } from '@/entities/payment-webhook.entity';
import { NotificationEntity } from '@/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemLogEntity,
      AppSettingEntity,
      FeatureFlagEntity,
      PaymentWebhookEntity,
      NotificationEntity,
    ]),
  ],
  providers: [SystemService],
  controllers: [SystemController],
  exports: [SystemService],
})
export class SystemModule {}
