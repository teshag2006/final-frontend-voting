import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PaymentEntity } from './payment.entity';

export enum WebhookStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('payment_webhooks')
@Index(['provider'])
@Index(['status'])
@Index(['created_at'])
export class PaymentWebhookEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  provider: string; // 'stripe', 'paypal', 'chapa', etc.

  @Column({ length: 256 })
  event_type: string; // From provider (e.g., 'payment.completed')

  @Column({ nullable: true })
  payment_id: number;

  @Column({ type: 'enum', enum: WebhookStatus, default: WebhookStatus.PENDING })
  status: WebhookStatus;

  @Column({ type: 'jsonb' })
  webhook_payload: Record<string, any>;

  @Column({ nullable: true })
  signature: string; // Provider's signature for verification

  @Column({ nullable: true })
  processed_at: Date;

  @Column({ nullable: true, type: 'text' })
  error_message: string;

  @Column({ default: 0 })
  retry_count: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  // Reverse relation to Payment
  @ManyToOne(() => PaymentEntity, (payment) => payment.webhooks, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment: PaymentEntity;
}
