import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('velocity_violations')
@Index(['event_id'])
@Index(['device_id'])
@Index(['ip_address'])
@Index(['detected_at'])
export class VelocityViolationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  event_id: number;

  @Column()
  category_id: number;

  @Column()
  device_id: number;

  @Column({ nullable: true, length: 45 })
  ip_address: string;

  // Compatibility field (not persisted in canonical SQL)
  user_id?: number;

  // Compatibility field (not persisted in canonical SQL)
  device_fingerprint?: string;

  // Compatibility alias mapped to canonical storage
  get violation_type(): string {
    if (this.time_window_seconds <= 60) return 'per_minute';
    if (this.time_window_seconds <= 3600) return 'per_hour';
    return 'per_day';
  }

  set violation_type(value: string) {
    if (value === 'per_minute') this.time_window_seconds = 60;
    else if (value === 'per_hour') this.time_window_seconds = 3600;
    else this.time_window_seconds = 86400;
  }

  @Column({ name: 'vote_count' })
  violation_count: number;

  @Column({ name: 'time_window_seconds', default: 300 })
  time_window_seconds: number;

  // Compatibility alias
  get limit_count(): number {
    return this.time_window_seconds;
  }

  set limit_count(value: number) {
    this.time_window_seconds = value;
  }

  @Column({ type: 'enum', enum: ['low', 'medium', 'high', 'critical'], default: 'medium' })
  severity: string;

  @Column({ name: 'is_fraud', default: false })
  is_fraud: boolean;

  @CreateDateColumn({ name: 'detected_at' })
  detected_at: Date;

  // Compatibility field (not persisted in canonical SQL)
  description?: string;

  get created_at(): Date {
    return this.detected_at;
  }
}
