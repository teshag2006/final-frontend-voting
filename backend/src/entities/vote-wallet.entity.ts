import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('vote_wallets')
@Index(['user_id'])
@Index(['event_id'])
@Index(['category_id'])
@Index(['user_id', 'event_id', 'category_id'], { unique: true })
export class VoteWalletEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  user_id: number;

  @Column({ type: 'integer' })
  event_id: number;

  @Column({ type: 'integer' })
  category_id: number;

  @Column({ default: false })
  free_vote_used: boolean;

  @Column({ type: 'integer', default: 0 })
  paid_votes_purchased: number;

  @Column({ type: 'integer', default: 0 })
  paid_votes_used: number;

  @Column({ type: 'integer', default: 0 })
  daily_paid_used: number;

  @Column({ type: 'timestamp', nullable: true })
  last_vote_at: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

