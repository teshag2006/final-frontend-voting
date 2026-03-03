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
import { DeviceEntity } from './device.entity';
import { PaymentEntity } from './payment.entity';
import { VoteReceiptEntity } from './vote-receipt.entity';
import { FraudLogEntity } from './fraud-log.entity';
import { VoteBatchEntity } from './vote-batch.entity';
import { MerkleProofEntity } from './merkle-proof.entity';

export enum VoteType {
  FREE = 'free',
  PAID = 'paid',
}

export enum VoteStatus {
  PENDING = 'pending',
  VALID = 'valid',
  INVALID = 'invalid',
  FRAUD_SUSPECTED = 'fraud_suspected',
  CANCELLED = 'cancelled',
}

export enum FraudRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity('votes')
@Index(['event_id'])
@Index(['category_id'])
@Index(['contestant_id'])
@Index(['voter_id'])
@Index(['status'])
@Index(['fraud_risk_level'])
@Index(['created_at'])
export class VoteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EventEntity, (event) => event.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;

  @Column({ name: 'event_id' })
  event_id: number;

  @ManyToOne(() => CategoryEntity, (category) => category.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @Column({ name: 'category_id' })
  category_id: number;

  @ManyToOne(() => ContestantEntity, (contestant) => contestant.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contestant_id' })
  contestant: ContestantEntity;

  @Column({ name: 'contestant_id' })
  contestant_id: number;

  @ManyToOne(() => UserEntity, (user) => user.votes, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'voter_id' })
  voter: UserEntity;

  @Column({ name: 'voter_id', nullable: true })
  voter_id: number;

  @Column({ name: 'anonymous_voter_id', type: 'varchar', nullable: true })
  anonymous_voter_id: string | null;

  @Column({ type: 'enum', enum: VoteType, default: VoteType.FREE, name: 'vote_type' })
  vote_type: VoteType;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'enum', enum: VoteStatus, default: VoteStatus.PENDING })
  status: VoteStatus;

  @ManyToOne(() => DeviceEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'device_id' })
  device: DeviceEntity;

  @Column({ name: 'device_id', nullable: true })
  device_id: number;

  @Column({ name: 'device_fingerprint_id', nullable: true })
  device_fingerprint_id: number;

  @Column({ name: 'ip_address', nullable: true })
  ip_address: string;

  @Column({ name: 'location_id', nullable: true })
  location_id: number;

  @Column({ name: 'reported_timezone', nullable: true })
  reported_timezone: string;

  @Column({ name: 'velocity_check_passed', default: true })
  velocity_check_passed: boolean;

  @Column({ name: 'fraud_check_passed', default: true })
  fraud_check_passed: boolean;

  @Column({ type: 'numeric', precision: 3, scale: 2, nullable: true, name: 'trust_score' })
  trust_score: number;

  @Column({ type: 'enum', enum: FraudRiskLevel, default: FraudRiskLevel.LOW, name: 'fraud_risk_level' })
  fraud_risk_level: FraudRiskLevel;

  @Column({ type: 'jsonb', nullable: true, name: 'anomaly_flags' })
  anomaly_flags: any;

  @ManyToOne(() => PaymentEntity, (payment) => payment.votes, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment: PaymentEntity;

  @Column({ name: 'payment_id', nullable: true })
  payment_id: number;

  @Column({ name: 'payment_verified', default: false })
  payment_verified: boolean;

  @Column({ name: 'receipt_id', nullable: true })
  receipt_id: string;

  @Column({ name: 'receipt_signature', nullable: true, type: 'text' })
  receipt_signature: string;

  @Column({ name: 'receipt_generated_at', nullable: true })
  receipt_generated_at: Date;

  @Column({ name: 'receipt_url', nullable: true })
  receipt_url: string;

  @Column({ name: 'receipt_verified', default: false })
  receipt_verified: boolean;

  @Column({ name: 'merkle_batch_id', nullable: true })
  merkle_batch_id: string | null;

  @ManyToOne(() => VoteBatchEntity, (batch) => batch.votes, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'merkle_batch_id', referencedColumnName: 'batch_hash' })
  batch: VoteBatchEntity;

  // Backward compatibility alias (not persisted in DB)
  get batch_id(): string | null {
    return this.merkle_batch_id;
  }

  set batch_id(value: string | null) {
    this.merkle_batch_id = value;
  }

  // Backward compatibility alias (not persisted in DB)
  get is_anonymous(): boolean {
    return !!this.anonymous_voter_id;
  }

  set is_anonymous(value: boolean) {
    if (!value) {
      this.anonymous_voter_id = null;
    }
  }

  // Compatibility field (not persisted in DB)
  fraud_risk_score?: number;

  // Compatibility fields (not persisted in DB)
  voter_country?: string;
  user_agent?: string;

  @Column({ name: 'vote_hash', nullable: true })
  vote_hash: string;

  @Column({ name: 'is_signed', default: false })
  is_signed: boolean;

  @Column({ name: 'voting_timestamp' })
  voting_timestamp: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @OneToMany(() => VoteReceiptEntity, (receipt) => receipt.vote, {
    onDelete: 'CASCADE',
    eager: false,
  })
  receipts: VoteReceiptEntity[];

  @OneToMany(() => FraudLogEntity, (fraudLog) => fraudLog.vote, {
    onDelete: 'CASCADE',
    eager: false,
  })
  fraud_logs: FraudLogEntity[];

  @OneToMany(() => MerkleProofEntity, (merkleProof) => merkleProof.vote, {
    onDelete: 'CASCADE',
    eager: false,
  })
  merkle_proofs: MerkleProofEntity[];
}
