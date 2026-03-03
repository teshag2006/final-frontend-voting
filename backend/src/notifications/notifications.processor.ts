import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '@/entities/notification.entity';

export interface SendNotificationJobData {
  userId?: number;
  role?: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedEntityType?: string;
  relatedEntityId?: number;
}

export interface BroadcastJobData {
  role?: string;
  title: string;
  message: string;
  type: NotificationType;
  tenantId?: number;
}

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  async process(job: Job<SendNotificationJobData | BroadcastJobData>): Promise<any> {
    this.logger.log(`Processing notification job ${job.id} (${job.name})`);
    try {
      switch (job.name) {
        case 'send': {
          const data = job.data as SendNotificationJobData;
          await this.notificationsService.sendNotification(
            data.userId,
            data.role,
            data.title,
            data.message,
            undefined,
            data.type,
            data.relatedEntityType,
            data.relatedEntityId,
          );
          break;
        }
        case 'broadcast-role': {
          const data = job.data as BroadcastJobData;
          await this.notificationsService.broadcastToRole(
            data.role!,
            data.title,
            data.message,
            data.type,
            data.tenantId,
          );
          break;
        }
        case 'broadcast-all': {
          const data = job.data as BroadcastJobData;
          await this.notificationsService.broadcastToAll(
            data.title,
            data.message,
            data.type,
            data.tenantId,
          );
          break;
        }
        default:
          this.logger.warn(`Unknown notification job name: ${job.name}`);
      }
      return { success: true };
    } catch (error) {
      this.logger.error(`Notification job ${job.id} failed: ${(error as Error).message}`);
      throw error;
    }
  }
}
