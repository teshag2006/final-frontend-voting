import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
} from 'typeorm';
import { DeviceEntity } from './device.entity';

@Entity('device_anomalies')
@Index(['device_id'])
@Index(['flagged_at'])
export class DeviceAnomalyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  device_id: number;

  @ManyToOne(() => DeviceEntity, { onDelete: 'CASCADE' })
  device: DeviceEntity;

  @Column({ length: 100 })
  anomaly_type: string; // 'location_jump', 'timezone_change', 'new_device', etc.

  // Compatibility field (not persisted in canonical SQL)
  description?: string;

  @Column({ name: 'anomaly_score', type: 'numeric', precision: 5, scale: 2, nullable: true })
  risk_score: number;

  @Column({ name: 'is_suspicious', default: false })
  is_flagged: boolean;

  @Column({ name: 'detected_at', nullable: true })
  flagged_at: Date;

  @Column({ name: 'anomaly_details', type: 'jsonb', nullable: true })
  anomaly_data: Record<string, any>;

  // Canonical table uses detected_at and has no created_at/updated_at pair.
  created_at?: Date;
  updated_at?: Date;
}
