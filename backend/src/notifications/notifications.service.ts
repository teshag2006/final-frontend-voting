import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity, NotificationType } from '@/entities/notification.entity';
import { UserEntity } from '@/entities/user.entity';
import { ContestantEntity } from '@/entities/contestant.entity';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ContestantEntity)
    private contestantRepository: Repository<ContestantEntity>,
    private configService: ConfigService,
  ) {}

  /**
   * Get all notifications (Admin)
   */
  async getAllNotifications(
    page: number = 1,
    limit: number = 20,
    tenantId?: number,
  ): Promise<{ data: NotificationEntity[]; pagination: any }> {
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification');

    if (tenantId !== undefined) {
      queryBuilder.innerJoin('notification.user', 'user')
        .andWhere('user.tenant_id = :tenantId', { tenantId });
    }

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
   * Get user notifications
   */
  async getUserNotifications(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: NotificationEntity[]; pagination: any }> {
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification');
    queryBuilder.where('notification.user_id = :userId', { userId });
    
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
   * Get unread notification count for user
   */
  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { user_id: userId, is_read: false },
    });
  }

  /**
   * Send notification to specific user
   */
  async sendNotification(
    userId: number | undefined,
    role: string | undefined,
    title: string,
    message: string,
    senderId?: number,
    type: NotificationType = NotificationType.SYSTEM_ALERT,
    relatedEntityType?: string,
    relatedEntityId?: number,
    data?: Record<string, any>,
  ): Promise<NotificationEntity> {
    let targetUserId = userId;

    // If role specified, find first user with that role
    if (role && !userId) {
      const user = await this.userRepository.findOne({
        where: { role: role as any },
      });
      if (user) {
        targetUserId = user.id;
      }
    }

    const notification = this.notificationRepository.create({
      user_id: targetUserId,
      title,
      message,
      type,
      is_read: false,
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId,
      data,
    });

    const saved = await this.notificationRepository.save(notification);

    // Try to send external notification (email/SMS)
    if (targetUserId) {
      await this.sendExternalNotification(targetUserId, saved);
    }

    return saved;
  }

  /**
   * Broadcast notification to all users of a specific role
   */
  async broadcastToRole(
    role: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.SYSTEM_ALERT,
    tenantId?: number,
  ): Promise<{ sent: number; failed: number }> {
    const where: Record<string, any> = { role: role as any, is_active: true };
    if (tenantId !== undefined) {
      where.tenant_id = tenantId;
    }
    const users = await this.userRepository.find({ where });

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        await this.sendNotification(
          user.id,
          undefined,
          title,
          message,
          undefined,
          type,
        );
        sent++;
      } catch (error) {
        this.logger.error(`Failed to send notification to user ${user.id}: ${error}`);
        failed++;
      }
    }

    return { sent, failed };
  }

  /**
   * Broadcast to all active users
   */
  async broadcastToAll(
    title: string,
    message: string,
    type: NotificationType = NotificationType.SYSTEM_ALERT,
    tenantId?: number,
  ): Promise<{ sent: number; failed: number }> {
    const where: Record<string, any> = { is_active: true };
    if (tenantId !== undefined) {
      where.tenant_id = tenantId;
    }
    const users = await this.userRepository.find({ where });

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        await this.sendNotification(
          user.id,
          undefined,
          title,
          message,
          undefined,
          type,
        );
        sent++;
      } catch (error) {
        this.logger.error(`Failed to send notification to user ${user.id}: ${error}`);
        failed++;
      }
    }

    return { sent, failed };
  }

  /**
   * Send external notification (Email/SMS)
   */
  private async sendExternalNotification(userId: number, notification: NotificationEntity): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.email) return;

    // Check if user wants email notifications (could be stored in user preferences)
    const sendEmail = this.configService.get('NOTIFICATIONS_EMAIL_ENABLED', false);
    const sendSMS = this.configService.get('NOTIFICATIONS_SMS_ENABLED', false);

    if (sendEmail) {
      await this.sendEmail(user.email, notification.title, notification.message);
    }

    if (sendSMS && user.phone) {
      await this.sendSMS(user.phone, notification.message);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const webhookUrl = String(this.configService.get('NOTIFICATIONS_EMAIL_WEBHOOK_URL') || '').trim();
    if (!webhookUrl) {
      throw new BadRequestException(
        'NOTIFICATIONS_EMAIL_ENABLED is true but NOTIFICATIONS_EMAIL_WEBHOOK_URL is missing',
      );
    }

    const from = String(
      this.configService.get('SMTP_FROM') ||
        this.configService.get('SES_FROM_EMAIL') ||
        this.configService.get('NOTIFICATIONS_FROM_EMAIL') ||
        '',
    ).trim();

    await axios.post(
      webhookUrl,
      {
        channel: 'email',
        to,
        from: from || undefined,
        subject,
        body,
      },
      { timeout: 8000 },
    );
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(phone: string, message: string): Promise<void> {
    const webhookUrl = String(this.configService.get('NOTIFICATIONS_SMS_WEBHOOK_URL') || '').trim();
    if (!webhookUrl) {
      throw new BadRequestException(
        'NOTIFICATIONS_SMS_ENABLED is true but NOTIFICATIONS_SMS_WEBHOOK_URL is missing',
      );
    }

    await axios.post(
      webhookUrl,
      {
        channel: 'sms',
        to: phone,
        message,
      },
      { timeout: 8000 },
    );
  }

  // ============================================
  // AUTO-NOTIFICATION TRIGGERS
  // These methods are called by other services
  // ============================================

  /**
   * Notify contestant of new vote received
   */
  async notifyVoteReceived(contestantId: number, voteId: number, voteCount: number): Promise<NotificationEntity> {
    // Look up the contestant's linked user_id
    const contestant = await this.contestantRepository.findOne({
      where: { id: contestantId },
    });
    const targetUserId = contestant?.user_id;

    return this.sendNotification(
      targetUserId,
      targetUserId ? undefined : 'contestant', // fallback to role if no user_id
      '🎉 New Vote Received!',
      `You received a new vote! Total votes: ${voteCount}`,
      undefined,
      NotificationType.VOTE_RECEIVED,
      'vote',
      voteId,
      { contestantId, voteCount },
    );
  }

  /**
   * Notify voter their vote was verified/blockchain anchored
   */
  async notifyVoteVerified(voterId: number, voteId: number, txHash: string): Promise<NotificationEntity> {
    return this.sendNotification(
      voterId,
      undefined,
      '✅ Vote Verified on Blockchain',
      `Your vote has been verified and anchored. Transaction: ${txHash.substring(0, 10)}...`,
      undefined,
      NotificationType.VOTE_VERIFIED,
      'vote',
      voteId,
      { txHash },
    );
  }

  /**
   * Notify contestant of payment received
   */
  async notifyPaymentSuccess(contestantId: number, paymentId: number, amount: number): Promise<NotificationEntity> {
    return this.sendNotification(
      undefined,
      'contestant',
      '💰 Payment Received!',
      `You received a payment of $${amount.toFixed(2)}`,
      undefined,
      NotificationType.PAYMENT_SUCCESS,
      'payment',
      paymentId,
      { amount },
    );
  }

  /**
   * Notify admin of fraud alert
   */
  async notifyFraudAlert(adminId: number, fraudDetails: {
    type: string;
    ipAddress: string;
    deviceFingerprint: string;
    riskScore: number;
  }): Promise<NotificationEntity> {
    return this.sendNotification(
      adminId,
      undefined,
      '🚨 Fraud Alert Detected!',
      `Suspicious activity detected. Risk Score: ${fraudDetails.riskScore}%`,
      undefined,
      NotificationType.FRAUD_ALERT,
      'fraud',
      undefined,
      fraudDetails,
    );
  }

  /**
   * Notify contestant of ranking change
   */
  async notifyRankingChange(contestantId: number, oldRank: number, newRank: number): Promise<NotificationEntity> {
    const change = oldRank - newRank;
    const direction = change > 0 ? '📈' : '📉';
    
    return this.sendNotification(
      undefined,
      'contestant',
      `${direction} Ranking Update`,
      `Your ranking changed from #${oldRank} to #${newRank}`,
      undefined,
      NotificationType.RANKING_CHANGE,
      'contestant',
      contestantId,
      { oldRank, newRank, change },
    );
  }

  /**
   * Notify all users of event update
   */
  async notifyEventUpdate(eventId: number, eventName: string, message: string): Promise<{ sent: number; failed: number }> {
    return this.broadcastToAll(
      `📅 Event Update: ${eventName}`,
      message,
      NotificationType.EVENT_UPDATE,
    );
  }

  /**
   * Notify admin of system alert
   */
  async notifySystemAlert(adminId: number, alertMessage: string, severity: 'low' | 'medium' | 'high'): Promise<NotificationEntity> {
    const prefix = severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🟢';
    
    return this.sendNotification(
      adminId,
      undefined,
      `${prefix} System Alert`,
      alertMessage,
      undefined,
      NotificationType.SYSTEM_ALERT,
      'system',
      undefined,
      { severity },
    );
  }

  // ============================================
  // MARK AS READ / DELETE
  // ============================================

  /**
   * Mark notification as read
   */
  async markAsRead(id: number): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new BadRequestException('Notification not found');
    }
    notification.is_read = true;
    notification.read_at = new Date();
    return this.notificationRepository.save(notification);
  }

  /**
   * Mark notification as read for specific user
   */
  async markAsReadForUser(id: number, userId: number): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findOne({
      where: { id, user_id: userId },
    });
    if (!notification) {
      throw new BadRequestException('Notification not found');
    }
    notification.is_read = true;
    notification.read_at = new Date();
    return this.notificationRepository.save(notification);
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsReadForUser(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true, read_at: new Date() },
    );
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: number): Promise<void> {
    await this.notificationRepository.delete(id);
  }

  /**
   * Delete old notifications (cleanup)
   */
  async deleteOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .where('created_at < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}
