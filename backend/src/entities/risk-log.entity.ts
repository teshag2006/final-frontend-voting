import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('risk_logs')
@Index(['user_id'])
@Index(['event_id'])
@Index(['risk_type'])
@Index(['created_at'])
export class RiskLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  user_id: number;

  @Column({ type: 'integer', nullable: true })
  event_id: number | null;

  @Column({ type: 'varchar', length: 50 })
  risk_type: string;

  @Column({ type: 'integer', default: 0 })
  risk_score: number;

  @Column({ type: 'varchar', nullable: true, length: 45 })
  ip_address: string | null;

  @Column({ type: 'text', nullable: true })
  device_fingerprint: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
