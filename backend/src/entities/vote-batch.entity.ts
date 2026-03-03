import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { EventEntity } from './event.entity';
import { VoteEntity } from './vote.entity';

export enum BatchStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  VERIFIED = 'verified',
  ARCHIVED = 'archived',
}

@Entity('vote_batches')
@Index(['event_id'])
@Index(['status'])
@Index(['created_at'])
export class VoteBatchEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  event_id: number;

  @ManyToOne(() => EventEntity, (event) => event.batches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;

  @Column({
    name: 'status',
    type: 'enum',
    enum: BatchStatus,
    default: BatchStatus.OPEN,
  })
  status: BatchStatus;

  // Backward compatibility alias (not persisted in DB)
  get batch_status(): BatchStatus {
    return this.status;
  }

  set batch_status(value: BatchStatus) {
    this.status = value;
  }

  @Column({ name: 'total_votes', default: 0 })
  vote_count: number;

  @Column({ nullable: true, length: 256 })
  merkle_root: string;

  @Column({ nullable: true })
  parent_batch_id: number;

  @Column({ nullable: true })
  batch_number: number;

  @Column({ name: 'batch_size', default: 100 })
  batch_size: number;

  @Column({ type: 'text', nullable: true })
  batch_hash: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ nullable: true })
  closed_at: Date;

  @Column({ nullable: true })
  verified_at: Date;

  // Compatibility field (not persisted in DB)
  updated_at?: Date;

  @OneToMany(() => VoteEntity, (vote) => vote.batch, {
    onDelete: 'SET NULL',
  })
  votes: VoteEntity[];
}
