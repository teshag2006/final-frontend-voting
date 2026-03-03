import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { CampaignEntity } from './campaign.entity';

@Entity('campaign_reports')
@Index(['campaign_id'], { unique: true })
export class CampaignReportEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'campaign_id' })
  campaign_id: number;

  @OneToOne(() => CampaignEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: CampaignEntity;

  @Column({ name: 'votes_after', type: 'integer', default: 0 })
  votes_after: number;

  @Column({ name: 'followers_after', type: 'integer', default: 0 })
  followers_after: number;

  @Column({ name: 'engagement_after', type: 'numeric', precision: 8, scale: 4, default: '0' })
  engagement_after: number;

  @Column({ name: 'growth_summary', type: 'jsonb', nullable: true })
  growth_summary: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'generated_at' })
  generated_at: Date;
}
