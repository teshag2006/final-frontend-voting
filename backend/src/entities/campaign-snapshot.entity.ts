import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { CampaignEntity } from './campaign.entity';
import { ContestantEntity } from './contestant.entity';

@Entity('campaign_snapshots')
@Index(['campaign_id'], { unique: true })
@Index(['contestant_id'])
export class CampaignSnapshotEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'campaign_id' })
  campaign_id: number;

  @OneToOne(() => CampaignEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: CampaignEntity;

  @Column({ name: 'contestant_id' })
  contestant_id: number;

  @ManyToOne(() => ContestantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contestant_id' })
  contestant: ContestantEntity;

  @Column({ name: 'votes_before', type: 'integer', default: 0 })
  votes_before: number;

  @Column({ name: 'followers_before', type: 'integer', default: 0 })
  followers_before: number;

  @Column({ name: 'engagement_before', type: 'numeric', precision: 8, scale: 4, default: '0' })
  engagement_before: number;

  @Column({ name: 'rank_before', type: 'integer', nullable: true })
  rank_before: number | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
