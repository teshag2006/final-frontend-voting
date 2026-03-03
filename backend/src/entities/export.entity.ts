import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { EventEntity } from './event.entity';
import { UserEntity } from './user.entity';

export enum ExportStatus {
  GENERATING = 'generating',
  READY = 'ready',
  EXPIRED = 'expired',
  FAILED = 'failed',
}

@Entity('exports')
@Index(['event_id'])
@Index(['created_by'])
@Index(['export_status'])
@Index(['created_at'])
export class ExportEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'event_id' })
  event_id: number;

  @ManyToOne(() => EventEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;

  @Column({ name: 'created_by', type: 'integer', nullable: true })
  created_by: number | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: UserEntity | null;

  @Column({ name: 'export_type', nullable: true, type: 'varchar', length: 50 })
  export_type: string | null;

  @Column({ name: 'file_format', nullable: true, type: 'varchar', length: 10 })
  file_format: string | null;

  @Column({ name: 'file_url', nullable: true, type: 'varchar', length: 512 })
  file_url: string | null;

  @Column({ name: 'file_size', type: 'integer', nullable: true })
  file_size: number | null;

  @Column({
    name: 'export_status',
    type: 'enum',
    enum: ExportStatus,
    default: ExportStatus.GENERATING,
  })
  export_status: ExportStatus;

  @Column({ name: 'rows_exported', type: 'integer', nullable: true })
  rows_exported: number | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expires_at: Date | null;

  @Column({ name: 'downloaded_at', type: 'timestamp', nullable: true })
  downloaded_at: Date | null;
}
