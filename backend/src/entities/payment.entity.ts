import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { EventEntity } from './event.entity';
import { CategoryEntity } from './category.entity';
import { ContestantEntity } from './contestant.entity';
import { UserEntity } from './user.entity';
import { VoteEntity } from './vote.entity';
import { RefundRequestEntity } from './refund-request.entity';
import { PaymentWebhookEntity } from './payment-webhook.entity';

export enum PaymentProvider {
  TELEBIRR = 'telebirr',
  SANTIMPAY = 'santimpay',
  PAYPAL = 'paypal',
  CHAPA = 'chapa',
  STRIPE = 'stripe',
  CRYPTO = 'crypto',
  MANUAL = 'manual',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
}

@Entity('payments')
@Index(['voter_id'])
@Index(['event_id'])
@Index(['status'])
@Index(['provider'])
@Index(['created_at'])
export class PaymentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.payments, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'voter_id' })
  voter: UserEntity;

  @Column({ name: 'voter_id', nullable: true })
  voter_id: number;

  @ManyToOne(() => EventEntity, (event) => event.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;

  @Column({ name: 'event_id' })
  event_id: number;

  @ManyToOne(() => CategoryEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @Column({ name: 'category_id' })
  category_id: number;

  @ManyToOne(() => ContestantEntity, (contestant) => contestant.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contestant_id' })
  contestant: ContestantEntity;

  @Column({ name: 'contestant_id' })
  contestant_id: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'ETB' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentProvider, default: PaymentProvider.TELEBIRR })
  provider: PaymentProvider;

  @Column({ name: 'provider_tx_id', nullable: true })
  provider_tx_id: string;

  @Column({ name: 'transaction_reference', nullable: true })
  transaction_reference: string;

  @Column({ default: 1 })
  votes_purchased: number;

  @Column({ name: 'payer_ip', nullable: true })
  payer_ip: string;

  @Column({ name: 'user_agent', nullable: true, type: 'text' })
  user_agent: string;

  @Column({ name: 'provider_reference', nullable: true })
  provider_reference: string;

  @Column({ name: 'failure_reason', nullable: true })
  failure_reason: string;

  @Column({ name: 'completed_at', nullable: true })
  completed_at: Date;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ name: 'payment_method', nullable: true })
  payment_method: string;

  @Column({ name: 'webhook_event_id', nullable: true })
  webhook_event_id: number;

  @Column({ name: 'webhook_signature_valid', default: false })
  webhook_signature_valid: boolean;

  @Column({ name: 'received_at', default: () => 'CURRENT_TIMESTAMP' })
  received_at: Date;

  @Column({ name: 'verification_status', type: 'enum', enum: PaymentVerificationStatus, default: PaymentVerificationStatus.PENDING })
  verification_status: PaymentVerificationStatus;

  @Column({ name: 'verification_attempts', default: 0 })
  verification_attempts: number;

  @Column({ name: 'verified_at', nullable: true })
  verified_at: Date;

  @Column({ default: false })
  reconciled: boolean;

  @Column({ name: 'reconciliation_notes', nullable: true })
  reconciliation_notes: string;

  @Column({ name: 'refund_requested', default: false })
  refund_requested: boolean;

  @Column({ name: 'refund_reason', nullable: true })
  refund_reason: string;

  @Column({ name: 'refund_amount', type: 'numeric', precision: 10, scale: 2, nullable: true })
  refund_amount: number;

  @Column({ name: 'refunded_at', nullable: true })
  refunded_at: Date;

  @Column({ name: 'refund_transaction_id', nullable: true })
  refund_transaction_id: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @OneToMany(() => VoteEntity, (vote) => vote.payment, {
    onDelete: 'CASCADE',
    eager: false,
  })
  votes: VoteEntity[];

  @OneToMany(() => RefundRequestEntity, (refund) => refund.payment, {
    onDelete: 'CASCADE',
    eager: false,
  })
  refunds: RefundRequestEntity[];

  @OneToMany(() => PaymentWebhookEntity, (webhook) => webhook.payment, {
    onDelete: 'CASCADE',
    eager: false,
  })
  webhooks: PaymentWebhookEntity[];
}
