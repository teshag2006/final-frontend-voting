import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { NotificationEntity } from '@/entities/notification.entity';
import { UserEntity } from '@/entities/user.entity';
import { ContestantEntity } from '@/entities/contestant.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from './notifications.processor';
import { NotificationsAdminController } from './notifications.controller';
import { NotificationsContestantController } from './notifications.controller';
import { PublicNotificationsController } from './notifications.controller';
import { NotificationsPriorityController } from './notifications.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity, UserEntity, ContestantEntity]),
    BullModule.registerQueue({ name: 'notifications' }),
  ],
  controllers: [
    NotificationsAdminController,
    NotificationsContestantController,
    NotificationsPriorityController,
    PublicNotificationsController,
  ],
  providers: [NotificationsService, NotificationsProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
