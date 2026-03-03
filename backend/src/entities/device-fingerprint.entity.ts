import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DeviceEntity } from './device.entity';

@Entity('device_fingerprints')
export class DeviceFingerprintEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DeviceEntity, (device) => device.fingerprints, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device: DeviceEntity;

  @Column({ nullable: true })
  device_id: number;

  @Column({ name: 'fingerprint_hash', length: 256 })
  fingerprint_hash: string;

  @Column({ type: 'varchar', nullable: true })
  canvas_fingerprint: string | null;

  @Column({ type: 'varchar', nullable: true })
  webgl_fingerprint: string | null;

  @Column({ type: 'varchar', nullable: true })
  audio_fingerprint: string | null;

  @Column({ name: 'font_fingerprint', type: 'varchar', nullable: true })
  font_hash: string | null;

  @Column({ name: 'screen_resolution', type: 'varchar', nullable: true })
  screen_resolution: string | null;

  @Column({ name: 'timezone', type: 'varchar', nullable: true })
  timezone: string | null;

  @Column({ name: 'language', type: 'varchar', nullable: true })
  language: string | null;

  @Column({ name: 'plugins', type: 'text', nullable: true })
  plugins: string | null;

  @Column({ name: 'confidence_score', type: 'numeric', precision: 5, scale: 2, nullable: true })
  confidence_score: number;

  // Compatibility fields (not persisted in DB)
  firmware_hash?: string;
  raw_fingerprint?: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  // Compatibility field (not persisted in DB)
  updated_at?: Date;
}
