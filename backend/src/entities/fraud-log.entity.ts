import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { VoteEntity } from './vote.entity';
import { UserEntity } from './user.entity';
import { DeviceEntity } from './device.entity';
import { EventEntity } from './event.entity';

export enum FraudSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('fraud_logs')
@Index(['severity'])
@Index(['vote_id'])
@Index(['device_id'])
@Index(['user_id'])
@Index(['created_at'])
export class FraudLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  event_id: number;

  @ManyToOne(() => EventEntity, { onDelete: 'CASCADE' })
  event: EventEntity;

  @Column({ nullable: true })
  vote_id: number;

  @ManyToOne(() => VoteEntity, (vote) => vote.fraud_logs, {
    onDelete: 'SET NULL',
  })
  vote: VoteEntity;

  @Column({ nullable: true })
  user_id: number;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  user: UserEntity;

  @Column({ nullable: true })
  device_id: number;

  @ManyToOne(() => DeviceEntity, { onDelete: 'SET NULL' })
  device: DeviceEntity;

  @Column({ length: 100 })
  fraud_type: string;

  @Column({ type: 'enum', enum: FraudSeverity, default: FraudSeverity.MEDIUM })
  severity: FraudSeverity;

  // Compatibility field (not persisted in canonical SQL)
  fraud_score?: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'evidence', type: 'jsonb', nullable: true })
  fraud_details: Record<string, any>;

  @Column({ name: 'action_taken', type: 'varchar', length: 100, nullable: true })
  action_taken: string | null;

  @Column({ name: 'action_timestamp', type: 'timestamp', nullable: true })
  action_timestamp: Date | null;

  @Column({ default: false })
  is_resolved: boolean;

  @Column({ name: 'resolved_by', type: 'integer', nullable: true })
  resolved_by_user_id: number;

  // Compatibility field (not persisted in canonical SQL)
  resolution_notes?: string;

  // Compatibility field (not persisted in canonical SQL)
  resolved_at?: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  // Canonical table has no updated_at column.
  updated_at?: Date;
}
