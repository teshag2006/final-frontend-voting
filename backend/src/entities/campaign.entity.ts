import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SponsorEntity } from './sponsor.entity';
import { ContestantEntity } from './contestant.entity';

export enum CampaignType {
  BANNER = 'banner',
  VIDEO = 'video',
  SOCIAL_LINK = 'social_link',
}

export enum CampaignStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum CampaignPaymentStatus {
  PENDING = 'pending',
  CONFIRMED_MANUAL = 'confirmed_manual',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('campaigns')
@Index(['sponsor_id'])
@Index(['contestant_id'])
@Index(['campaign_status'])
@Index(['payment_status'])
export class CampaignEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sponsor_id' })
  sponsor_id: number;

  @ManyToOne(() => SponsorEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'sponsor_id' })
  sponsor: SponsorEntity;

  @Column({ name: 'contestant_id' })
  contestant_id: number;

  @ManyToOne(() => ContestantEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'contestant_id' })
  contestant: ContestantEntity;

  @Column({ name: 'campaign_type', type: 'enum', enum: CampaignType })
  campaign_type: CampaignType;

  @Column({ type: 'text', nullable: true })
  deliverables: string | null;

  @Column({ name: 'agreed_price', type: 'numeric', precision: 12, scale: 2, default: '0' })
  agreed_price: number;

  @Column({ name: 'commission_amount', type: 'numeric', precision: 12, scale: 2, default: '0' })
  commission_amount: number;

  @Column({ name: 'start_date', type: 'timestamp', nullable: true })
  start_date: Date | null;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  end_date: Date | null;

  @Column({ name: 'campaign_status', type: 'enum', enum: CampaignStatus, default: CampaignStatus.PENDING })
  campaign_status: CampaignStatus;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: CampaignPaymentStatus,
    default: CampaignPaymentStatus.PENDING,
  })
  payment_status: CampaignPaymentStatus;

  @Column({ name: 'activation_snapshot_taken', default: false })
  activation_snapshot_taken: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
