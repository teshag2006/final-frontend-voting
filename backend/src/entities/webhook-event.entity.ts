import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { WebhookAttemptEntity } from './webhook-attempt.entity';

export enum WebhookStatus {
  RECEIVED = 'received',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
  RETRYING = 'retrying',
}

@Entity('webhook_events')
@Index(['event_type'])
@Index(['provider'])
@Index(['status'])
@Index(['created_at'])
export class WebhookEventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'event_type', type: 'varchar', length: 100 })
  event_type: string;

  @Column({ name: 'provider', type: 'varchar', length: 50 })
  provider: string;

  @Column({ name: 'external_event_id', type: 'varchar', length: 255, nullable: true })
  external_event_id: string | null;

  @Column({ name: 'payload', type: 'jsonb' })
  payload: Record<string, any>;

  @Column({
    name: 'status',
    type: 'enum',
    enum: WebhookStatus,
    default: WebhookStatus.RECEIVED,
  })
  status: WebhookStatus;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processed_at: Date | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  error_message: string | null;

  @Column({ name: 'retry_count', type: 'integer', default: 0 })
  retry_count: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @OneToMany(() => WebhookAttemptEntity, (attempt) => attempt.webhook_event, {
    eager: false,
  })
  attempts: WebhookAttemptEntity[];
}
