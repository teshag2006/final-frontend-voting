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
import { UserEntity } from './user.entity';
import { CategoryEntity } from './category.entity';
import { ContestantEntity } from './contestant.entity';
import { VoteEntity } from './vote.entity';
import { PaymentEntity } from './payment.entity';
import { VoteBatchEntity } from './vote-batch.entity';
import { TenantEntity } from './tenant.entity';

export enum EventStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('events')
@Index(['creator_id'])
@Index(['status'])
@Index(['created_at'])
@Index(['slug'])
@Index(['tenant_id'])
@Index(['tenant_id', 'slug'], { unique: true })
export class EventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true, length: 255 })
  tagline: string;

  @Column({ nullable: true, length: 255 })
  organizer_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  vote_price: number;

  @Column({ nullable: true })
  max_votes_per_transaction: number;

  @Column({ type: 'jsonb', nullable: true })
  vote_packages: { votes: number; price: number; label: string }[];

  @Column()
  slug: string;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.DRAFT })
  status: EventStatus;

  @Column()
  season: number;

  @Column({ name: 'start_date' })
  start_date: Date;

  @Column({ name: 'end_date' })
  end_date: Date;

  @Column({ name: 'voting_start' })
  voting_start: Date;

  @Column({ name: 'voting_end' })
  voting_end: Date;

  @Column({ default: 'UTC' })
  timezone: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @ManyToOne(() => TenantEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;

  @Column({ name: 'tenant_id' })
  tenant_id: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creator_id' })
  creator: UserEntity;

  @Column({ name: 'creator_id' })
  creator_id: number;

  @Column({ name: 'featured_image_url', nullable: true })
  featured_image_url: string;

  @Column({ name: 'banner_image_url', nullable: true })
  banner_image_url: string;

  @Column({ type: 'text', nullable: true })
  rules: string;

  @Column({ name: 'terms_conditions', type: 'text', nullable: true })
  terms_conditions: string;

  @Column({ name: 'max_contestants', default: 100 })
  max_contestants: number;

  @Column({ name: 'min_age', default: 18 })
  min_age: number;

  @Column({ name: 'max_votes_per_user', nullable: true })
  max_votes_per_user: number;

  @Column({ name: 'max_daily_votes_per_user', nullable: true })
  max_daily_votes_per_user: number;

  @Column({ name: 'daily_spending_cap', type: 'decimal', precision: 10, scale: 2, nullable: true })
  daily_spending_cap: number;

  @Column({ name: 'allow_international', default: false })
  allow_international: boolean;

  @Column({ name: 'verification_required', default: true })
  verification_required: boolean;

  // Additional virtual fields used in services
  get voting_rules(): string {
    return this.rules;
  }

  set voting_rules(value: string) {
    this.rules = value;
  }

  get is_live(): boolean {
    return this.status === EventStatus.ACTIVE;
  }

  get season_year(): number {
    return this.season;
  }

  get location(): string {
    return [this.city, this.country].filter(Boolean).join(', ');
  }

  allow_write_ins = false;
  is_public = true;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @OneToMany(() => CategoryEntity, (category) => category.event, {
    onDelete: 'CASCADE',
    eager: false,
  })
  categories: CategoryEntity[];

  @OneToMany(() => ContestantEntity, (contestant) => contestant.event, {
    onDelete: 'CASCADE',
    eager: false,
  })
  contestants: ContestantEntity[];

  @OneToMany(() => VoteEntity, (vote) => vote.event, {
    onDelete: 'CASCADE',
    eager: false,
  })
  votes: VoteEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.event, {
    onDelete: 'CASCADE',
    eager: false,
  })
  payments: PaymentEntity[];

  @OneToMany(() => VoteBatchEntity, (batch) => batch.event, {
    onDelete: 'CASCADE',
    eager: false,
  })
  batches: VoteBatchEntity[];
}

