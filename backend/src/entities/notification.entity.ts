import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

export enum NotificationType {
  VOTE_RECEIVED = 'vote_received',
  VOTE_VERIFIED = 'vote_verified',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  FRAUD_ALERT = 'fraud_alert',
  RANKING_CHANGE = 'ranking_change',
  EVENT_UPDATE = 'event_update',
  SYSTEM_ALERT = 'system_alert',
}

@Entity('notifications')
@Index(['user_id'])
@Index(['type'])
@Index(['is_read'])
@Index(['created_at'])
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'notification_type', type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true })
  related_entity_type: string; // 'vote', 'payment', 'event', etc.

  @Column({ nullable: true })
  related_entity_id: number;

  @Column({ default: false })
  is_read: boolean;

  @Column({ nullable: true })
  read_at: Date;

  @Column({ name: 'action_url', nullable: true })
  action_url: string;

  @Column({ nullable: true })
  priority: string;

  @Column({ nullable: true })
  expires_at: Date;

  // Compatibility payload field used by services; not persisted in current SQL schema.
  data?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
