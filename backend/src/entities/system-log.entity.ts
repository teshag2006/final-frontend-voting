import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

@Entity('system_logs')
@Index(['level'])
@Index(['created_at'])
export class SystemLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'type', type: 'enum', enum: LogLevel })
  level: LogLevel;

  @Column({ type: 'text' })
  message: string;

  // Legacy compatibility field (not persisted)
  context?: string;

  @Column({ nullable: true })
  user_id: number;

  @Column({ nullable: true, length: 45 })
  ip_address: string;

  @Column({ name: 'details', type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Legacy compatibility field (not persisted)
  stack_trace?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  // Canonical system_logs has no updated_at column.
  updated_at?: Date;
}
