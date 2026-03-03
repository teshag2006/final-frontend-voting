import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ContestantEntity } from './contestant.entity';

export enum ContestantIntegrityStatus {
  NORMAL = 'normal',
  SUSPICIOUS = 'suspicious',
  UNDER_REVIEW = 'under_review',
}

@Entity('contestant_integrity')
@Index(['contestant_id'], { unique: true })
@Index(['status'])
export class ContestantIntegrityEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'contestant_id' })
  contestant_id: number;

  @OneToOne(() => ContestantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contestant_id' })
  contestant: ContestantEntity;

  @Column({ name: 'follower_spike_flag', default: false })
  follower_spike_flag: boolean;

  @Column({ name: 'vote_spike_flag', default: false })
  vote_spike_flag: boolean;

  @Column({ name: 'engagement_ratio', type: 'numeric', precision: 8, scale: 4, default: '0' })
  engagement_ratio: number;

  @Column({ name: 'suspicious_activity_score', type: 'numeric', precision: 6, scale: 2, default: '0' })
  suspicious_activity_score: number;

  @Column({ name: 'integrity_score', type: 'numeric', precision: 5, scale: 2, default: '100' })
  integrity_score: number;

  @Column({
    type: 'enum',
    enum: ContestantIntegrityStatus,
    default: ContestantIntegrityStatus.NORMAL,
  })
  status: ContestantIntegrityStatus;

  @Column({ name: 'total_followers', type: 'integer', default: 0 })
  total_followers: number;

  @Column({ name: 'follower_growth_24h', type: 'numeric', precision: 10, scale: 2, default: '0' })
  follower_growth_24h: number;

  @Column({ name: 'follower_growth_7d', type: 'numeric', precision: 10, scale: 2, default: '0' })
  follower_growth_7d: number;

  @Column({ name: 'engagement_rate', type: 'numeric', precision: 8, scale: 4, default: '0' })
  engagement_rate: number;

  @Column({ name: 'engagement_spike_factor', type: 'numeric', precision: 8, scale: 4, default: '0' })
  engagement_spike_factor: number;

  @Column({ name: 'vote_velocity_24h', type: 'numeric', precision: 10, scale: 2, default: '0' })
  vote_velocity_24h: number;

  @Column({ name: 'vote_velocity_7d', type: 'numeric', precision: 10, scale: 2, default: '0' })
  vote_velocity_7d: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
