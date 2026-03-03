import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { SponsorEntity } from './sponsor.entity';

export enum SponsorTrustStatus {
  VERIFIED = 'verified',
  NEW = 'new',
  FLAGGED = 'flagged',
}

@Entity('sponsor_trust_profiles')
@Index(['sponsor_id'], { unique: true })
@Index(['status'])
export class SponsorTrustProfileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sponsor_id' })
  sponsor_id: number;

  @OneToOne(() => SponsorEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sponsor_id' })
  sponsor: SponsorEntity;

  @Column({ name: 'total_campaigns', type: 'integer', default: 0 })
  total_campaigns: number;

  @Column({ name: 'completed_campaigns', type: 'integer', default: 0 })
  completed_campaigns: number;

  @Column({ name: 'cancelled_campaigns', type: 'integer', default: 0 })
  cancelled_campaigns: number;

  @Column({ name: 'late_payment_count', type: 'integer', default: 0 })
  late_payment_count: number;

  @Column({ name: 'trust_score', type: 'numeric', precision: 5, scale: 2, default: '0' })
  trust_score: number;

  @Column({ type: 'enum', enum: SponsorTrustStatus, default: SponsorTrustStatus.NEW })
  status: SponsorTrustStatus;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
