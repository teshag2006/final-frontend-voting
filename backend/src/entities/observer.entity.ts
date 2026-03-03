import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { EventEntity } from './event.entity';

export enum ObserverStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REMOVED = 'removed',
}

@Entity('observers')
@Index(['user_id'])
@Index(['event_id'])
@Index(['status'])
@Index(['created_at'])
export class ObserverEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column()
  event_id: number;

  @ManyToOne(() => EventEntity, { onDelete: 'CASCADE' })
  event: EventEntity;

  @Column({ type: 'enum', enum: ObserverStatus, default: ObserverStatus.PENDING })
  status: ObserverStatus;

  @Column({ type: 'text', nullable: true })
  organization: string;

  @Column({ type: 'text', nullable: true })
  credentials: string;

  @Column({ nullable: true })
  approved_at: Date;

  @Column({ nullable: true })
  approved_by_user_id: number;

  @Column({ type: 'jsonb', nullable: true })
  access_logs: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
