import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ContestantEntity } from './contestant.entity';

export enum ContestantTierLevel {
  A = 'A',
  B = 'B',
  C = 'C',
}

@Entity('contestant_tiers')
@Index(['contestant_id'], { unique: true })
@Index(['tier_level'])
export class ContestantTierEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'contestant_id' })
  contestant_id: number;

  @OneToOne(() => ContestantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contestant_id' })
  contestant: ContestantEntity;

  @Column({ name: 'tier_level', type: 'enum', enum: ContestantTierLevel, default: ContestantTierLevel.C })
  tier_level: ContestantTierLevel;

  @CreateDateColumn({ name: 'assigned_at' })
  assigned_at: Date;
}
