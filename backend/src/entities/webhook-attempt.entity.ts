import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { WebhookEventEntity } from './webhook-event.entity';

@Entity('webhook_attempts')
@Index(['webhook_event_id'])
@Index(['created_at'])
export class WebhookAttemptEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'webhook_event_id', type: 'integer' })
  webhook_event_id: number;

  @ManyToOne(() => WebhookEventEntity, (event) => event.attempts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'webhook_event_id' })
  webhook_event: WebhookEventEntity;

  @Column({ name: 'attempt_number', type: 'integer', nullable: true })
  attempt_number: number | null;

  @Column({ name: 'endpoint_url', type: 'varchar', length: 512, nullable: true })
  endpoint_url: string | null;

  @Column({ name: 'http_status_code', type: 'integer', nullable: true })
  http_status_code: number | null;

  @Column({ name: 'response_time_ms', type: 'integer', nullable: true })
  response_time_ms: number | null;

  @Column({ name: 'success', default: false })
  success: boolean;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  error_message: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
