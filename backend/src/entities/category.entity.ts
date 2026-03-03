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
import { ContestantEntity } from './contestant.entity';
import { VoteEntity } from './vote.entity';

@Entity('categories')
@Index(['event_id'])
@Index(['event_id', 'slug'], { unique: true })
@Index(['voting_enabled'])
@Index(['created_at'])
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EventEntity, (event) => event.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;

  @Column()
  event_id: number;

  @Column()
  name: string;

  @Column({ nullable: true, length: 255 })
  slug: string | null;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ default: 0 })
  category_order: number;

  @Column({ default: true })
  voting_enabled: boolean;

  @Column({ default: true })
  public_voting: boolean;

  @Column({ default: false })
  paid_voting: boolean;

  @Column({ type: 'numeric', default: '0.00' })
  minimum_vote_amount: number;

  @Column({ default: false })
  accept_write_ins: boolean;

  @Column({ nullable: true })
  daily_vote_limit: number;

  @Column({ nullable: true })
  max_votes_per_user: number;

  // Virtual scheduling fields used by services/tests; not physical columns in canonical SQL.
  voting_start?: Date;
  voting_end?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => ContestantEntity, (contestant) => contestant.category, {
    onDelete: 'CASCADE',
    eager: false,
  })
  contestants: ContestantEntity[];

  @OneToMany(() => VoteEntity, (vote) => vote.category, {
    onDelete: 'CASCADE',
    eager: false,
  })
  votes: VoteEntity[];
}
