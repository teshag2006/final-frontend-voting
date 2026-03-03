import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { PaymentEntity } from './payment.entity';

export enum RefundStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSED = 'processed',
  FAILED = 'failed',
}

@Entity('refund_requests')
@Index(['payment_id'])
@Index(['user_id'])
@Index(['status'])
@Index(['created_at'])
export class RefundRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  payment_id: number;

  @ManyToOne(() => PaymentEntity, { onDelete: 'CASCADE' })
  payment: PaymentEntity;

  @Column()
  user_id: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column({ type: 'enum', enum: RefundStatus, default: RefundStatus.PENDING })
  status: RefundStatus;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  refund_amount: number;

  @Column({ nullable: true })
  reason: string;

  // Compatibility field (not persisted in canonical SQL)
  description?: string;

  @Column({ name: 'approved_by', type: 'integer', nullable: true })
  approved_by_user_id: number;

  @Column({ name: 'rejected_by', type: 'integer', nullable: true })
  rejected_by_user_id: number | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejection_reason: string | null;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejected_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  processed_at: Date;

  // Compatibility field (not persisted in canonical SQL)
  refund_transaction_id?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
