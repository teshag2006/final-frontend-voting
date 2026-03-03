import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  VIEW = 'view',
  EXPORT = 'export',
}

@Entity('audit_logs')
@Index(['user_id'])
@Index(['action'])
@Index(['created_at'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'admin_id', nullable: true })
  user_id: number;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admin_id' })
  user: UserEntity;

  @Column({ type: 'varchar', length: 100 })
  action: AuditAction;

  @Column({ name: 'entity_type', length: 100, nullable: true })
  resource_type: string; // 'event', 'vote', 'user', etc.

  @Column({ name: 'entity_id', nullable: true })
  resource_id: number;

  @Column({ nullable: true, length: 45 })
  ip_address: string;

  @Column({ nullable: true })
  user_agent: string;

  @Column({ type: 'jsonb', nullable: true })
  changes: Record<string, any>; // Before/after values

  @Column({ name: 'reason', type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
